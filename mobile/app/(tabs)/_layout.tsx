import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '@/constants/theme';
import { View, StyleSheet } from 'react-native';
import { useProfileStore } from '@/stores/profileStore';

export default function TabLayout() {
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'KEŞFET',
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'OYUNLAR',
          tabBarIcon: ({ color }) => (
            <Ionicons name="game-controller-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'TOPLULUK',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'SOHBETLER',
          tabBarIcon: ({ color }) => (
            <View>
              <Ionicons name="chatbubble-outline" size={24} color={color} />
              <View style={styles.dot} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFİL',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5 },
  dot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
});
