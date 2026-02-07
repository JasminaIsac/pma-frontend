import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";
import { colors, textPresets } from "@theme/index";

const UserLayout = () => {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "All Users", 
          headerRight: () =>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15}} onPress={() => router.push('/add')}>
              <Ionicons name="add" size={24} color={colors.darkBlue} />
              <Text style={{ color: colors.darkBlue, ...textPresets.bodyMediumBold, marginLeft: 5 }}>Add User</Text>
            </TouchableOpacity>
        }} />
      <Stack.Screen name="add" options={{ title: "New User" }} />
      <Stack.Screen name="view/[id]" options={{ title: "User Details" }} />
      <Stack.Screen name="edit/[id]" options={{ title: "Edit User" }} />
    </Stack>
  );
}

export default UserLayout;