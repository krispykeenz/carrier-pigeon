import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { useAuthContext } from '@/providers/AuthProvider';
import type { AuthStackParamList } from '@/navigation/types';

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { signIn } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await signIn({ email, password });
    setLoading(false);

    if (result.error) {
      Alert.alert('Unable to sign in', result.error);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Carrier Pigeon Post</Text>
        <Text style={styles.subtitle}>
          Log back in to check on your feathered couriers and heartfelt letters.
        </Text>
      </View>
      <View style={styles.form}>
        <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Button label={loading ? 'Taking off...' : 'Log in'} onPress={handleSubmit} disabled={loading} style={{ marginTop: 8 }} />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.footerLink}>
        <Text style={styles.footerText}>New aviator? Create an account instead.</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3D2F',
    marginBottom: 8,
  },
  subtitle: {
    color: '#5E6F64',
    fontSize: 16,
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  footerLink: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#2C6E49',
    fontWeight: '500',
  },
});
