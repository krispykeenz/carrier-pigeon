import { supabase } from '@/services/supabaseClient';
import type { MessageRow } from '@/types/database';

export async function getInboxMessages(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MessageRow[];
}

export async function getOutboxMessages(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MessageRow[];
}

interface SendMessageInput {
  senderId: string;
  recipientId: string;
  body: string;
  title?: string;
  departureTime: string;
  arrivalTime: string;
  distanceKm: number;
  pigeonSpeedKmh: number;
  pigeonName?: string;
}

export async function sendMessage(input: SendMessageInput) {
  const { error } = await supabase.from('messages').insert({
    sender_id: input.senderId,
    recipient_id: input.recipientId,
    body: input.body,
    title: input.title ?? null,
    departure_time: input.departureTime,
    arrival_time: input.arrivalTime,
    distance_km: input.distanceKm,
    pigeon_speed_kmh: input.pigeonSpeedKmh,
    pigeon_name: input.pigeonName ?? null,
    status: 'in_flight',
  });

  if (error) throw error;
}

export async function markDelivered(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ status: 'delivered' })
    .eq('id', messageId);

  if (error) throw error;
}
