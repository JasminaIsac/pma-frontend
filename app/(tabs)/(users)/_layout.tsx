import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";
import { colors, textPresets } from "@theme/index";
import { useTranslation } from "react-i18next";

const UserLayout = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('users.title'),
          headerRight: () => (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}
              onPress={() => router.push('/(tabs)/(users)/add')}
            >
              <Ionicons name="add" size={24} color={colors.darkBlue} />
              <Text style={{ color: colors.darkBlue, ...textPresets.bodyMediumBold, marginLeft: 5 }}>
                {t('users.addUser')}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="add" options={{ title: t('users.newUser') }} />
      <Stack.Screen name="view/[id]" options={{ title: t('users.details') }} />
      <Stack.Screen name="edit/[id]" options={{ title: t('users.edit') }} />
    </Stack>
  );
};

export default UserLayout;
