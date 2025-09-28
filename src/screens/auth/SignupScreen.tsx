import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { useAuthContext } from '@/providers/AuthProvider';
import { LocationSearchField } from '@/components/location/LocationSearchField';
import type { LocationSelection } from '@/types/location';
import type { AuthStackParamList } from '@/navigation/types';

export function SignupScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Signup'>) {
  const { signUp } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [homeLocation, setHomeLocation] = useState<LocationSelection | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || !displayName || !homeLocation) {
      Alert.alert('Missing info', 'Please complete every field and pick a roost.');
      return;
    }

    setLoading(true);
    const result = await signUp({
      email,
      password,
      displayName,
      location: {
        placeId: homeLocation.placeId,
        label: homeLocation.label,
        description: homeLocation.description,
        latitude: homeLocation.latitude,
        longitude: homeLocation.longitude,
        countryCode: homeLocation.countryCode,
      },
    });
    setLoading(false);

    if (result.error) {
      Alert.alert('Unable to sign up', result.error);
      return;
    }

    Alert.alert('Check your inbox', 'Confirm your email to begin dispatching messages.', [
      { text: 'Back to login', onPress: () => navigation.navigate('Login') },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Join the Pigeon Post</Text>
        <Text style={styles.subtitle}>Choose your home loft and prepare to send handwritten flights.</Text>
      </View>
      <View style={styles.form}>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
        <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Text style={styles.sectionTitle}>Pick your home roost</Text>
        <Text style={styles.sectionDescription}>Search for any city or address and we will calculate flight routes from there.</Text>
        <LocationSearchField label="Home base" value={homeLocation} onChange={setHomeLocation} />
        <Button
          label={loading ? 'Perching...' : 'Create account'}
          onPress={handleSubmit}
          disabled={loading}
          style={{ marginTop: 12 }}
        />
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.footerLink}>
        <Text style={styles.footerText}>Already have an account? Sign in.</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3D2F',
    marginBottom: 6,
  },
  sectionDescription: {
    color: '#6D7B73',
    fontSize: 13,
    marginBottom: 10,
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
