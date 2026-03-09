import { io, Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';

const WS_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') ||
  (__DEV__ ? 'http://192.168.1.10:3000' : 'https://ggwp-api.onrender.com');

let socket: Socket | null = null;
let currentToken: string | null = null;
let activeMatchId: string | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function setActiveChatMatchId(matchId: string | null) {
  activeMatchId = matchId;
}

export function getActiveChatMatchId(): string | null {
  return activeMatchId;
}

export function connectSocket(token: string) {
  if (socket?.connected && currentToken === token) return;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  socket = io(WS_BASE, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.log('[Socket] Connection error:', err.message);
  });

  const handleAppState = (state: AppStateStatus) => {
    if (state === 'active' && socket && !socket.connected) {
      socket.connect();
    }
  };
  AppState.addEventListener('change', handleAppState);
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
  activeMatchId = null;
}

export function joinMatchRoom(matchId: string) {
  if (socket?.connected) {
    socket.emit('joinMatch', { matchId });
  }
}

export function leaveMatchRoom(matchId: string) {
  if (socket?.connected) {
    socket.emit('leaveMatch', { matchId });
  }
}
