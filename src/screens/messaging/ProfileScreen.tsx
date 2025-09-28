import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { resolveProfileLocation } from '@/utils/profileLocation';

export function ProfileScreen() {
  const { profile, signOut } = useAuthContext();
  const location = resolveProfileLocation(profile ?? null);

  const handleSignOut = async () => {
    await signOut();
    Alert.alert('Signed out', 'Come back soon-your pigeons will miss you.');
  };

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Display name</Text>
        <Text style={styles.value}>{profile?.display_name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile?.email}</Text>

        <Text style={styles.label}>Home loft</Text>
        {location ? (
          <View style={styles.locationBox}>
            <Text style={styles.locationName}>{location.label}</Text>
            <Text style={styles.locationDescription}>{location.description}</Text>
          </View>
        ) : (
          <Text style={styles.value}>No location assigned</Text>
        )}
      </View>

      <Button label="Sign out" onPress={handleSignOut} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3D2F',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#6D7B73',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#2C3D2F',
    marginBottom: 8,
  },
  locationBox: {
    backgroundColor: '#F0ECE0',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  locationName: {
    fontWeight: '600',
    color: '#2C3D2F',
  },
  locationDescription: {
    color: '#56655B',
  },
});
