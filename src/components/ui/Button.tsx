import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
  leftIcon?: ReactNode;
}

export function Button({ label, onPress, variant = 'primary', disabled, style, leftIcon }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {leftIcon}
      <Text style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primary: {
    backgroundColor: '#2C6E49',
  },
  secondary: {
    backgroundColor: '#F5E6CA',
    borderWidth: 1,
    borderColor: '#2C6E49',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryText: {
    color: '#FDFBF7',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryText: {
    color: '#2C6E49',
    fontWeight: '600',
    fontSize: 16,
  },
});
