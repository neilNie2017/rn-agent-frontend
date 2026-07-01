import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { MarkdownText } from '../../components/chat/MarkdownText';
import { useTheme } from '../../context/ThemeContext';
import {
  getChatDetailApi,
  sendChatApi,
  type ChatDetailResponse,
  type ChatMessage,
  type SendChatResponse,
} from '../../request/ai';
import { HttpError } from '../../request/http';

type HomeScreenProps = {
  selectedChatId?: string;
};

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
];

const TAB_BAR_FLOAT_CLEARANCE = 0;

function getKeyboardOffset(event: {
  endCoordinates: { height: number; screenY: number };
}) {
  const windowHeight = Dimensions.get('window').height;
  const keyboardHeight = Math.max(
    event.endCoordinates.height,
    windowHeight - event.endCoordinates.screenY,
  );

  return keyboardHeight > 20
    ? keyboardHeight + 8
    : TAB_BAR_FLOAT_CLEARANCE;
}

function getAiReply(response: SendChatResponse) {
  return (
    response.data?.message?.content ??
    response.data?.choices?.[0]?.message?.content ??
    '抱歉，未能获取到 AI 回复。'
  );
}

function getResponseChatId(response: SendChatResponse) {
  return response.data?.chatId ?? response.chatId ?? '';
}

function getDetailChatId(response: ChatDetailResponse) {
  return response.data?.chatId ?? response.data?.id ?? response.chatId ?? response.id ?? '';
}

function getDetailMessages(response: ChatDetailResponse) {
  return response.data?.messages ?? response.messages ?? [];
}

function toMessage(message: ChatMessage, index: number): Message {
  return {
    id: `${Date.now()}-${index}`,
    role: message.role,
    text: message.content,
  };
}

function getErrorReply(error: unknown) {
  if (error instanceof HttpError) {
    const data = error.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? `请求失败：${error.status}`;
  }

  return error instanceof Error ? error.message : '抱歉，请求出错了，请稍后重试。';
}

export function HomeScreen({ selectedChatId }: HomeScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentChatId, setCurrentChatId] = useState('');
  const composerBottom = useRef(
    new Animated.Value(TAB_BAR_FLOAT_CLEARANCE),
  ).current;
  const [composerOffset, setComposerOffset] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const composerDockStyle = useMemo(
    () => ({
      bottom: composerBottom,
      paddingBottom: composerOffset > 0 ? 8 : Math.max(insets.bottom, 8),
    }),
    [composerBottom, composerOffset, insets.bottom],
  );

  useEffect(() => {
    if (!selectedChatId) {
      setCurrentChatId('');
      setMessages(initialMessages);
      return;
    }

    const chatId = selectedChatId;
    let ignored = false;

    async function loadDetail() {
      setLoadingDetail(true);

      try {
        const response = await getChatDetailApi(chatId);
        const detailMessages = getDetailMessages(response).map(toMessage);

        if (!ignored) {
          setCurrentChatId(getDetailChatId(response) || chatId);
          setMessages(detailMessages.length > 0 ? detailMessages : initialMessages);
        }
      } catch (error) {
        if (!ignored) {
          setCurrentChatId(chatId);
          setMessages([
            {
              id: Date.now().toString(),
              role: 'assistant',
              text: getErrorReply(error),
            },
          ]);
        }
      } finally {
        if (!ignored) {
          setLoadingDetail(false);
        }
      }
    }

    loadDetail();

    return () => {
      ignored = true;
    };
  }, [selectedChatId]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      const nextOffset = getKeyboardOffset(event);

      setComposerOffset(
        nextOffset > TAB_BAR_FLOAT_CLEARANCE ? nextOffset : 0,
      );
      Animated.timing(composerBottom, {
        duration: Platform.OS === 'ios' ? event.duration || 250 : 180,
        toValue: nextOffset,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, event => {
      setComposerOffset(0);
      Animated.timing(composerBottom, {
        duration: Platform.OS === 'ios' ? event.duration || 250 : 180,
        toValue: TAB_BAR_FLOAT_CLEARANCE,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [composerBottom]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      if (messages.length > 0) {
        flatListRef.current?.scrollToIndex({
          animated: true,
          index: messages.length - 1,
        });
      }
    }, 300);
  }, [messages.length]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text || loading || loadingDetail) {
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        text,
      };

      const nextMessages = [...messages, userMessage];

      setMessages(nextMessages);
      setPrompt('');
      setLoading(true);

      try {
        const apiMessages = nextMessages.map(message => ({
          content: message.text,
          role: message.role,
        }));

        const response = await sendChatApi({
          ...(currentChatId ? { chatId: currentChatId } : {}),
          messages: apiMessages,
          provider: 'agnes',
        });
        const reply = getAiReply(response);
        const responseChatId = getResponseChatId(response);

        if (responseChatId && responseChatId !== currentChatId) {
          setCurrentChatId(responseChatId);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: reply,
        };

        setMessages(prev => [...prev, assistantMessage]);
        scrollToEnd();
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: getErrorReply(error),
        };

        setMessages(prev => [...prev, errorMessage]);
        scrollToEnd();
      } finally {
        setLoading(false);
      }
    },
    [currentChatId, loading, loadingDetail, messages, scrollToEnd],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        contentContainerStyle={[
          styles.messageList,
          {
            paddingBottom:
              styles.messageList.paddingBottom +
              styles.composerMinHeight.height +
              TAB_BAR_FLOAT_CLEARANCE +
              Math.max(insets.bottom, 8),
          },
        ]}
        data={messages}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          loadingDetail ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator color={theme.userBubble} size="small" />
              <Text style={styles.typingText}>正在加载会话...</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.role === 'user'
                ? [styles.userBubble, { backgroundColor: theme.userBubble }]
                : [
                    styles.assistantBubble,
                    { backgroundColor: theme.assistantBubble },
                  ],
            ]}>
            {item.role === 'assistant' ? (
              <MarkdownText linkColor={theme.userBubble} textColor="#111827">
                {item.text}
              </MarkdownText>
            ) : (
              <Text style={[styles.messageText, styles.userMessageText]}>
                {item.text}
              </Text>
            )}
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
      <Animated.View style={[styles.composerDock, composerDockStyle]}>
        <ChatComposer
          accentColor={theme.userBubble}
          loading={loading || loadingDetail}
          onChangeText={setPrompt}
          onSend={handleSend}
          value={prompt}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  messageList: {
    gap: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  composerDock: {
    backgroundColor: 'transparent',
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
  },
  composerMinHeight: {
    height: 84,
  },
  messageBubble: {
    borderRadius: 8,
    maxWidth: '84%',
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  userMessageText: {
    color: '#ffffff',
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
