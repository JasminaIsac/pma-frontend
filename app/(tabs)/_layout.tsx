import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { UserRole } from "schemas";
import { useMe } from "@hooks/queries/useMe";
import { LoadingIndicator} from '@components/index';

export default function TabsLayout(): React.ReactElement {
  const { data: user, isLoading } = useMe();

  const canViewUsersTab =
    user?.role === UserRole.ROOT ||
    user?.role === UserRole.ADMIN;

  if (!user || isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Tabs initialRouteName="(dashboard)">
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="(projects)"
        options={{
          title: "Projects",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="(conversations)"
        options={{
          title: "Conversations",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      
      <Tabs.Screen
        name="(users)"
        options={{
          title: "Users",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          href: canViewUsersTab ? "/(tabs)/(users)" : null,
        }}
      />
      
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
