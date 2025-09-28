import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { getInboxMessages, getOutboxMessages, markDelivered } from '@/services/messages';
import type { MessageRow } from '@/types/database';
import { progressBetween } from '@/utils/geo';
import { formatReadable, formatRelativeToNow } from '@/utils/time';

const REFRESH_INTERVAL_MS = 1000 * 60; // 1 minute
const DELIVERY_POLL_MS = 1000 * 30;

export interface FlightMessage extends MessageRow {
  direction: 'incoming' | 'outgoing';
  progress: number;
  etaLabel: string;
  arrivalLabel: string;
  isDeliveredClientSide: boolean;
}

function decorate(messages: MessageRow[], direction: FlightMessage['direction']): FlightMessage[] {
  return messages.map((message) => {
    const progress = progressBetween(message.departure_time, message.arrival_time);
    const etaLabel = formatRelativeToNow(message.arrival_time);
    const arrivalLabel = formatReadable(message.arrival_time);
    const isDeliveredClientSide = progress >= 1 || message.status === 'delivered';

    return {
      ...message,
      direction,
      progress,
      etaLabel,
      arrivalLabel,
      isDeliveredClientSide,
    };
  });
}

export function useMessages() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  const userId = profile?.id;

  const inboxQuery = useQuery({
    queryKey: ['messages', 'inbox', userId],
    queryFn: () => getInboxMessages(userId!),
    enabled: !!userId,
    refetchInterval: REFRESH_INTERVAL_MS,
  });

  const outboxQuery = useQuery({
    queryKey: ['messages', 'outbox', userId],
    queryFn: () => getOutboxMessages(userId!),
    enabled: !!userId,
    refetchInterval: REFRESH_INTERVAL_MS,
  });

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      const inbox = inboxQuery.data ?? [];
      const outbox = outboxQuery.data ?? [];
      [...inbox, ...outbox].forEach((message) => {
        const isDelivered = message.status === 'delivered';
        const progress = progressBetween(message.departure_time, message.arrival_time);
        if (!isDelivered && progress >= 1) {
          markDelivered(message.id)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['messages'] });
            })
            .catch((error) => console.warn('Failed to mark delivered', error.message));
        }
      });
    }, DELIVERY_POLL_MS);

    return () => clearInterval(interval);
  }, [userId, inboxQuery.data, outboxQuery.data, queryClient]);

  const inbox = useMemo(() => decorate(inboxQuery.data ?? [], 'incoming'), [inboxQuery.data]);
  const outbox = useMemo(() => decorate(outboxQuery.data ?? [], 'outgoing'), [outboxQuery.data]);

  return {
    inbox,
    outbox,
    isLoading: inboxQuery.isLoading || outboxQuery.isLoading,
    isFetching: inboxQuery.isFetching || outboxQuery.isFetching,
    refetch: () => {
      inboxQuery.refetch();
      outboxQuery.refetch();
    },
  };
}
