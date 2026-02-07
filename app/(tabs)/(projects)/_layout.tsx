import { Stack } from "expo-router";
import { View, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@theme/colors";
import { CustomButton, LoadingIndicator } from "@components/index";
import { router } from "expo-router";
import { UserRole } from "schemas";
import { useMe } from "@hooks/queries/useMe";

export default function ProjectLayout(): React.ReactElement {
  const { data:user, isLoading } = useMe();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Projects",
          headerRight: () =>
            user?.role !== UserRole.DEVELOPER && (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 15 }}>
                <TouchableOpacity
                  onPress={() => router.push("add")}
                  style={{ marginRight: 10, padding: 4 } as StyleProp<ViewStyle>}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={24} color={colors.darkBlue} />
                </TouchableOpacity>
                <CustomButton
                  title="Categories"
                  style={{ height: 40, elevation: 0 }}
                  onPress={() => router.push("categories")}
                />
              </View>
            ),
        }}
      />
      <Stack.Screen name="add" options={{ title: "New Project" }} />
      <Stack.Screen name="view/[id]" options={{ title: "Project Details" }} />
      <Stack.Screen name="edit/[id]" options={{ title: "Edit Project" }} />
      <Stack.Screen name="members/[id]" options={{ title: "Project Members" }} />
      <Stack.Screen name="categories/index" options={{ title: "Categories" }} />
    </Stack>
  );
}
