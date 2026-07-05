import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SplashAdConfig } from '@/request/app';

const SPLASH_AD_CACHE_KEY = 'splash_ad_config';

export async function saveCachedSplashAd(config: SplashAdConfig | null) {
  if (!config) {
    await AsyncStorage.removeItem(SPLASH_AD_CACHE_KEY);
    return;
  }

  await AsyncStorage.setItem(SPLASH_AD_CACHE_KEY, JSON.stringify(config));
}

export async function getCachedSplashAd() {
  const value = await AsyncStorage.getItem(SPLASH_AD_CACHE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as SplashAdConfig;
  } catch {
    await AsyncStorage.removeItem(SPLASH_AD_CACHE_KEY);
    return null;
  }
}
