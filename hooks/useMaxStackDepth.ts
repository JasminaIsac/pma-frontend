import { useEffect } from 'react';
import { useNavigation } from 'expo-router';

export const useMaxStackDepth = (maxDepth = 5) => {
  const navigation = useNavigation();

  useEffect(() => {
    return navigation.addListener('state', () => {
      const state = navigation.getState();
      if (!state?.routes || state.routes.length <= maxDepth) return;

      (navigation as any).reset({
        index: maxDepth - 1,
        routes: [
          state.routes[0],
          ...state.routes.slice(-(maxDepth - 1)),
        ],
      });
    });
  }, [navigation, maxDepth]);
};
