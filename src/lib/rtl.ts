import { I18nManager, Platform } from 'react-native';

/**
 * RTL utility functions for consistent RTL support across the app
 */

/**
 * Check if the app is in RTL mode
 */
export const isRTL = (): boolean => {
  if (Platform.OS === 'web') {
    return document.dir === 'rtl' || document.documentElement.dir === 'rtl';
  }
  return I18nManager.isRTL;
};

/**
 * Get flex direction based on RTL status
 * Use this for horizontal layouts that should reverse in RTL
 */
export const getFlexDirection = (defaultDirection: 'row' | 'row-reverse' = 'row'): 'row' | 'row-reverse' => {
  if (!isRTL()) return defaultDirection;
  return defaultDirection === 'row' ? 'row-reverse' : 'row';
};

/**
 * Get text alignment based on RTL status
 */
export const getTextAlign = (defaultAlign: 'left' | 'right' | 'center' = 'left'): 'left' | 'right' | 'center' => {
  if (defaultAlign === 'center') return 'center';
  if (!isRTL()) return defaultAlign;
  return defaultAlign === 'left' ? 'right' : 'left';
};

/**
 * Get writing direction style
 */
export const getDirectionStyle = () => ({
  direction: isRTL() ? ('rtl' as const) : ('ltr' as const),
});

/**
 * Transform value for RTL (useful for margins, paddings)
 * Example: transformRTL({ marginLeft: 10 }) becomes { marginRight: 10 } in RTL
 */
export const transformRTL = (style: Record<string, any>): Record<string, any> => {
  if (!isRTL()) return style;

  const transformed: Record<string, any> = { ...style };
  const properties = ['margin', 'padding', 'border'];
  const directions = ['Left', 'Right'];

  properties.forEach(prop => {
    const left = `${prop}${directions[0]}`;
    const right = `${prop}${directions[1]}`;

    if (left in transformed && right in transformed) {
      [transformed[left], transformed[right]] = [transformed[right], transformed[left]];
    } else if (left in transformed) {
      transformed[right] = transformed[left];
      delete transformed[left];
    } else if (right in transformed) {
      transformed[left] = transformed[right];
      delete transformed[right];
    }
  });

  return transformed;
};

/**
 * Get icon transform for RTL (useful for chevrons, arrows, etc.)
 */
export const getIconTransform = (shouldFlip: boolean = true) => {
  if (!shouldFlip || !isRTL()) return {};
  return { transform: [{ scaleX: -1 }] };
};

