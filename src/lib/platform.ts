import { Platform, Dimensions } from 'react-native';

/**
 * Platform detection utilities for cross-platform optimizations
 */

// Platform checks
export const IS_WEB = Platform.OS === 'web';
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_MOBILE = IS_IOS || IS_ANDROID;
export const IS_NATIVE = IS_MOBILE;

/**
 * Get platform-specific value
 * @example
 * const fontSize = getPlatformValue({ web: 16, ios: 14, android: 14 })
 */
export function getPlatformValue<T>(values: {
  web?: T;
  ios?: T;
  android?: T;
  native?: T;
  default?: T;
}): T | undefined {
  if (IS_WEB && values.web !== undefined) return values.web;
  if (IS_IOS && values.ios !== undefined) return values.ios;
  if (IS_ANDROID && values.android !== undefined) return values.android;
  if (IS_NATIVE && values.native !== undefined) return values.native;
  return values.default;
}

/**
 * Get optimal image sizes based on screen size
 * Returns smaller images on mobile for better performance
 */
export function getOptimalImageSize(): {
  thumbnail: number;
  preview: number;
  full: number;
} {
  const { width } = Dimensions.get('window');
  
  if (width < 768) {
    // Mobile
    return {
      thumbnail: 150,
      preview: 300,
      full: 600,
    };
  } else if (width < 1024) {
    // Tablet
    return {
      thumbnail: 200,
      preview: 500,
      full: 1000,
    };
  } else {
    // Desktop
    return {
      thumbnail: 250,
      preview: 800,
      full: 1600,
    };
  }
}

/**
 * Check if native performance optimizations should be used
 * Returns true on mobile devices
 */
export function shouldUseNativeComponents(): boolean {
  return IS_MOBILE;
}

/**
 * Check if web-specific features should be enabled
 * (e.g., keyboard shortcuts, right-click menus)
 */
export function shouldUseWebFeatures(): boolean {
  return IS_WEB;
}

/**
 * Get platform-specific list component recommendations
 * Returns 'FlatList' for simple lists, 'FlashList' for large lists on native
 */
export function getRecommendedListComponent(itemCount: number): 'FlatList' | 'FlashList' | 'ScrollView' {
  if (itemCount < 20) {
    return 'ScrollView'; // Simple, no virtualization needed
  }
  
  if (IS_MOBILE && itemCount > 100) {
    return 'FlashList'; // Best performance on native for large lists
  }
  
  return 'FlatList'; // Good default for most cases
}

/**
 * Get platform-specific animation config
 */
export function getAnimationConfig() {
  return getPlatformValue({
    web: {
      duration: 200,
      useNativeDriver: false, // Can't use on web
    },
    native: {
      duration: 150,
      useNativeDriver: true, // Better performance on native
    },
    default: {
      duration: 200,
      useNativeDriver: false,
    },
  });
}

/**
 * Check if device supports haptic feedback
 */
export function supportsHaptics(): boolean {
  return IS_IOS || IS_ANDROID;
}

/**
 * Get platform-specific font scaling
 * iOS and Android have different text rendering
 */
export function getFontScale(): number {
  return getPlatformValue({
    ios: 1.0,
    android: 0.95, // Android renders text slightly larger
    web: 1.0,
    default: 1.0,
  }) ?? 1.0;
}

/**
 * Check if platform supports certain input types
 */
export function supportsInputType(type: 'number' | 'email' | 'tel' | 'url'): boolean {
  // All platforms support basic input types
  return true;
}

/**
 * Get platform-specific shadow styles
 * Web uses box-shadow, native uses shadowOpacity/shadowRadius
 */
export function getPlatformShadow(elevation: number = 4) {
  if (IS_WEB) {
    return {
      boxShadow: `0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
    };
  }
  
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.1,
    shadowRadius: elevation,
    elevation: elevation, // Android
  };
}

/**
 * Get optimal page size for pagination based on platform
 */
export function getOptimalPageSize(): number {
  return getPlatformValue({
    mobile: 10, // Smaller page size for mobile
    web: 20,    // Larger for desktop
    default: 10,
  }) ?? 10;
}

/**
 * Check if platform supports file upload
 */
export function supportsFileUpload(): boolean {
  return IS_WEB || IS_NATIVE;
}

/**
 * Get platform-specific blur radius
 */
export function getBlurRadius(intensity: 'light' | 'medium' | 'heavy'): number {
  const values = {
    light: 10,
    medium: 20,
    heavy: 40,
  };
  
  const baseValue = values[intensity];
  
  // Web handles blur differently
  return IS_WEB ? baseValue * 0.5 : baseValue;
}

