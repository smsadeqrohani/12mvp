import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize, Platform } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type PlatformOS = 'web' | 'ios' | 'android';

export interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTabletLandscape: boolean;
  isAdminReady: boolean; // iPad landscape or desktop
  orientation: 'portrait' | 'landscape';
  
  // Platform detection
  platform: PlatformOS;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isNative: boolean;
  
  // Interaction mode
  isTouchDevice: boolean;
  hasMouseSupport: boolean;
  
  // UI sizing
  touchTargetSize: number;
  
  // Layout helpers
  shouldUseCardLayout: boolean; // True for touch devices
  shouldUseTableLayout: boolean; // True for desktop
}

/**
 * Hook to detect screen size and provide responsive breakpoints
 * Breakpoints:
 * - mobile: < 768px
 * - tablet: 768px - 1023px
 * - desktop: >= 1024px
 * 
 * Admin panel requires:
 * - iPad in landscape (≥1024px width) or desktop
 * 
 * Platform detection:
 * - Automatically detects web vs native
 * - Provides touch vs mouse interaction info
 * - Returns optimal UI sizing for each platform
 */
export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get('window')
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  const breakpoint: Breakpoint =
    width < 768 ? 'mobile' :
    width < 1024 ? 'tablet' : 'desktop';

  const orientation: 'portrait' | 'landscape' =
    width > height ? 'landscape' : 'portrait';

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  // iPad in landscape mode has ~1024px width
  const isTabletLandscape = isTablet && orientation === 'landscape' && width >= 1024;

  // Admin panel is ready for iPad landscape or desktop
  const isAdminReady = width >= 1024;
  
  // Platform detection
  const platform = Platform.OS as PlatformOS;
  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isNative = isIOS || isAndroid;
  
  // Interaction mode - native is always touch, web depends on screen size
  const isTouchDevice = isNative || (isWeb && (isMobile || isTablet));
  const hasMouseSupport = isWeb && isDesktop;
  
  // Minimum touch target size based on platform guidelines
  const touchTargetSize = Platform.select({
    ios: 44,      // Apple HIG minimum
    android: 48,  // Material Design minimum
    web: 36,      // Can be smaller with mouse
  }) ?? 36;
  
  // Layout decision helpers
  const shouldUseCardLayout = isTouchDevice; // Cards are better for touch
  const shouldUseTableLayout = hasMouseSupport; // Tables work well with mouse

  return {
    width,
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isTabletLandscape,
    isAdminReady,
    orientation,
    
    platform,
    isWeb,
    isIOS,
    isAndroid,
    isNative,
    
    isTouchDevice,
    hasMouseSupport,
    
    touchTargetSize,
    
    shouldUseCardLayout,
    shouldUseTableLayout,
  };
}

