import { TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileStack() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "My Profile",
          headerRight: () => (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}
            >
              <TouchableOpacity onPress={() => router.push('/edit')}>
                <Ionicons
                  name="pencil"
                  size={22}
                  color="black"
                  style={{ marginRight: 15 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/settings')}>
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color="black"
                  style={{ marginRight: 15 }}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="edit/index"
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "Settings" }}
      />
    </Stack>
  );
}
