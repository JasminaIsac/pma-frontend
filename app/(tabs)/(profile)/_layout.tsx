import { TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function ProfileStack() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('profile.title'),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/(profile)/edit')}>
                <Ionicons name="pencil" size={22} color="black" style={{ marginRight: 15 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/(profile)/settings')}>
                <Ionicons name="settings-outline" size={22} color="black" style={{ marginRight: 15 }} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen name="edit/index" options={{ title: t('profile.editProfile') }} />
      <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
    </Stack>
  );
}
