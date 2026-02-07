import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@contexts/AuthContext';
import useToastNotification from './useToastNotification';

export const useChatSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const { showError } = useToastNotification();

  useEffect(() => {
    if (!token) return;
    // Inițializare socket
    const socket = io(process.env.EXPO_PUBLIC_API_URL!, {
      auth: { token },
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      // showError('Network error', 'Please make sure your device is connected to the internet.');
    });

    // Cleanup la demontarea componentei sau schimbarea token-ului
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  return socketRef.current;
};