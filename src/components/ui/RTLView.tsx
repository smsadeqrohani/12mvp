import React from 'react';
import { View, ViewProps, Platform, StyleSheet } from 'react-native';
import { isRTL } from '../../lib/rtl';

interface RTLViewProps extends ViewProps {
  /**
   * If true, the flex direction will be row (and will auto-reverse in RTL)
   */
  row?: boolean;
  /**
   * If true, the flex direction will be column (default)
   */
  column?: boolean;
  children?: React.ReactNode;
}

/**
 * RTL-aware View component that properly handles direction
 * Use this component when you need flex-row layouts that should respect RTL
 */
export function RTLView({ row, column, style, children, ...props }: RTLViewProps) {
  const rtl = Platform.OS !== 'web' && isRTL();
  
  const directionStyle = row 
    ? { flexDirection: 'row' as const }
    : column 
    ? { flexDirection: 'column' as const }
    : {};

  const combinedStyle = [
    rtl && { direction: 'rtl' as const },
    directionStyle,
    style
  ].filter(Boolean);

  return (
    <View style={combinedStyle} {...props}>
      {children}
    </View>
  );
}

