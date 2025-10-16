import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

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
  };
}

