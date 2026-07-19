import { type ReactElement, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  contentContainerClassName?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  refreshControl?: ReactElement<RefreshControlProps>;
};

// Shared screen shell used by every route. Fixes two systemic issues found
// across the app: (1) no screen used SafeAreaView, so content butted up
// against the status bar/notch and home indicator everywhere (every route
// sets headerShown: false, so there was no native header providing that
// inset); (2) most form screens had no KeyboardAvoidingView, so the keyboard
// covered whatever was being typed.
export function Screen({
  children,
  scroll = true,
  keyboardAvoiding = true,
  backgroundColor = colors.background,
  contentContainerClassName = 'px-4 py-6 gap-4',
  edges = ['top', 'bottom', 'left', 'right'],
  refreshControl,
}: Props) {
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={contentContainerClassName}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${contentContainerClassName}`}>{children}</View>
  );

  const body = keyboardAvoiding ? (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={edges}>
      {body}
    </SafeAreaView>
  );
}
