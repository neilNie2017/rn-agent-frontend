import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_CACHE_KEY = 'auth:user';

export type CachedUser = {
  email?: string;
  id?: string | number;
  name?: string;
  role?: string;
  [key: string]: unknown;
};

export async function saveCachedUser(user: CachedUser) {
  await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
}

export async function getCachedUser() {
  const value = await AsyncStorage.getItem(USER_CACHE_KEY);

  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as CachedUser;
  } catch {
    return undefined;
  }
}

export async function clearCachedUser() {
  await AsyncStorage.removeItem(USER_CACHE_KEY);
}
