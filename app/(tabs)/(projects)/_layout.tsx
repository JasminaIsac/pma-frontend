import { Stack } from "expo-router";
import { View, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@theme/colors";
import { CustomButton } from "@components/index";
import { router } from "expo-router";
import { UserRole } from "schemas";
import { useMe } from "@hooks/queries/useMe";
import { useTranslation } from "react-i18next";

export default function ProjectLayout(): React.ReactElement {
  const { data: user } = useMe();
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('projects.title'),
          headerRight: () =>
            user && user.role !== UserRole.DEVELOPER && (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 15 }}>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/(projects)/add')}
                  style={{ marginRight: 10, padding: 4 } as StyleProp<ViewStyle>}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={24} color={colors.darkBlue} />
                </TouchableOpacity>
                <CustomButton
                  title={t('projects.categories')}
                  style={{ height: 40, elevation: 0 }}
                  onPress={() => router.push('/(tabs)/(projects)/categories')}
                />
              </View>
            ),
        }}
      />
      <Stack.Screen name="add" options={{ title: t('projects.addProject') }} />
      <Stack.Screen name="view/[id]" options={{ title: t('projects.details') }} />
      <Stack.Screen name="task/[id]" options={{ title: t('tasks.details') }} />
      <Stack.Screen name="task/add" options={{ title: t('tasks.addTask') }} />
      <Stack.Screen name="task/edit/[id]" options={{ title: t('tasks.edit') }} />
      <Stack.Screen name="edit/[id]" options={{ title: t('projects.edit') }} />
      <Stack.Screen name="members/[id]" options={{ title: t('projects.members') }} />
      <Stack.Screen name="categories/index" options={{ title: t('projects.allCategories') }} />
    </Stack>
  );
}
