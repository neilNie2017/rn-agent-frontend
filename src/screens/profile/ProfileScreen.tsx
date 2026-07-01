import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bot, LogOut, Palette } from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import { useTheme, chatThemes } from '../../context/ThemeContext';
import { clearAuthToken } from '../../request/http';
import { rootNavigationRef } from '../../navigation/rootNavigation';
import {
  clearCachedUser,
  getCachedUser,
  type CachedUser,
} from '../../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const fallbackUser: CachedUser = {
  name: 'User',
  email: '',
  role: '用户',
};

function getDisplayName(user: CachedUser) {
  return user.name || user.email || 'User';
}

export function ProfileScreen({ navigation }: Props) {
  const { theme, setTheme } = useTheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [user, setUser] = useState<CachedUser>(fallbackUser);

  useEffect(() => {
    let ignored = false;

    async function loadUser() {
      const cachedUser = await getCachedUser();

      if (!ignored && cachedUser) {
        setUser(cachedUser);
      }
    }

    loadUser();

    return () => {
      ignored = true;
    };
  }, []);

  function handleLogout() {
    Alert.alert('退出登录', '确定要退出当前账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          clearAuthToken();
          await clearCachedUser();
          rootNavigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getDisplayName(user).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{getDisplayName(user)}</Text>
          {user.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
        </View>
        {user.role ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{String(user.role)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Pressable
          onPress={() => setThemeModalVisible(true)}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, styles.chatThemeIcon]}>
              <Palette color="#2563eb" size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>聊天主题</Text>
              <Text style={styles.menuValue}>{theme.name}</Text>
            </View>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={() => navigation.navigate('AgentManagement')}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, styles.agentIcon]}>
              <Bot color="#16a34a" size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>智能体管理</Text>
              <Text style={styles.menuValue}>配置你的 AI 助手</Text>
            </View>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.logoutBtnPressed,
          ]}>
          <LogOut color="#dc2626" size={18} strokeWidth={2.2} />
          <Text style={styles.logoutText}>退出登录</Text>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => setThemeModalVisible(false)}
        transparent
        visible={themeModalVisible}>
        <Pressable
          onPress={() => setThemeModalVisible(false)}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalSheet}>
            <Text style={styles.modalTitle}>选择聊天主题</Text>
            <View style={styles.themeGrid}>
              {chatThemes.map(t => (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setTheme(t);
                    setThemeModalVisible(false);
                  }}
                  style={[
                    styles.themeOption,
                    theme.id === t.id && styles.themeOptionActive,
                  ]}>
                  <View
                    style={[styles.themePreview, { backgroundColor: t.preview }]}
                  />
                  <Text
                    style={[
                      styles.themeName,
                      theme.id === t.id && styles.themeNameActive,
                    ]}>
                    {t.name}
                  </Text>
                  {theme.id === t.id ? (
                    <Text style={styles.themeCheck}>✓</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  userCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 20,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    gap: 4,
    marginLeft: 14,
  },
  userName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    color: '#64748b',
    fontSize: 13,
  },
  badge: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemPressed: {
    backgroundColor: '#f8fafc',
  },
  menuLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  menuIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  chatThemeIcon: {
    backgroundColor: '#eff6ff',
  },
  agentIcon: {
    backgroundColor: '#f0fdf4',
  },
  menuTextWrap: {
    gap: 2,
  },
  menuLabel: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  menuValue: {
    color: '#64748b',
    fontSize: 12,
  },
  menuArrow: {
    color: '#94a3b8',
    fontSize: 24,
    fontWeight: '400',
  },
  divider: {
    backgroundColor: '#f1f5f9',
    height: 1,
    marginHorizontal: 16,
  },
  logoutBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutBtnPressed: {
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 0,
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    paddingVertical: 14,
    width: '47%',
  },
  themeOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  themePreview: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  themeName: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  themeNameActive: {
    color: '#2563eb',
  },
  themeCheck: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '800',
    position: 'absolute',
    right: 10,
    top: 10,
  },
});
