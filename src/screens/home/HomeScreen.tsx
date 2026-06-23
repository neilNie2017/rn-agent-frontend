import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type HomeScreenProps = {
  onCloseSidebar: () => void;
  sidebarVisible: boolean;
};

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

type Conversation = {
  id: string;
  title: string;
  time: string;
};

const messages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: '你好，我是你的 AI 助手。今天想聊点什么？',
  },
  {
    id: '2',
    role: 'user',
    text: '先帮我搭一个移动端对话页面。',
  },
  {
    id: '3',
    role: 'assistant',
    text: '没问题。这里已经准备好消息列表、输入框和最近会话侧边栏。',
  },
];

const conversations: Conversation[] = [
  { id: '1', title: 'RN 项目初始化', time: '刚刚' },
  { id: '2', title: '登录注册流程', time: '10 分钟前' },
  { id: '3', title: '接口环境配置', time: '昨天' },
  { id: '4', title: '首页交互草稿', time: '周一' },
];

export function HomeScreen({ onCloseSidebar, sidebarVisible }: HomeScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [search, setSearch] = useState('');

  const filteredConversations = useMemo(
    () =>
      conversations.filter(item =>
        item.title.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <FlatList
        contentContainerStyle={styles.messageList}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}>
            <Text
              style={[
                styles.messageText,
                item.role === 'user'
                  ? styles.userMessageText
                  : styles.assistantMessageText,
              ]}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.composer}>
        <TextInput
          multiline
          onChangeText={setPrompt}
          placeholder="输入消息..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={prompt}
        />
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.sendButton,
            pressed ? styles.pressed : null,
          ]}>
          <Text style={styles.sendText}>发送</Text>
        </Pressable>
      </View>

      {sidebarVisible ? (
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            onPress={onCloseSidebar}
            style={styles.backdrop}
          />
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>最近会话</Text>
              <Pressable
                accessibilityRole="button"
                onPress={onCloseSidebar}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  messageList: {
    gap: 12,
    padding: 16,
  },
  messageBubble: {
    borderRadius: 8,
    maxWidth: '84%',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  assistantMessageText: {
    color: '#111827',
  },
  userMessageText: {
    color: '#ffffff',
  },
  composer: {
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderTopColor: '#e2e8f0',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#d8e0ec',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    flex: 1,
    fontSize: 15,
    maxHeight: 104,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 64,
  },
  pressed: {
    opacity: 0.76,
  },
  sendText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  overlay: {
    flexDirection: 'row',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
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
