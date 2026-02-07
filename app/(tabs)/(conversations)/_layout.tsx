import { Stack } from "expo-router";

export default function ConversationStack() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Conversations" }}/>
      <Stack.Screen name="messages/[id]" options={{ title: "Messages" }} />
      <Stack.Screen name="add" options={{ title: "New Conversation" }} />
    </Stack>
  );
}
