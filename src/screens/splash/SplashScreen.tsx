import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { SplashAdConfig } from '../../request/app';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const DEFAULT_SPLASH_DELAY = 700;
const DEFAULT_AD_DURATION = 3;

function getValidAd(config?: SplashAdConfig | null) {
  if (!config?.enabled || config.type !== 'image' || !config.imageUrl) {
    return null;
  }

  return config;
}

function getAdSeconds(config: SplashAdConfig) {
  const duration = Number(config.duration ?? DEFAULT_AD_DURATION);

  return Number.isFinite(duration) && duration > 0
    ? Math.ceil(duration)
    : DEFAULT_AD_DURATION;
}

function getSkipSeconds(config: SplashAdConfig) {
  const skipAfter = Number(config.skipAfter ?? 0);

  return Number.isFinite(skipAfter) && skipAfter > 0 ? Math.ceil(skipAfter) : 0;
}

export function SplashScreen({ navigation }: Props) {
  const [ad, setAd] = useState<SplashAdConfig | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [skipAfter, setSkipAfter] = useState(0);
  const [ready, setReady] = useState(false);

  const canSkip = useMemo(
    () => !!ad && countdown <= Math.max(getAdSeconds(ad) - skipAfter, 0),
    [ad, countdown, skipAfter],
  );

  function enterApp() {
    navigation.replace('Login');
  }

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;

    async function loadSplashAd() {
      try {
        const nextAd = getValidAd(null);

        if (!mounted) {
          return;
        }

        if (nextAd) {
          const seconds = getAdSeconds(nextAd);

          setAd(nextAd);
          setCountdown(seconds);
          setSkipAfter(getSkipSeconds(nextAd));
          setReady(true);
          return;
        }

        setReady(true);
        timer = setTimeout(enterApp, DEFAULT_SPLASH_DELAY);
      } catch {
        if (mounted) {
          setReady(true);
          timer = setTimeout(enterApp, DEFAULT_SPLASH_DELAY);
        }
      }
    }

    loadSplashAd();

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ad || countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(value => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [ad, countdown]);

  useEffect(() => {
    if (ad && countdown <= 0) {
      enterApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, countdown]);

  async function handleAdPress() {
    if (!ad?.linkUrl) {
      return;
    }

    const canOpen = await Linking.canOpenURL(ad.linkUrl);

    if (canOpen) {
      await Linking.openURL(ad.linkUrl);
    }
  }

  if (ad) {
    return (
      <ImageBackground
        resizeMode="cover"
        source={{ uri: ad.imageUrl }}
        style={styles.adContainer}>
        <Pressable
          accessibilityRole="button"
          onPress={handleAdPress}
          style={styles.adPressable}
        />
        <View style={styles.adTopBar}>
          <Pressable
            accessibilityRole="button"
            disabled={!canSkip}
            onPress={enterApp}
            style={[styles.skipButton, !canSkip ? styles.skipButtonDisabled : null]}>
            <Text style={styles.skipText}>
              {canSkip ? `Skip ${countdown}s` : `${countdown}s`}
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.defaultContainer}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>AI</Text>
      </View>
      <Text style={styles.brandTitle}>rnDemo</Text>
      <Text style={styles.brandSubtitle}>智能对话助手</Text>
      {!ready ? (
        <ActivityIndicator color="#2563eb" size="small" style={styles.loader} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  adContainer: {
    backgroundColor: '#0f172a',
    flex: 1,
  },
  adPressable: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  adTopBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    height: 58,
    justifyContent: 'center',
    marginBottom: 18,
    width: 58,
  },
  brandMarkText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  brandSubtitle: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 8,
  },
  brandTitle: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '900',
  },
  defaultContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f7fb',
    flex: 1,
    justifyContent: 'center',
  },
  loader: {
    marginTop: 28,
  },
  skipButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    borderRadius: 8,
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipButtonDisabled: {
    opacity: 0.72,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
