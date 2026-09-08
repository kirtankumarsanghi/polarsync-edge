import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

let socket: Socket | null = null;

export const initSocket = () => {
  if (typeof window === 'undefined') return null;
  if (socket) return socket;

  // Connect to local edge backend (proxied via Nginx on edge or direct port 4000)
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

  socket = io(socketUrl, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    timeout: 5000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to PolarSync Edge Telemetry Stream.');
    useStore.getState().setConnected(true);
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected from Edge stream. Operating in offline PWA cache.');
    useStore.getState().setConnected(false);
  });

  socket.on('telemetry_update', (data: any) => {
    if (data && data.telemetry) {
      useStore.getState().setTelemetry(data.telemetry);
    }
  });

  return socket;
};

export const getSocket = () => socket;
