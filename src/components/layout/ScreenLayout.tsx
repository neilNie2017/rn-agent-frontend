import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenLayoutProps = PropsWithChildren<{
  headerLeft?: 'sidebar';
  headerShown?: boolean;
  onHeaderLeftPress?: () => void;
  routeName: string;
}>;

export function ScreenLayout({
  children,
  headerLeft,
  headerShown = true,
  onHeaderLeftPress,
  routeName,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {headerShown ? (
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerInner}>
            <View style={styles.headerSide}>
              {headerLeft === 'sidebar' ? (
                <Pressable
                  accessibilityLabel="打开侧边栏"
                  accessibilityRole="button"
                  onPress={onHeaderLeftPress}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed ? styles.pressed : null,
                  ]}>
                  <Text style={styles.iconText}>☰</Text>
                </Pressable>
              ) : null}
            </View>
            <Text numberOfLines={1} style={styles.title}>
              {routeName}
            </Text>
            <View style={styles.headerSide} />
          </View>
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
  },
  headerInner: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerSide: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 44,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pressed: {
    backgroundColor: '#eef2ff',
  },
  iconText: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  title: {
    color: '#111827',
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});
