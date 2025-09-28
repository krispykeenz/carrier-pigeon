import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/providers/AuthProvider';
import { getAllProfiles } from '@/services/profiles';
import type { ProfileRow } from '@/types/database';

export function useContacts(): { contacts: ProfileRow[]; isLoading: boolean; refetch: () => void } {
  const { profile } = useAuthContext();
  const query = useQuery({
    queryKey: ['profiles', 'all'],
    queryFn: getAllProfiles,
  });

  const contacts = (query.data ?? []).filter((person) => person.id !== profile?.id);

  return {
    contacts,
    isLoading: query.isLoading,
    refetch: () => query.refetch(),
  };
}
