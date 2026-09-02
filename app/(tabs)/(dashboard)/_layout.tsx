import { TouchableOpacity, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, textPresets } from "@theme/index";
import { formatDateWithSuffix } from "@utils/index";
import { useTranslation } from "react-i18next";

export default function TaskStack() {
  const { t } = useTranslation();
  const router = useRouter();
  const today = formatDateWithSuffix(new Date());

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('dashboard.title'),
          headerRight: () => (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}
              onPress={() => router.push('/(tabs)/(dashboard)/(tasks)' as any)}
            >
              <Text style={[textPresets.bodyMediumBold, { color: colors.text.accentOrange, marginRight: 8 }]}>
                {today}
              </Text>
              <Ionicons name="calendar-outline" size={24} color={colors.mediumOrange} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="(tasks)"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="project/[id]" options={{ title: t('dashboard.projectDetails') }} />
      <Stack.Screen name="project-edit/[id]" options={{ title: t('projects.edit') }} />
      <Stack.Screen name="members/[id]" options={{ title: t('projects.members') }} />
    </Stack>
  );
}
