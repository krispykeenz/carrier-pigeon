import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { useAuthContext } from "@/providers/AuthProvider";
import { useContacts } from "@/hooks/useContacts";
import { sendMessage } from "@/services/messages";
import { haversineDistanceKm, estimateFlightHours, estimateArrival } from "@/utils/geo";
import { resolveProfileLocation } from "@/utils/profileLocation";
import type { ResolvedLocation } from "@/types/location";
import { PIGEON_VARIANTS, type PigeonVariant } from "@/constants/pigeons";
import { PigeonIllustration } from "@/components/pigeon/PigeonIllustration";
import { PigeonDepartureAnimation } from "@/components/pigeon/PigeonDepartureAnimation";
import { HandwrittenLetterField } from "@/components/messaging/HandwrittenLetterField";

const PIGEON_NAMES = ["Aurora", "Nimbus", "Atlas", "Willow", "Zephyr", "Sable"];

interface DepartureInfo {
  variantId: PigeonVariant["id"];
  pigeonName: string;
}

function hasValidCoordinates(location: ResolvedLocation | null): location is ResolvedLocation {
  return !!location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
}

export function ComposeScreen() {
  const queryClient = useQueryClient();
  const { profile } = useAuthContext();
  const { contacts } = useContacts();
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [pigeonVariant, setPigeonVariant] = useState<PigeonVariant>(PIGEON_VARIANTS[0]);
  const [loading, setLoading] = useState(false);
  const [departureInfo, setDepartureInfo] = useState<DepartureInfo | null>(null);

  const successAlertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successAlertTimeout.current) {
        clearTimeout(successAlertTimeout.current);
        successAlertTimeout.current = null;
      }
    };
  }, []);

  const senderLocation = useMemo(
    () => resolveProfileLocation(profile, { fallbackToDefault: true }),
    [profile]
  );
  const recipientProfile = useMemo(
    () => contacts.find((contact) => contact.id === recipientId) ?? null,
    [contacts, recipientId]
  );
  const recipientLocation = useMemo(
    () => resolveProfileLocation(recipientProfile ?? null),
    [recipientProfile]
  );

  const distanceKm = useMemo(() => {
    if (!hasValidCoordinates(senderLocation) || !hasValidCoordinates(recipientLocation)) return 0;
    return haversineDistanceKm(
      senderLocation.latitude,
      senderLocation.longitude,
      recipientLocation.latitude,
      recipientLocation.longitude
    );
  }, [senderLocation, recipientLocation]);

  const estimatedHours = distanceKm ? estimateFlightHours(distanceKm, pigeonVariant.speed) : 0;

  const handleSend = async () => {
    if (!profile?.id || !recipientId || !hasValidCoordinates(senderLocation) || !hasValidCoordinates(recipientLocation)) {
      Alert.alert("Missing info", "Pick a recipient and make sure both roosts are set.");
      return;
    }

    if (!body.trim()) {
      Alert.alert("Empty letter", "Compose a note for your pigeon to carry.");
      return;
    }

    setLoading(true);
    const departure = new Date().toISOString();
    const arrival = estimateArrival(departure, estimatedHours + 4);
    const pigeonName = PIGEON_NAMES[Math.floor(Math.random() * PIGEON_NAMES.length)];

    try {
      await sendMessage({
        senderId: profile.id,
        recipientId,
        body,
        departureTime: departure,
        arrivalTime: arrival,
        distanceKm,
        pigeonSpeedKmh: pigeonVariant.speed,
        pigeonName,
      });

      await queryClient.invalidateQueries({ queryKey: ["messages"] });

      setBody("");
      setRecipientId(null);
      setDepartureInfo({ variantId: pigeonVariant.id, pigeonName });

      if (successAlertTimeout.current) {
        clearTimeout(successAlertTimeout.current);
      }
      successAlertTimeout.current = setTimeout(() => {
        Alert.alert("En route!", `Pigeon ${pigeonName} has taken flight. Delivery expected ${arrival}.`);
        successAlertTimeout.current = null;
      }, 1500);
    } catch (error: any) {
      Alert.alert("Failed to send", error.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={styles.page}>
        <Text style={styles.title}>Compose a handwritten letter</Text>
      <Text style={styles.subtitle}>
        Pigeons appreciate vivid storytelling. The longer the journey, the more time to savour the words.
      </Text>

      <Text style={styles.sectionTitle}>Recipient</Text>
      <View style={styles.recipientList}>
        {contacts.map((contact) => {
          const selected = contact.id === recipientId;
          const location = resolveProfileLocation(contact ?? null);
          return (
            <TouchableOpacity
              key={contact.id}
              onPress={() => setRecipientId(contact.id)}
              style={[styles.recipientCard, selected && styles.recipientCardSelected]}
            >
              <Text style={styles.recipientName}>{contact.display_name}</Text>
              <Text style={styles.recipientLocation}>
                {location ? location.label : "No location assigned"}
              </Text>
              {selected && <Text style={styles.selectedTag}>Selected</Text>}
            </TouchableOpacity>
          );
        })}
        {!contacts.length && (
          <Text style={styles.emptyState}>No contacts yet. Ask friends to join the loft.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Choose a courier</Text>
      <View style={styles.recipientList}>
        {PIGEON_VARIANTS.map((option) => {
          const selected = option.id === pigeonVariant.id;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => setPigeonVariant(option)}
              style={[styles.recipientCard, styles.courierCard, selected && styles.recipientCardSelected]}
            >
              <View style={styles.courierHeader}>
                <Text style={styles.recipientName}>{option.label}</Text>
                <Text style={styles.courierSpeed}>{option.speed} km/h</Text>
              </View>
              <View style={styles.courierArtWrapper}>
                <PigeonIllustration
                  variant={option.id}
                  size={selected ? 120 : 104}
                />
              </View>
              <Text style={styles.courierDescription}>{option.description}</Text>
              {selected && <Text style={styles.selectedTag}>Chosen</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Letter</Text>
      <HandwrittenLetterField
        label="Story for your pigeon"
        value={body}
        onChangeText={setBody}
        placeholder="Dear friend..."
        lines={8}
      />

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Departure: {senderLocation ? senderLocation.label : "--"}
        </Text>
        <Text style={styles.summaryText}>
          Destination: {recipientLocation ? recipientLocation.label : "--"}
        </Text>
        <Text style={styles.summaryText}>Distance: {distanceKm ? `${distanceKm.toFixed(1)} km` : "--"}</Text>
        <Text style={styles.summaryText}>
          Estimated flight: {estimatedHours ? `${(estimatedHours + 4).toFixed(1)} h` : "--"}
        </Text>
      </View>

        <Button
          label={loading ? "Launching..." : "Send pigeon"}
          onPress={handleSend}
          disabled={loading}
          style={{ marginTop: 12 }}
        />

        {departureInfo && (
          <PigeonDepartureAnimation
            variant={departureInfo.variantId}
            pigeonName={departureInfo.pigeonName}
            onComplete={() => setDepartureInfo(null)}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 120,
  },
  page: {
    position: "relative",
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3D2F",
    marginBottom: 8,
  },
  subtitle: {
    color: "#5E6F64",
    fontSize: 15,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3D2F",
    marginTop: 16,
    marginBottom: 10,
  },
  recipientList: {
    gap: 10,
  },
  recipientCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7D9CE",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  recipientCardSelected: {
    borderColor: "#2C6E49",
    backgroundColor: "#E6F1EA",
  },
  recipientName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#2C3D2F",
    marginBottom: 4,
  },
  recipientLocation: {
    color: "#6D7B73",
    fontSize: 13,
  },
  courierCard: {
    alignItems: "center",
  },
  courierHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courierSpeed: {
    color: "#2C6E49",
    fontWeight: "600",
  },
  courierArtWrapper: {
    marginTop: 6,
    marginBottom: 8,
    width: "100%",
    alignItems: "center",
  },
  courierDescription: {
    textAlign: "center",
    color: "#56655B",
    fontSize: 12,
  },
  selectedTag: {
    marginTop: 8,
    alignSelf: "center",
    color: "#2C6E49",
    fontWeight: "600",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  summaryBox: {
    marginTop: 16,
    backgroundColor: "#F0ECE0",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    color: "#4F5E52",
  },
  emptyState: {
    fontStyle: "italic",
    color: "#90998F",
  },
});
