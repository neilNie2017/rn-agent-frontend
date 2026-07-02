import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Trash2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { HomeScreen } from '../screens/home/HomeScreen';
import {
  deleteChatApi,
  getChatsApi,
  type ChatSummary,
  type ChatsResponse,
} from '../request/ai';
import { rootNavigationRef } from './rootNavigation';

type Conversation = {
  id: string;
  title: string;
  time: string;
};

type ParsedChats = {
  hasMore?: boolean;
  items: ChatSummary[];
  total?: number;
};

const PAGE_SIZE = 10;
const SIDEBAR_WIDTH = 340;

function parseChatsResponse(response: ChatsResponse): ParsedChats {
  if (Array.isArray(response)) {
    return { items: response };
  }

  if (Array.isArray(response.data)) {
    return { items: response.data, total: response.total };
  }

  const data = response.data;

  return {
    items:
      data?.items ??
      data?.records ??
      data?.chats ??
      data?.list ??
      response.records ??
      response.chats ??
      response.list ??
      [],
    hasMore: data?.hasMore,
    total: data?.total ?? response.total,
  };
}

function formatChatTime(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function toConversation(chat: ChatSummary): Conversation {
  const id = chat.id ?? chat.chatId ?? String(Date.now());

  return {
    id,
    title: chat.title ?? chat.name ?? '未命名会话',
    time: formatChatTime(chat.updatedAt ?? chat.createdAt),
  };
}

export function MainTabs() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [selectedChatTitle, setSelectedChatTitle] = useState('');
  const [current, setCurrent] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState('');
  const [chatError, setChatError] = useState('');
  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const filteredConversations = useMemo(
    () =>
      conversations.filter(item =>
        item.title.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [conversations, search],
  );

  async function loadChats(page: number, mode: 'initial' | 'refresh' | 'more') {
    if (mode === 'more' && (loadingMore || !hasMore)) {
      return;
    }

    if (mode === 'initial') {
      setInitialLoading(true);
    }

    if (mode === 'refresh') {
      setRefreshing(true);
    }

    if (mode === 'more') {
      setLoadingMore(true);
    }

    setChatError('');

    try {
      const response = await getChatsApi({ current: page, pageSize: PAGE_SIZE });
      const parsed = parseChatsResponse(response);
      const nextConversations = parsed.items.map(toConversation);

      setConversations(prev =>
        page === 1 ? nextConversations : [...prev, ...nextConversations],
      );
      setCurrent(page);

      const loadedCount =
        page === 1
          ? nextConversations.length
          : conversations.length + nextConversations.length;

      setHasMore(
        typeof parsed.hasMore === 'boolean'
          ? parsed.hasMore
          : typeof parsed.total === 'number'
          ? loadedCount < parsed.total
          : nextConversations.length >= PAGE_SIZE,
      );
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : '会话列表加载失败',
      );
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (sidebarVisible) {
      loadChats(1, 'initial');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarVisible]);

  useEffect(() => {
    if (sidebarVisible) {
      setSidebarMounted(true);
      Animated.timing(sidebarAnim, {
        duration: 220,
        toValue: 1,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(sidebarAnim, {
      duration: 180,
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSidebarMounted(false);
      }
    });
  }, [sidebarAnim, sidebarVisible]);

  function closeSidebar() {
    setSidebarVisible(false);
  }

  function openProfile() {
    rootNavigationRef.navigate('Profile');
  }

  function handleRefresh() {
    loadChats(1, 'refresh');
  }

  function handleLoadMore() {
    if (!initialLoading && !refreshing && !loadingMore && hasMore) {
      loadChats(current + 1, 'more');
    }
  }

  function handleOpenConversation(chatId: string) {
    const conversation = conversations.find(item => item.id === chatId);

    setSelectedChatId(chatId);
    setSelectedChatTitle(conversation?.title ?? '');
    closeSidebar();
  }

  function handleDeleteConversation(item: Conversation) {
    Alert.alert('删除会话', `确定删除「${item.title}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          setDeletingChatId(item.id);

          try {
            await deleteChatApi(item.id);
            await loadChats(1, 'refresh');

            if (selectedChatId === item.id) {
              setSelectedChatId(undefined);
              setSelectedChatTitle('');
            }
          } catch (error) {
            Alert.alert(
              '删除失败',
              error instanceof Error ? error.message : '请稍后重试。',
            );
          } finally {
            setDeletingChatId('');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScreenLayout
        headerLeft="sidebar"
        headerRight="profile"
        onHeaderLeftPress={() => setSidebarVisible(true)}
        onHeaderRightPress={openProfile}
        routeName={selectedChatTitle || 'Home'}>
        <HomeScreen
          onChatTitleChange={setSelectedChatTitle}
          selectedChatId={selectedChatId}
        />
      </ScreenLayout>

      {sidebarMounted ? (
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            onPress={closeSidebar}
            style={styles.backdropPressable}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: sidebarAnim,
                },
              ]}
            />
          </Pressable>
          <Animated.View
            style={[
              styles.sidebar,
              {
                paddingTop: insets.top + 16,
                transform: [
                  {
                    translateX: sidebarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-SIDEBAR_WIDTH, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>最近会话</Text>
              <Pressable
                accessibilityLabel="关闭侧边栏"
                accessibilityRole="button"
                onPress={closeSidebar}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed ? styles.pressed : null,
                ]}>
                <X color="#334155" size={22} strokeWidth={2.4} />
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
            {initialLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#2563eb" size="small" />
                <Text style={styles.loadingText}>加载最近会话...</Text>
              </View>
            ) : null}
            {chatError ? (
              <Text style={styles.errorText}>{chatError}</Text>
            ) : null}
            <FlatList
              contentContainerStyle={styles.conversationList}
              data={filteredConversations}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                !initialLoading && !chatError ? (
                  <Text style={styles.emptyText}>暂无会话</Text>
                ) : null
              }
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator color="#2563eb" size="small" />
                  </View>
                ) : null
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleOpenConversation(item.id)}
                  style={[
                    styles.conversationItem,
                    selectedChatId === item.id
                      ? styles.activeConversation
                      : null,
                  ]}>
                  <View style={styles.conversationContent}>
                    <Text numberOfLines={1} style={styles.conversationTitle}>
                      {item.title}
                    </Text>
                    {item.time ? (
                      <Text style={styles.conversationTime}>{item.time}</Text>
                    ) : null}
                  </View>
                  <Pressable
                    accessibilityLabel="删除会话"
                    accessibilityRole="button"
                    disabled={deletingChatId === item.id}
                    onPress={() => handleDeleteConversation(item)}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed ? styles.pressed : null,
                    ]}>
                    {deletingChatId === item.id ? (
                      <ActivityIndicator color="#dc2626" size="small" />
                    ) : (
                      <Trash2 color="#dc2626" size={17} strokeWidth={2.2} />
                    )}
                  </Pressable>
                </Pressable>
              )}
            />
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  backdropPressable: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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
    bottom: 0,
    elevation: 12,
    left: 0,
    padding: 16,
    position: 'absolute',
    shadowColor: '#0f172a',
    shadowOffset: { height: 8, width: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    top: 0,
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
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    paddingVertical: 8,
  },
  conversationList: {
    gap: 10,
    paddingTop: 16,
  },
  conversationItem: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  activeConversation: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  conversationContent: {
    flex: 1,
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
  deleteButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  footerLoading: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
