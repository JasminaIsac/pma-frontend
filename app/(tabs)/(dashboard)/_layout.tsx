import { TouchableOpacity, Text } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, textPresets } from "@theme/index";
import { formatDateWithSuffix } from "@utils/index";

export default function TaskStack() {
  const today = formatDateWithSuffix(new Date());
  
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerRight: () => (
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
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
    </Stack>
  );
}
