import React, { useMemo, useState } from 'react';
import {
  Clipboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, Copy as CopyIcon } from 'lucide-react-native';
import Markdown, { type ASTNode, type RenderRules } from 'react-native-markdown-display';

type MarkdownTextProps = {
  children: string;
  fontSize?: number;
  lineHeight?: number;
  linkColor?: string;
  style?: Record<string, object>;
  textColor?: string;
};

type CodeBlockProps = {
  content: string;
  fontSize: number;
  language?: string;
};

function trimCodeContent(content: string) {
  return content.endsWith('\n') ? content.slice(0, -1) : content;
}

function getCodeLanguage(node: ASTNode) {
  const sourceInfo = (node as ASTNode & { sourceInfo?: string }).sourceInfo;
  const language = sourceInfo?.trim().split(/\s+/)[0];

  return language || 'text';
}

function formatLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  const uppercaseLanguages = new Set([
    'css',
    'html',
    'json',
    'sql',
    'tsx',
    'xml',
    'yaml',
  ]);

  if (uppercaseLanguages.has(normalized)) {
    return normalized.toUpperCase();
  }

  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : 'Text';
}

function CodeBlock({ content, fontSize, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    Clipboard.setString(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <View style={styles.codeBlock}>
      <View style={styles.codeHeader}>
        <Text numberOfLines={1} style={styles.codeLanguage}>
          {formatLanguage(language)}
        </Text>
        <Pressable
          accessibilityLabel={copied ? '已复制代码' : '复制代码'}
          accessibilityRole="button"
          onPress={handleCopy}
          style={({ pressed }) => [
            styles.copyButton,
            pressed ? styles.copyButtonPressed : null,
          ]}>
          {copied ? (
            <Check color="#86efac" size={16} strokeWidth={2.4} />
          ) : (
            <CopyIcon color="#cbd5e1" size={16} strokeWidth={2.2} />
          )}
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.codeScrollerContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.codeScroller}>
        <Text
          selectable
          style={[
            styles.codeText,
            {
              fontSize: Math.max(fontSize - 1, 12),
              lineHeight: Math.max(Math.round(fontSize * 1.55), 18),
            },
          ]}>
          {content}
        </Text>
      </ScrollView>
    </View>
  );
}

function createMarkdownRules(fontSize: number): RenderRules {
  return {
    code_block: node => (
      <CodeBlock
        key={node.key}
        content={trimCodeContent(node.content)}
        fontSize={fontSize}
      />
    ),
    fence: node => (
      <CodeBlock
        key={node.key}
        content={trimCodeContent(node.content)}
        fontSize={fontSize}
        language={getCodeLanguage(node)}
      />
    ),
  };
}

/**
 * Markdown renderer for chat messages.
 */
export function MarkdownText({
  children,
  fontSize = 15,
  lineHeight = 22,
  linkColor = '#2563eb',
  style,
  textColor = '#111827',
}: MarkdownTextProps) {
  const markdownStyles: Record<string, object> = {
    body: {
      color: textColor,
      fontSize,
      lineHeight,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 6,
    },
    h1: {
      color: textColor,
      fontSize: fontSize + 5,
      fontWeight: '800',
      lineHeight: lineHeight + 6,
      marginTop: 8,
      marginBottom: 4,
    },
    h2: {
      color: textColor,
      fontSize: fontSize + 2,
      fontWeight: '800',
      lineHeight: lineHeight + 2,
      marginTop: 6,
      marginBottom: 4,
    },
    h3: {
      color: textColor,
      fontSize,
      fontWeight: '700',
      lineHeight,
      marginTop: 4,
      marginBottom: 2,
    },
    strong: {
      color: textColor,
      fontWeight: '800',
    },
    em: {
      color: textColor,
      fontStyle: 'italic',
    },
    link: {
      color: linkColor,
      textDecorationLine: 'underline',
    },
    code_inline: {
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
      color: '#0f172a',
      fontFamily: 'monospace',
      fontSize: Math.max(fontSize - 1, 12),
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    codespan: {
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
      color: '#0f172a',
      fontFamily: 'monospace',
      fontSize: Math.max(fontSize - 1, 12),
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    li: {
      color: textColor,
      fontSize,
      lineHeight,
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

  const rules = useMemo(() => createMarkdownRules(fontSize), [fontSize]);

  return (
    <View style={styles.markdownRoot}>
      <Markdown rules={rules} style={markdownStyles}>
        {children}
      </Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  markdownRoot: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },
  codeBlock: {
    alignSelf: 'stretch',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    marginTop: 8,
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    width: '100%',
  },
  codeHeader: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderBottomColor: '#1e293b',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 10,
  },
  codeLanguage: {
    color: '#94a3b8',
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  codeScroller: {
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },
  codeScrollerContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  codeText: {
    color: '#e5e7eb',
    fontFamily: 'monospace',
  },
  copyButton: {
    alignItems: 'center',
    borderColor: '#334155',
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    height: 30,
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: 34,
  },
  copyButtonPressed: {
    backgroundColor: '#1f2937',
  },
});
