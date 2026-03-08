import {
  AuthResponse,
  Profile,
  SwipeAction,
  MatchData,
  Message,
  GameCatalog,
  UserGame,
  ForumPost,
  ForumComment,
} from '@/types/api';

// API adresi: .env içinde EXPO_PUBLIC_API_URL ile override edebilirsiniz.
// Geliştirme: EXPO_PUBLIC_API_URL=http://BILGISAYAR_IP:3000/api (telefon ile PC aynı WiFi).
// Canlı: EXPO_PUBLIC_API_URL=https://api.ggwp.app/api (veya kendi sunucu URL'iniz).
const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? 'http://192.168.1.10:3000/api' : 'https://ggwp-api.onrender.com/api');

const REQUEST_TIMEOUT_MS = 60000;

function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT_MS, ...fetchOpts } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...fetchOpts, signal: controller.signal }).finally(() => clearTimeout(id));
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let userId: string | null = null;
let onTokenRefreshFailed: (() => void) | null = null;

export function setTokens(access: string, refresh: string, uid: string) {
  accessToken = access;
  refreshToken = refresh;
  userId = uid;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  userId = null;
}

export function setOnTokenRefreshFailed(cb: () => void) {
  onTokenRefreshFailed = cb;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers, timeout: REQUEST_TIMEOUT_MS });
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new ApiError(0, 'Sunucu yanıt vermedi. IP adresini ve sunucunun çalıştığını kontrol edin.');
    }
    throw new ApiError(0, 'Sunucuya bağlanılamıyor. İnternet ve API adresini (EXPO_PUBLIC_API_URL) kontrol edin.');
  }

  if (res.status === 401 && refreshToken && userId) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      const retry = await fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers, timeout: REQUEST_TIMEOUT_MS });
      if (!retry.ok) throw new ApiError(retry.status, await retry.text());
      return retry.json();
    } else {
      onTokenRefreshFailed?.();
      throw new ApiError(401, 'Oturum süresi doldu');
    }
  }

  if (!res.ok) {
    let body: string;
    try {
      const json = await res.json();
      const msg = json.message;
      body = Array.isArray(msg) ? (msg[0] || JSON.stringify(json)) : (msg || JSON.stringify(json));
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.status, body);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, refreshToken }),
      timeout: REQUEST_TIMEOUT_MS,
    });
    if (!res.ok) return false;
    const data = await res.json();
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// ─── Auth ────────────────────────────────────────────
export const authApi = {
  register(email: string, username: string, password: string, passwordConfirm: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password, passwordConfirm }),
    });
  },

  verifyEmail(token: string) {
    return request<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },

  resendVerificationEmail(email: string) {
    return request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  login(username: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  forgotPassword(email: string) {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(email: string, code: string, newPassword: string) {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },

  logout() {
    return request<void>('/auth/logout', { method: 'POST' });
  },
};

// ─── Profile ─────────────────────────────────────────
export const profileApi = {
  getMyProfile() {
    return request<Profile>('/profile');
  },

  updateProfile(data: Partial<Profile>) {
    return request<Profile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getProfileById(userId: string) {
    return request<Profile>(`/profile/${userId}`);
  },

  usePentakill() {
    return request<{ pentakillsLeft: number }>('/profile/pentakill/use', {
      method: 'POST',
    });
  },

  saveFilters(filters: {
    filterGender?: string;
    filterAgeMin?: number;
    filterAgeMax?: number;
    filterMicOnly?: boolean;
    filterPlayStyles?: string[];
    filterActivity?: string;
  }) {
    return request<Profile>('/profile/filters', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },

  activatePremium(planId: string) {
    return request<{ isPremium: boolean; premiumPlan: string; premiumExpiresAt: string }>('/profile/premium/activate', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  purchasePentakill(packageId: string) {
    return request<{ pentakillsLeft: number; added: number }>('/profile/pentakill/purchase', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    });
  },

  /** IAP: Apple/Google makbuzu ile satın almayı tamamla (Premium veya Pentakill). */
  iapComplete(platform: string, productId: string, receiptData: string) {
    return request<
      | { isPremium: boolean; premiumPlan: string; premiumExpiresAt: string }
      | { pentakillsLeft: number; added: number }
    >('/profile/iap/complete', {
      method: 'POST',
      body: JSON.stringify({ platform, productId, receiptData }),
    });
  },

  async uploadAvatar(uri: string): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);
    const base = API_BASE.replace(/\/api\/?$/, '');
    const res = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, text || 'Yükleme başarısız');
    }
    const data = await res.json();
    return { avatarUrl: data.avatarUrl };
  },
};

// ─── Games ──────────────────────────────────────────
export const gameApi = {
  getAll(category?: string) {
    const q = category ? `?category=${category}` : '';
    return request<GameCatalog[]>(`/games${q}`);
  },

  getMyGames() {
    return request<UserGame[]>('/games/my');
  },

  setMyGames(games: { gameId: string; rank?: string; role?: string }[]) {
    return request<UserGame[]>('/games/my', {
      method: 'POST',
      body: JSON.stringify({ games }),
    });
  },

  addGame(gameId: string, rank?: string, role?: string) {
    return request<UserGame>('/games/my/add', {
      method: 'POST',
      body: JSON.stringify({ gameId, rank, role }),
    });
  },

  removeGame(gameId: string) {
    return request<void>(`/games/my/${gameId}`, { method: 'DELETE' });
  },
};

// ─── Discover ────────────────────────────────────────
export const discoverApi = {
  getFeed(gameId: string | null | undefined, limit = 10) {
    const q = gameId ? `gameId=${gameId}&limit=${limit}` : `limit=${limit}`;
    return request<Profile[]>(`/discover?${q}`);
  },
};

// ─── Swipe ───────────────────────────────────────────
export const swipeApi = {
  swipe(toId: string, action: SwipeAction, gameId: string) {
    return request<{ swipe: any; matched: boolean; matchId: string | null }>('/swipe', {
      method: 'POST',
      body: JSON.stringify({ toId, action, gameId }),
    });
  },
};

// ─── Matches ─────────────────────────────────────────
export const matchApi = {
  getMatches(gameId?: string) {
    const q = gameId ? `?gameId=${gameId}` : '';
    return request<MatchData[]>(`/matches${q}`);
  },
};

// ─── Messages ────────────────────────────────────────
export const UPLOADS_BASE = API_BASE.replace(/\/api\/?$/, '');

export const messageApi = {
  getMessages(matchId: string, cursor?: string) {
    const q = cursor ? `?cursor=${cursor}` : '';
    return request<Message[]>(`/messages/${matchId}${q}`);
  },

  sendMessage(matchId: string, content: string, opts?: { audioUrl?: string }) {
    return request<Message>(`/messages/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ content, ...opts }),
    });
  },

  async uploadVoice(matchId: string, uri: string): Promise<{ audioUrl: string }> {
    const formData = new FormData();
    formData.append('audio', {
      uri,
      type: 'audio/mp4',
      name: 'voice.m4a',
    } as any);
    const res = await fetch(`${API_BASE}/messages/${matchId}/upload-voice`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, text || 'Ses yüklemesi başarısız');
    }
    const data = await res.json();
    return { audioUrl: data.audioUrl };
  },

  markAsRead(matchId: string) {
    return request<void>(`/messages/${matchId}/read`, { method: 'POST' });
  },
};

// ─── Notifications ───────────────────────────────────
export const notificationApi = {
  registerToken(pushToken: string) {
    return request<{ ok: boolean }>('/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify({ pushToken }),
    });
  },
};

// ─── Report ──────────────────────────────────────────
export const reportApi = {
  report(data: { reportedId: string; reason: string; details?: string; matchId?: string; messageId?: string }) {
    return request<{ id: string }>('/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ─── Forum ──────────────────────────────────────────
export const forumApi = {
  getPosts(gameId?: string, limit = 20, cursor?: string) {
    const params = new URLSearchParams();
    if (gameId) params.set('gameId', gameId);
    if (limit) params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    const q = params.toString() ? `?${params}` : '';
    return request<ForumPost[]>(`/forum${q}`);
  },

  getPost(postId: string) {
    return request<ForumPost>(`/forum/${postId}`);
  },

  createPost(data: { gameId: string; title: string; content: string; linkUrl?: string }) {
    return request<ForumPost>('/forum', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  addComment(postId: string, content: string) {
    return request<ForumComment>(`/forum/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  toggleLike(postId: string) {
    return request<{ liked: boolean }>(`/forum/${postId}/like`, {
      method: 'POST',
    });
  },

  reportPost(postId: string, reason: string) {
    return request<{ ok: boolean }>(`/forum/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  deletePost(postId: string) {
    return request<{ ok: boolean }>(`/forum/${postId}`, {
      method: 'DELETE',
    });
  },
};
