export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type PlayStyle = 'TRYHARD' | 'CHILL' | 'COMPETITIVE' | 'CASUAL' | 'TEAM_PLAYER' | 'EXPLORER';
export type GameLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SwipeAction = 'LIKE' | 'DISLIKE' | 'PENTAKILL';
export type GameCategory =
  | 'FPS'
  | 'MOBA'
  | 'RPG'
  | 'BATTLE_ROYALE'
  | 'SANDBOX'
  | 'SPORTS'
  | 'STRATEGY'
  | 'OTHER';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: Gender;
  playStyle?: PlayStyle;
  gameLevel?: GameLevel;
  usesMic: boolean;
  bio?: string;
  isPremium?: boolean;
  premiumPlan?: string;
  premiumExpiresAt?: string;
  pentakillsLeft?: number;
  dailyLikesUsed?: number;
  lastLikeResetAt?: string;
  filterGender?: string;
  filterAgeMin?: number;
  filterAgeMax?: number;
  filterMicOnly?: boolean;
  filterPlayStyles?: string[];
  filterActivity?: string;
  user?: User & { userGames?: UserGame[] };
  compatibilityScore?: number;
}

export interface GameCatalog {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  category: GameCategory;
}

export interface UserGame {
  id: string;
  userId: string;
  gameId: string;
  game: GameCatalog;
  rank?: string;
  role?: string;
  hoursPlayed?: number;
  note?: string;
}

export interface MatchData {
  matchId: string;
  game: GameCatalog;
  createdAt: string;
  otherUser: { id: string; username: string; profile?: Profile };
  lastMessage?: Message;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: { id: string; username: string };
}

export interface ForumPost {
  id: string;
  authorId: string;
  gameId: string;
  title: string;
  content: string;
  linkUrl?: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: { id: string; username: string; profile?: Profile };
  game: GameCatalog;
  comments?: ForumComment[];
  _count?: { comments: number; likes: number };
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; profile?: Profile };
}

export interface AuthResponse {
  user: { id: string; username: string; email: string };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  requireVerification: true;
  email: string;
}
