import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatSocketContext = createContext<Socket | null>(null);

export const ChatSocketProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(process.env.EXPO_PUBLIC_API_URL!, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newSocket.on('connect_error', (_err) => {});

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token]);

  return (
    <ChatSocketContext.Provider value={socket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocketContext = () => useContext(ChatSocketContext);
