import { useState, useRef, useCallback, useEffect } from 'react';
import type { Socket } from 'socket.io-client';

interface UseTypingIndicatorOptions {
  socket: Socket | null;
  conversationId: string;
  userId: string | undefined;
  userName: string | undefined;
}

export const useTypingIndicator = ({
  socket,
  conversationId,
  userId,
  userName,
}: UseTypingIndicatorOptions) => {
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setUserTyping = useCallback((uid: string, name: string) => {
    setTypingUsers(prev => ({ ...prev, [uid]: name }));
    if (typingTimeoutsRef.current[uid]) clearTimeout(typingTimeoutsRef.current[uid]);
    typingTimeoutsRef.current[uid] = setTimeout(() => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    }, 3000);
  }, []);

  const clearUserTyping = useCallback((uid: string) => {
    if (typingTimeoutsRef.current[uid]) clearTimeout(typingTimeoutsRef.current[uid]);
    setTypingUsers(prev => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  }, []);

  const handleTyping = useCallback(() => {
    if (!socket || !userId || !conversationId) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { conversationId, userId, name: userName });
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', { conversationId, userId });
    }, 1500);
  }, [socket, userId, userName, conversationId]);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current && userId && socket) {
      socket.emit('stop_typing', { conversationId, userId });
    }
    isTypingRef.current = false;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  }, [socket, conversationId, userId]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const typingNames = Object.values(typingUsers);
  const typingText =
    typingNames.length === 0
      ? null
      : typingNames.length === 1
      ? `${typingNames[0]} is typing...`
      : `${typingNames.join(', ')} are typing...`;

  return { typingText, handleTyping, stopTyping, setUserTyping, clearUserTyping, isTypingRef };
};
