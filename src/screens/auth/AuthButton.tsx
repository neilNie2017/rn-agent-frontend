import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

type AuthButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
};

export function AuthButton({
  title,
  variant = 'primary',
  disabled,
  style,
  ...props
}: AuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.ghost,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      {...props}>
      <Text
        style={[
          styles.text,
          variant === 'primary' ? styles.primaryText : styles.ghostText,
          disabled ? styles.disabledText : null,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    backgroundColor: '#cbd5e1',
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryText: {
    color: '#ffffff',
  },
  ghostText: {
    color: '#2563eb',
  },
  disabledText: {
    color: '#f8fafc',
  },
});
