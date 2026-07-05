import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, RotateCcw, X } from 'lucide-react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
  usePreviewOutput,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraCapture'>;

type CapturedPhoto = {
  uri: string;
};

export function CameraCaptureScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const previewOutput = usePreviewOutput();
  const photoOutput = usePhotoOutput({
    quality: 0.9,
    qualityPrioritization: 'balanced',
  });
  const { canRequestPermission, hasPermission, requestPermission } =
    useCameraPermission();
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [capturing, setCapturing] = useState(false);

  const outputs = useMemo(
    () => [previewOutput, photoOutput],
    [photoOutput, previewOutput],
  );

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestPermission();
    }
  }, [canRequestPermission, hasPermission, requestPermission]);

  async function handleTakePhoto() {
    if (capturing) {
      return;
    }

    setCapturing(true);

    try {
      const photo = await photoOutput.capturePhotoToFile(
        { enableShutterSound: true, flashMode: 'off' },
        {},
      );

      setCapturedPhoto({ uri: `file://${photo.filePath}` });
    } catch (error) {
      Alert.alert(
        '拍照失败',
        error instanceof Error ? error.message : '请稍后重试。',
      );
    } finally {
      setCapturing(false);
    }
  }

  function handleUsePhoto() {
    navigation.goBack();
  }

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionTitle}>需要相机权限</Text>
        <Text style={styles.permissionText}>
          请允许 RN Agent 使用相机来拍摄图片。
        </Text>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [
            styles.permissionButton,
            pressed ? styles.buttonPressed : null,
          ]}>
          <Text style={styles.permissionButtonText}>授权相机</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} style={styles.textButton}>
          <Text style={styles.textButtonText}>返回</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color="#2563eb" size="small" />
        <Text style={styles.permissionText}>正在初始化相机...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <Image resizeMode="cover" source={{ uri: capturedPhoto.uri }} style={styles.preview} />
      ) : (
        <Camera
          device={device}
          enableNativeTapToFocusGesture
          isActive={isFocused}
          outputs={outputs}
          resizeMode="cover"
          style={styles.preview}
        />
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.iconButton,
            pressed ? styles.buttonPressed : null,
          ]}>
          <X color="#ffffff" size={24} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        {capturedPhoto ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => setCapturedPhoto(null)}
              style={({ pressed }) => [
                styles.secondaryAction,
                pressed ? styles.buttonPressed : null,
              ]}>
              <RotateCcw color="#ffffff" size={22} strokeWidth={2.4} />
              <Text style={styles.actionText}>重拍</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleUsePhoto}
              style={({ pressed }) => [
                styles.primaryAction,
                pressed ? styles.buttonPressed : null,
              ]}>
              <Check color="#ffffff" size={22} strokeWidth={2.4} />
              <Text style={styles.actionText}>使用照片</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={capturing}
            onPress={handleTakePhoto}
            style={({ pressed }) => [
              styles.shutter,
              pressed || capturing ? styles.shutterPressed : null,
            ]}>
            <View style={styles.shutterInner} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  bottomBar: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  centerContainer: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#000000',
    flex: 1,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  permissionText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  preview: {
    flex: 1,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    minWidth: 128,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 108,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  shutter: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderColor: '#ffffff',
    borderRadius: 38,
    borderWidth: 4,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  shutterInner: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    height: 52,
    width: 52,
  },
  shutterPressed: {
    transform: [{ scale: 0.96 }],
  },
  textButton: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  textButtonText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '700',
  },
  topBar: {
    alignItems: 'flex-start',
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
