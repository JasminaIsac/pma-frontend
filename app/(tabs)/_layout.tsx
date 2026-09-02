import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { UserRole } from "schemas";
import { useMe } from "@hooks/queries/useMe";
import { LoadingIndicator } from '@components/index';
import { useTranslation } from 'react-i18next';
import { emitProjectsTabPress } from '@utils/projectsReset';
import { onTabBarVisibilityChange } from '@utils/tabBarVisibility';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/index';

function TabsContent({ canViewUsersTab }: { canViewUsersTab: boolean }) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const [tabBarHidden, setTabBarHidden] = useState(false);

  useEffect(() => onTabBarVisibilityChange(setTabBarHidden), []);

  const tabBarStyle = {
    backgroundColor: colors.background.primary,
    borderTopWidth: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    height: 68 + bottom,
    paddingBottom: bottom + 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 14,
  };

  return (
    <Tabs
      initialRouteName="(dashboard)"
      screenOptions={{
        tabBarActiveTintColor: colors.mediumOrange,
        tabBarInactiveTintColor: colors.navigation.inactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: tabBarHidden ? { display: 'none' } : tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: t('dashboard.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('(dashboard)', { screen: 'index' });
          },
        })}
      />

      <Tabs.Screen
        name="(projects)"
        options={{
          title: t('projects.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            emitProjectsTabPress();
            navigation.navigate('(projects)', { screen: 'index' });
          },
        })}
      />

      <Tabs.Screen
        name="(conversations)"
        options={{
          title: t('conversations.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
          ),
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('(conversations)', { screen: 'index' });
          },
        })}
      />

      <Tabs.Screen
        name="(users)"
        options={{
          title: t('users.title'),
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
          ),
          href: canViewUsersTab ? "/(tabs)/(users)" : null,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('(users)', { screen: 'index' });
          },
        })}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('(profile)', { screen: 'index' });
          },
        })}
      />
    </Tabs>
  );
}

export default function TabsLayout(): React.ReactElement {
  const { data: user, isLoading } = useMe();

  const canViewUsersTab =
    user?.role === UserRole.ROOT ||
    user?.role === UserRole.ADMIN;

  if (!user || isLoading) {
    return <LoadingIndicator />;
  }

  return <TabsContent canViewUsersTab={canViewUsersTab} />;
}
