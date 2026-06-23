import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { useTheme } from '../../context/ThemeContext';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

const initialMessages: Message[] = [
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

export function HomeScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(async () => {
    const text = prompt.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);
    scrollToEnd();

    try {
      // TODO: 替换为真实的 AI 接口调用
      // const res = await request.post<{ reply: string }>('/chat', { message: text });
      await new Promise<void>(resolve => setTimeout(resolve, 800));
      const replyText = `收到你的消息：「${text}」（这是模拟回复，请接入真实 AI 接口）`;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: replyText,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: '抱歉，请求出错了，请稍后重试。',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  }, [prompt, loading, scrollToEnd]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        contentContainerStyle={styles.messageList}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.role === 'user'
                ? [styles.userBubble, { backgroundColor: theme.userBubble }]
                : [styles.assistantBubble, { backgroundColor: theme.assistantBubble }],
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
        ListFooterComponent={
          loading ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator color={theme.userBubble} size="small" />
              <Text style={styles.typingText}>AI 正在思考...</Text>
            </View>
          ) : null
        }
      />
      <View style={styles.composer}>
        <TextInput
          multiline
          onChangeText={setPrompt}
          onSubmitEditing={handleSend}
          placeholder="输入消息..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={prompt}
          editable={!loading}
        />
        <Pressable
          accessibilityRole="button"
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            { backgroundColor: theme.userBubble },
            pressed ? styles.pressed : null,
            (!prompt.trim() || loading) ? styles.sendButtonDisabled : null,
          ]}>
          <Text style={styles.sendText}>发送</Text>
        </Pressable>
      </View>
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
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  pressed: {
    opacity: 0.76,
  },
  sendText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  typingIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  typingText: {
    color: '#64748b',
    fontSize: 13,
  },
});
