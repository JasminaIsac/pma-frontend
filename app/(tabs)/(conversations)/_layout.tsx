import { useEffect } from "react";
import { Stack } from "expo-router";
import { useNavigationState } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { ChatSocketProvider } from "@contexts/ChatSocketContext";
import { setTabBarHidden } from "@utils/tabBarVisibility";

export default function ConversationStack() {
  const { t } = useTranslation();

  const activeScreen = useNavigationState((state: any) => {
    const conv = state?.routes?.find((r: any) => r.name === '(conversations)');
    const stackState = conv?.state;
    if (!stackState?.routes?.length) return 'index';
    return stackState.routes[stackState.index ?? stackState.routes.length - 1]?.name ?? 'index';
  });

  useEffect(() => {
    setTabBarHidden(activeScreen !== 'index');
    return () => setTabBarHidden(false);
  }, [activeScreen]);

  return (
    <ChatSocketProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: t('conversations.title') }} />
        <Stack.Screen name="messages/[id]" options={{}} />
        <Stack.Screen name="add" options={{ title: t('conversations.newConversation') }} />
        <Stack.Screen name="settings/[id]" options={{ title: t('conversations.settings') }} />
        <Stack.Screen name="user/[id]" options={{ title: t('conversations.profile') }} />
        <Stack.Screen name="project/[id]" options={{ title: t('conversations.project') }} />
      </Stack>
    </ChatSocketProvider>
  );
}
