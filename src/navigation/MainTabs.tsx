import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { HomeScreen } from '../screens/home/HomeScreen';
import { mainTabRoutes } from './routeConfig';
import type { MainTabParamList, MainTabRouteName } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function renderTabIcon(routeName: MainTabRouteName, focused: boolean) {
  return (
    <Text style={[styles.tabIcon, focused ? styles.activeIcon : styles.icon]}>
      {routeName === 'Home' ? 'AI' : 'Me'}
    </Text>
  );
}

export function MainTabs() {
  const [homeSidebarVisible, setHomeSidebarVisible] = useState(false);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarStyle: {
          borderTopColor: '#e2e8f0',
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      {mainTabRoutes.map(route => {
        const RouteComponent = route.component;

        return (
          <Tab.Screen
            key={route.name}
            name={route.name}
            options={{
              tabBarLabel: route.tabLabel ?? route.name,
              tabBarIcon: ({ focused }) => renderTabIcon(route.name, focused),
            }}>
            {() => (
              <ScreenLayout
                headerLeft={route.headerLeft}
                headerShown={route.headerShown}
                onHeaderLeftPress={() => {
                  if (route.name === 'Home') {
                    setHomeSidebarVisible(true);
                  }
                }}
                routeName={route.name}>
                {route.name === 'Home' ? (
                  <HomeScreen
                    onCloseSidebar={() => setHomeSidebarVisible(false)}
                    sidebarVisible={homeSidebarVisible}
                  />
                ) : (
                  <RouteComponent />
                )}
              </ScreenLayout>
            )}
          </Tab.Screen>
        );
      })}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 13,
    fontWeight: '800',
  },
  activeIcon: {
    color: '#2563eb',
  },
  icon: {
    color: '#64748b',
  },
});
