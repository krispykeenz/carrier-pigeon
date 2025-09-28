import { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { useMessages } from "@/hooks/useMessages";
import type { FlightMessage } from "@/hooks/useMessages";
import { useContacts } from "@/hooks/useContacts";
import { useAuthContext } from "@/providers/AuthProvider";
import { useSelectedMessageStore } from "@/store/selectedMessageStore";
import { PigeonMap } from "@/components/map/PigeonMap";
import { resolveProfileLocation } from "@/utils/profileLocation";
import type { ResolvedLocation } from "@/types/location";

interface ProfileSummary {
  displayName: string;
  location: ResolvedLocation | null;
}

export function FlightsScreen() {
  const { inbox, outbox } = useMessages();
  const { contacts } = useContacts();
  const { profile } = useAuthContext();
  const { selectedMessage, selectMessage } = useSelectedMessageStore();

  const allMessages: FlightMessage[] = useMemo(() => [...inbox, ...outbox], [inbox, outbox]);

  const profilesById = useMemo(() => {
    const map = new Map<string, ProfileSummary>();
    if (profile) {
      map.set(profile.id, {
        displayName: profile.display_name,
        location: resolveProfileLocation(profile, { fallbackToDefault: true }),
      });
    }
    contacts.forEach((contact) =>
      map.set(contact.id, {
        displayName: contact.display_name,
        location: resolveProfileLocation(contact),
      })
    );
    return map;
  }, [contacts, profile]);

  const activeMessage = useMemo(() => {
    if (selectedMessage) {
      return allMessages.find((message) => message.id === selectedMessage.id) ?? selectedMessage;
    }
    return allMessages[0] ?? null;
  }, [allMessages, selectedMessage]);

  const senderProfile = activeMessage ? profilesById.get(activeMessage.sender_id) ?? null : null;
  const recipientProfile = activeMessage ? profilesById.get(activeMessage.recipient_id) ?? null : null;

  const senderLocation = senderProfile?.location ?? null;
  const recipientLocation = recipientProfile?.location ?? null;

  const activeSenderName = senderProfile?.displayName ?? "Unknown";
  const activeRecipientName = recipientProfile?.displayName ?? "Unknown";

  const canRenderMap = senderLocation && recipientLocation;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Flight tracker</Text>
        <Text style={styles.subtitle}>Follow your pigeons across the globe in real-time.</Text>

        {!allMessages.length && <Text style={styles.emptyState}>No flights yet. Send a letter to watch one soar.</Text>}

        {activeMessage && canRenderMap ? (
          <View style={styles.mapCard}>
            <PigeonMap
              sender={senderLocation}
              recipient={recipientLocation}
              progress={activeMessage.progress}
              pigeonName={activeMessage.pigeon_name}
              pigeonSpeedKmh={activeMessage.pigeon_speed_kmh}
            />
            <View style={styles.flightMeta}>
              <Text style={styles.flightTitle}>{`${activeSenderName} -> ${activeRecipientName}`}</Text>
              <Text style={styles.flightDetail}>Distance: {Math.round(activeMessage.distance_km)} km</Text>
              <Text style={styles.flightDetail}>Cruising speed: {Math.round(activeMessage.pigeon_speed_kmh)} km/h</Text>
              <Text style={styles.flightDetail}>Arrival: {activeMessage.arrivalLabel}</Text>
            </View>
          </View>
        ) : (
          allMessages.length > 0 && <Text style={styles.emptyState}>We could not determine the flight path.</Text>
        )}

        <Text style={styles.sectionTitle}>All flights</Text>
        <FlatList
          data={allMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flightList}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = activeMessage?.id === item.id;
            const senderName = profilesById.get(item.sender_id)?.displayName ?? "Unknown";
            const recipientName = profilesById.get(item.recipient_id)?.displayName ?? "Unknown";
            return (
              <TouchableOpacity
                onPress={() => selectMessage(item)}
                style={[styles.flightChip, isActive && styles.flightChipActive]}
              >
                <Text style={[styles.flightChipText, isActive && styles.flightChipTextActive]}>
                  {`${senderName} -> ${recipientName}`}
                </Text>
                <Text style={[styles.flightChipMeta, isActive && styles.flightChipTextActive]}>
                  {Math.round(item.progress * 100)}% complete
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3D2F",
  },
  subtitle: {
    color: "#5E6F64",
    marginTop: 6,
    marginBottom: 20,
  },
  emptyState: {
    marginTop: 40,
    color: "#6D7B73",
  },
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 18,
  },
  flightMeta: {
    marginTop: 10,
    gap: 4,
  },
  flightTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#2C3D2F",
  },
  flightDetail: {
    color: "#56655B",
    fontSize: 13,
  },
  sectionTitle: {
    marginVertical: 14,
    fontWeight: "600",
    color: "#2C3D2F",
  },
  flightList: {
    paddingBottom: 20,
    gap: 12,
  },
  flightChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7D9CE",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  flightChipActive: {
    borderColor: "#2C6E49",
    backgroundColor: "#E6F1EA",
  },
  flightChipText: {
    fontWeight: "600",
    color: "#2C3D2F",
  },
  flightChipTextActive: {
    color: "#2C6E49",
  },
  flightChipMeta: {
    fontSize: 12,
    color: "#6D7B73",
  },
});



