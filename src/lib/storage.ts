import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cross-platform storage utilities with type safety and error handling
 * Uses AsyncStorage for both mobile (iOS/Android) and web platforms
 */

/**
 * Safely get item from storage
 */
export async function getStorageItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const item = await AsyncStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Safely set item in storage
 */
export async function setStorageItem<T>(key: string, value: T): Promise<boolean> {
  try {
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error(`Error writing to storage (${key}):`, error);
    return false;
  }
}

/**
 * Safely remove item from storage
 */
export async function removeStorageItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all storage items
 */
export async function clearStorage(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing storage:", error);
    return false;
  }
}

/**
 * Check if storage is available
 */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const test = "__storage_test__";
    await AsyncStorage.setItem(test, test);
    await AsyncStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all keys from storage
 */
export async function getStorageKeys(): Promise<readonly string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error("Error getting storage keys:", error);
    return [];
  }
}

/**
 * Get storage size (approximate, in bytes)
 * Note: This is an approximation based on stored items
 */
export async function getStorageSize(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    let total = 0;
    items.forEach(([key, value]) => {
      total += key.length + (value?.length || 0);
    });
    return total;
  } catch (error) {
    console.error("Error calculating storage size:", error);
    return 0;
  }
}

