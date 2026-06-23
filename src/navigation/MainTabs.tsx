import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { HomeScreen } from '../screens/home/HomeScreen';
import { mainTabRoutes } from './routeConfig';
import type { MainTabParamList, MainTabRouteName } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type Conversation = {
  id: string;
  title: string;
  time: string;
};

const conversations: Conversation[] = [
  { id: '1', title: 'RN 项目初始化', time: '刚刚' },
  { id: '2', title: '登录注册流程', time: '10 分钟前' },
  { id: '3', title: '接口环境配置', time: '昨天' },
  { id: '4', title: '首页交互草稿', time: '周一' },
];

const tabIcons: Record<MainTabRouteName, string> = { Home: 'AI', Profile: 'Me' };

/* ─── 自定义动画 Tab Bar ─── */
function CustomTabBar({
  state,
  navigation,
}: {
  state: { index: number; routes: Array<{ key: string; name: string }> };
  navigation: any;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [layoutWidth, setLayoutWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const routeIndex = state.index;

  useEffect(() => {
    if (layoutWidth > 0) {
      const tabWidth = layoutWidth / state.routes.length;
      Animated.spring(translateX, {
        toValue: routeIndex * tabWidth + tabWidth / 2,
        useNativeDriver: true,
        tension: 90,
        friction: 13,
      }).start();
    }
  }, [routeIndex, layoutWidth, translateX, state.routes.length]);

  return (
    <View
      style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      onLayout={e => setLayoutWidth(e.nativeEvent.layout.width)}>
      {/* 滑动胶囊指示器 */}
      <Animated.View
        style={[
          styles.pill,
          {
            transform: [
              { translateX: translateX },
              { translateX: -styles.pill.width! / 2 },
            ],
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const isFocused = index === routeIndex;
        const iconName = tabIcons[route.name as MainTabRouteName] ?? route.name;
        const tabLabel =
          mainTabRoutes.find(r => r.name === route.name)?.tabLabel ?? route.name;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              navigation.navigate(route.name);
            }}
            style={styles.tabItem}>
            {/* 图标容器 */}
            <View
              style={[
                styles.iconWrap,
                isFocused ? styles.iconWrapActive : styles.iconWrapInactive,
              ]}>
              <Text
                style={[
                  styles.iconText,
                  isFocused ? styles.iconTextActive : styles.iconTextInactive,
                ]}>
                {iconName}
              </Text>
            </View>

            {/* 标签 */}
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}>
              {tabLabel}
            </Text>

            {/* 选中圆点 */}
            <View
              style={[
                styles.dot,
                isFocused ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

/* ─── 主组件 ─── */
export function MainTabs() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  const filteredConversations = useMemo(
    () =>
      conversations.filter(item =>
        item.title.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search],
  );

  function closeSidebar() {
    setSidebarVisible(false);
  }

  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}>
        {mainTabRoutes.map(route => {
          const RouteComponent = route.component;

          return (
            <Tab.Screen
              key={route.name}
              name={route.name}
              options={{
                tabBarLabel: route.tabLabel ?? route.name,
                tabBarIcon: () => null,
              }}>
              {() => (
                <ScreenLayout
                  headerLeft={route.headerLeft}
                  headerShown={route.headerShown}
                  onHeaderLeftPress={() => {
                    if (route.name === 'Home') {
                      setSidebarVisible(true);
                    }
                  }}
                  routeName={route.name}>
                  <RouteComponent />
                </ScreenLayout>
              )}
            </Tab.Screen>
          );
        })}
      </Tab.Navigator>

      {/* ── 全屏侧边栏（覆盖 header + tab bar） ── */}
      {sidebarVisible ? (
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            onPress={closeSidebar}
            style={styles.backdrop}
          />
          <View style={[styles.sidebar, { paddingTop: insets.top + 16 }]}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>最近会话</Text>
              <Pressable
                accessibilityRole="button"
                onPress={closeSidebar}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed ? styles.pressed : null,
                ]}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
            <TextInput
              autoCapitalize="none"
              onChangeText={setSearch}
              placeholder="搜索会话"
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              value={search}
            />
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#2563eb" size="small" />
              <Text style={styles.loadingText}>加载最近会话...</Text>
            </View>
            <FlatList
              contentContainerStyle={styles.conversationList}
              data={filteredConversations}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Pressable style={styles.conversationItem}>
                  <Text numberOfLines={1} style={styles.conversationTitle}>
                    {item.title}
                  </Text>
                  <Text style={styles.conversationTime}>{item.time}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const PILL_W = 52;
const PILL_H = 32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ─── Tab Bar ─── */
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e2e8f0',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: 6,
  },
  pill: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    height: PILL_H,
    position: 'absolute',
    top: 4,
    width: PILL_W,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    paddingVertical: 2,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 52,
  },
  iconWrapActive: {
    backgroundColor: '#2563eb',
  },
  iconWrapInactive: {
    backgroundColor: 'transparent',
  },
  iconText: {
    fontSize: 13,
    fontWeight: '800',
  },
  iconTextActive: {
    color: '#ffffff',
  },
  iconTextInactive: {
    color: '#94a3b8',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#2563eb',
  },
  tabLabelInactive: {
    color: '#94a3b8',
  },
  dot: {
    borderRadius: 2,
    height: 4,
    marginTop: 2,
    width: 4,
  },
  dotActive: {
    backgroundColor: '#2563eb',
  },
  dotInactive: {
    backgroundColor: 'transparent',
  },

  /* ─── 侧边栏 ─── */
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sidebar: {
    backgroundColor: '#ffffff',
    borderRightColor: '#e2e8f0',
    borderRightWidth: 1,
    elevation: 12,
    flex: 1,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { height: 8, width: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    width: '82%',
  },
  sidebarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sidebarTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  pressed: {
    backgroundColor: '#eef2ff',
  },
  closeText: {
    color: '#334155',
    fontSize: 26,
    lineHeight: 28,
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#d8e0ec',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    height: 42,
    paddingHorizontal: 12,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 13,
  },
  conversationList: {
    gap: 10,
    paddingTop: 16,
  },
  conversationItem: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  conversationTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  conversationTime: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
});
