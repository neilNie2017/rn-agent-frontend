import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type ChatTheme = {
  id: string;
  name: string;
  preview: string;
  userBubble: string;
  assistantBubble: string;
  background: string;
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

type ThemeContextValue = {
  theme: ChatTheme;
  setTheme: (theme: ChatTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ChatTheme>(chatThemes[0]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
