import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { AgentManagementScreen } from '../screens/settings/AgentManagementScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { MainTabs } from './MainTabs';
import { rootNavigationRef } from './rootNavigation';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer ref={rootNavigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          contentStyle: { backgroundColor: '#f5f7fb' },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: '登录' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: '注册' }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen
          name="AgentManagement"
          component={AgentManagementScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
