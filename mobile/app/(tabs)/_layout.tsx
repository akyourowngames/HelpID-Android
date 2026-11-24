import React from 'react';
import { Tabs } from 'expo-router/tabs';
import { FloatingTabBar } from '../../src/components/FloatingTabBar';
import { colors } from '../../src/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'ID' }} />
      <Tabs.Screen name="qr" options={{ title: 'QR' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
