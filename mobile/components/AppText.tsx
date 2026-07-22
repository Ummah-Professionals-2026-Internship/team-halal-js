import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface AppTextProps extends RNTextProps {
  className?: string;
  bold?: boolean;
}

/**
 * Global AppText wrapper component for the mobile app.
 * Automatically applies the Kollektif font family (Regular & Bold)
 * across all mobile screens without needing hardcoded inline style props.
 */
export function Text({ style, className = '', bold, children, ...props }: AppTextProps) {
  const isBold = bold || className.includes('font-bold') || className.includes('font-semibold');
  const fontFamily = isBold ? 'Kollektif-Bold' : 'Kollektif';

  return (
    <RNText style={[{ fontFamily }, style]} className={className} {...props}>
      {children}
    </RNText>
  );
}

export default Text;
