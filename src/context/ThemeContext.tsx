import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type ChatTheme = {
  id: string;
  name: string;
  preview: string;
  userBubble: string;
  assistantBubble: string;
  background: string;
};

export type ChatFontSize = {
  id: string;
  label: string;
  lineHeight: number;
  value: number;
};

export const chatThemes: ChatTheme[] = [
  {
    id: 'light',
    name: '经典亮色',
    preview: '#2563eb',
    userBubble: '#2563eb',
    assistantBubble: '#ffffff',
    background: '#f5f7fb',
  },
  {
    id: 'dark',
    name: '暗夜',
    preview: '#6366f1',
    userBubble: '#6366f1',
    assistantBubble: '#1e293b',
    background: '#0f172a',
  },
  {
    id: 'ocean',
    name: '海洋',
    preview: '#0891b2',
    userBubble: '#0891b2',
    assistantBubble: '#ecfeff',
    background: '#f0fdfa',
  },
  {
    id: 'forest',
    name: '森林',
    preview: '#16a34a',
    userBubble: '#16a34a',
    assistantBubble: '#f0fdf4',
    background: '#fafff7',
  },
  {
    id: 'sunset',
    name: '日落',
    preview: '#ea580c',
    userBubble: '#ea580c',
    assistantBubble: '#fff7ed',
    background: '#fffbf5',
  },
  {
    id: 'lavender',
    name: '薰衣草',
    preview: '#9333ea',
    userBubble: '#9333ea',
    assistantBubble: '#faf5ff',
    background: '#fdfaff',
  },
];

export const chatFontSizes: ChatFontSize[] = [
  { id: 'small', label: '小', value: 14, lineHeight: 21 },
  { id: 'medium', label: '标准', value: 15, lineHeight: 22 },
  { id: 'large', label: '大', value: 17, lineHeight: 25 },
  { id: 'extraLarge', label: '特大', value: 19, lineHeight: 28 },
];

type ThemeContextValue = {
  chatFontSize: ChatFontSize;
  followSystemFontScale: boolean;
  setChatFontSize: (fontSize: ChatFontSize) => void;
  setFollowSystemFontScale: (enabled: boolean) => void;
  setTheme: (theme: ChatTheme) => void;
  theme: ChatTheme;
};

const CHAT_THEME_CACHE_KEY = 'chat_theme_id';
const CHAT_FONT_SIZE_CACHE_KEY = 'chat_font_size_id';
const FOLLOW_SYSTEM_FONT_SCALE_CACHE_KEY = 'follow_system_font_scale';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function findTheme(themeId?: string | null) {
  return chatThemes.find(item => item.id === themeId) ?? chatThemes[0];
}

function findFontSize(fontSizeId?: string | null) {
  return (
    chatFontSizes.find(item => item.id === fontSizeId) ?? chatFontSizes[1]
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ChatTheme>(chatThemes[0]);
  const [chatFontSize, setChatFontSizeState] = useState<ChatFontSize>(
    chatFontSizes[1],
  );
  const [followSystemFontScale, setFollowSystemFontScaleState] = useState(true);

  useEffect(() => {
    let ignored = false;

    async function loadCachedSettings() {
      const [cachedThemeId, cachedFontSizeId, cachedFollowSystemFontScale] =
        await Promise.all([
        AsyncStorage.getItem(CHAT_THEME_CACHE_KEY),
        AsyncStorage.getItem(CHAT_FONT_SIZE_CACHE_KEY),
        AsyncStorage.getItem(FOLLOW_SYSTEM_FONT_SCALE_CACHE_KEY),
      ]);

      if (!ignored) {
        setThemeState(findTheme(cachedThemeId));
        setChatFontSizeState(findFontSize(cachedFontSizeId));
        setFollowSystemFontScaleState(cachedFollowSystemFontScale !== 'false');
      }
    }

    loadCachedSettings();

    return () => {
      ignored = true;
    };
  }, []);

  function setTheme(nextTheme: ChatTheme) {
    setThemeState(nextTheme);
    AsyncStorage.setItem(CHAT_THEME_CACHE_KEY, nextTheme.id);
  }

  function setChatFontSize(nextFontSize: ChatFontSize) {
    setChatFontSizeState(nextFontSize);
    AsyncStorage.setItem(CHAT_FONT_SIZE_CACHE_KEY, nextFontSize.id);
  }

  function setFollowSystemFontScale(enabled: boolean) {
    setFollowSystemFontScaleState(enabled);
    AsyncStorage.setItem(
      FOLLOW_SYSTEM_FONT_SCALE_CACHE_KEY,
      enabled ? 'true' : 'false',
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        chatFontSize,
        followSystemFontScale,
        setChatFontSize,
        setFollowSystemFontScale,
        setTheme,
        theme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
