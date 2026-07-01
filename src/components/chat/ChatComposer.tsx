import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Camera, Mic, SendHorizontal } from 'lucide-react-native';

type ChatComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  loading?: boolean;
  accentColor?: string;
};

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  loading = false,
  accentColor = '#2563eb',
}: ChatComposerProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const canSend = value.trim().length > 0 && !loading;

  React.useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#d8e0ec', accentColor],
  });

  const handleSend = useCallback(() => {
    if (!canSend) {
      return;
    }

    onSend(value.trim());
  }, [canSend, onSend, value]);

  const handleVoice = useCallback(() => {
    Keyboard.dismiss();
    Alert.alert(
      '语音输入',
      '语音识别功能需要安装 react-native-voice，是否继续？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => {} },
      ],
    );
  }, []);

  const handleCamera = useCallback(() => {
    Keyboard.dismiss();
    Alert.alert(
      '拍照功能',
      '拍照功能需要安装 react-native-image-picker，是否继续？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => {} },
      ],
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable
          accessibilityLabel="语音输入"
          accessibilityRole="button"
          onPress={handleVoice}
          style={({ pressed }) => [
            styles.toolBtn,
            pressed ? styles.toolBtnPressed : null,
          ]}>
          <Mic color="#475569" size={20} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          accessibilityLabel="拍照"
          accessibilityRole="button"
          onPress={handleCamera}
          style={({ pressed }) => [
            styles.toolBtn,
            pressed ? styles.toolBtnPressed : null,
          ]}>
          <Camera color="#475569" size={20} strokeWidth={2.2} />
        </Pressable>
      </View>

      <Animated.View style={[styles.inputWrap, { borderColor }]}>
        <TextInput
          ref={inputRef}
          blurOnSubmit={false}
          editable={!loading}
          keyboardType="default"
          multiline
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={handleSend}
          placeholder="输入消息..."
          placeholderTextColor="#94a3b8"
          returnKeyType="send"
          style={styles.input}
          value={value}
        />
      </Animated.View>

      <Pressable
        accessibilityLabel="发送"
        accessibilityRole="button"
        onPress={handleSend}
        style={({ pressed }) => [
          styles.sendBtn,
          { backgroundColor: canSend ? accentColor : '#94a3b8' },
          pressed && canSend ? styles.sendBtnPressed : null,
        ]}>
        <SendHorizontal color="#ffffff" size={20} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    shadowColor: '#0f172a',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 4,
  },
  toolBtn: {
    alignItems: 'center',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  toolBtnPressed: {
    backgroundColor: '#f1f5f9',
  },
  inputWrap: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    maxHeight: 104,
    minHeight: 40,
  },
  input: {
    color: '#111827',
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 44,
  },
  sendBtnPressed: {
    opacity: 0.8,
  },
});
