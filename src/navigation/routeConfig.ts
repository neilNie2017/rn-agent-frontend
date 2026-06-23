import type { ComponentType } from 'react';
import type { MainTabRouteName } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

export type TabRouteConfig = {
  name: MainTabRouteName;
  component: ComponentType<any>;
  tabLabel?: string;
  headerShown?: boolean;
  headerLeft?: 'sidebar';
};

export const mainTabRoutes: TabRouteConfig[] = [
  {
    name: 'Home',
    component: HomeScreen,
    tabLabel: '首页',
    headerLeft: 'sidebar',
  },
  {
    name: 'Profile',
    component: ProfileScreen,
    tabLabel: '我的',
  },
];
