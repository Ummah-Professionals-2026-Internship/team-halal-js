import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
} from 'react-native';

export interface AppTextProps extends RNTextProps {
  className?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface AppTextInputProps extends RNTextInputProps {
  className?: string;
  bold?: boolean;
  italic?: boolean;
}

function resolveFontFamily(
  bold?: boolean,
  italic?: boolean,
  className: string = '',
  style?: any
): string {
  const flattenedStyle = style ? StyleSheet.flatten(style) : {};
  const styleFontWeight = flattenedStyle?.fontWeight;
  const styleFontStyle = flattenedStyle?.fontStyle;

  const isBold =
    bold ||
    className.includes('font-bold') ||
    className.includes('font-semibold') ||
    className.includes('font-extrabold') ||
    styleFontWeight === 'bold' ||
    styleFontWeight === '700' ||
    styleFontWeight === '600' ||
    styleFontWeight === '800' ||
    styleFontWeight === '900';

  const isItalic =
    italic ||
    className.includes('italic') ||
    styleFontStyle === 'italic';

  if (isBold && isItalic) return 'Kollektif-BoldItalic';
  if (isBold) return 'Kollektif-Bold';
  if (isItalic) return 'Kollektif-Italic';
  return 'Kollektif';
}

/**
 * Universal Text component for the mobile app.
 * Guarantees that the Kollektif font family (Regular, Bold, Italic, BoldItalic)
 * is universally applied across all mobile UI text.
 */
export function Text({ style, className = '', bold, italic, children, ...props }: AppTextProps) {
  const fontFamily = resolveFontFamily(bold, italic, className, style);

  return (
    <RNText style={[{ fontFamily }, style]} className={className} {...props}>
      {children}
    </RNText>
  );
}

/**
 * Universal TextInput component for the mobile app.
 * Guarantees that the Kollektif font family is universally applied to all inputs.
 */
export function TextInput({ style, className = '', bold, italic, ...props }: AppTextInputProps) {
  const fontFamily = resolveFontFamily(bold, italic, className, style);

  return (
    <RNTextInput
      style={[{ fontFamily }, style]}
      className={className}
      placeholderTextColor={props.placeholderTextColor ?? '#9a9a9a'}
      {...props}
    />
  );
}

export const AppText = Text;
export const AppTextInput = TextInput;
export default Text;

