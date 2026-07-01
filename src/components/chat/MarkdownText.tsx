import React from 'react';
import Markdown from 'react-native-markdown-display';

type MarkdownTextProps = {
  children: string;
  style?: Record<string, object>;
  textColor?: string;
  linkColor?: string;
};

/**
 * Markdown 渲染组件（基于 react-native-marked useMarkdown hook）
 * 用 hook 而非 Markdown 组件，避免内部 FlatList 导致高度异常
 */
export function MarkdownText({
  children,
  style,
  textColor = '#111827',
  linkColor = '#2563eb',
}: MarkdownTextProps) {
  const markdownStyles: Record<string, object> = {
    body: {
      color: textColor,
      fontSize: 15,
      lineHeight: 22,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 6,
    },
    h1: {
      color: textColor,
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 28,
      marginTop: 8,
      marginBottom: 4,
    },
    h2: {
      color: textColor,
      fontSize: 17,
      fontWeight: '800',
      lineHeight: 24,
      marginTop: 6,
      marginBottom: 4,
    },
    h3: {
      color: textColor,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 22,
      marginTop: 4,
      marginBottom: 2,
    },
    strong: {
      fontWeight: '800',
      color: textColor,
    },
    em: {
      fontStyle: 'italic',
      color: textColor,
    },
    link: {
      color: linkColor,
      textDecorationLine: 'underline',
    },
    code: {
      backgroundColor: '#f1f5f9',
      borderRadius: 6,
      marginBottom: 6,
      marginTop: 6,
      padding: 8,
    },
    codespan: {
      backgroundColor: '#f1f5f9',
      borderRadius: 4,
      color: textColor,
      fontFamily: 'monospace',
      fontSize: 14,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    li: {
      color: textColor,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 2,
    },
    list: {
      marginTop: 4,
      marginBottom: 4,
      marginLeft: 4,
    },
    blockquote: {
      backgroundColor: '#f8fafc',
      borderColor: '#cbd5e1',
      borderLeftWidth: 3,
      marginBottom: 6,
      marginTop: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    hr: {
      backgroundColor: '#e2e8f0',
      height: 1,
      marginVertical: 10,
    },
    ...style,
  };

  return <Markdown style={markdownStyles}>{children}</Markdown>;
}
