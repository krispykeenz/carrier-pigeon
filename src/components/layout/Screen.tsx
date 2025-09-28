import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

interface ScreenProps {
  inset?: 'none' | 'scroll';
  contentContainerStyle?: ViewStyle;
  scroll?: boolean;
}

export function Screen({
  children,
  inset = 'scroll',
  contentContainerStyle,
  scroll = true,
}: PropsWithChildren<ScreenProps>) {
  if (scroll) {
    return (
      <ScrollView
        contentContainerStyle={[styles.content, inset === 'scroll' && styles.scrollInset, contentContainerStyle]}
        style={styles.container}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.container, styles.content, contentContainerStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  scrollInset: {
    paddingBottom: 80,
  },
});
