import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

type Ref = TextInput | null;

export const TextField = forwardRef<Ref, TextFieldProps>(({ label, error, style, ...rest }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        style={[
          styles.input,
          isFocused && styles.focused,
          !!error && styles.error,
          style as object,
        ]}
        placeholderTextColor="#9BA297"
        onFocus={(event) => {
          setIsFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          rest.onBlur?.(event);
        }}
        {...rest}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#2C3D2F',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7D9CE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FDFBF7',
    color: '#2C3D2F',
  },
  focused: {
    borderColor: '#2C6E49',
  },
  error: {
    borderColor: '#C05746',
  },
  errorText: {
    marginTop: 4,
    color: '#C05746',
    fontSize: 12,
  },
});
