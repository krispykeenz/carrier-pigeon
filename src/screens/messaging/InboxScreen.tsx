import { useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useMessages, type FlightMessage } from "@/hooks/useMessages";
import { useContacts } from "@/hooks/useContacts";
import { useAuthContext } from "@/providers/AuthProvider";
import { useSelectedMessageStore } from "@/store/selectedMessageStore";

const TABS = [
  { key: "incoming", label: "Incoming" },
  { key: "outgoing", label: "Sent" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function InboxScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("incoming");
  const { inbox, outbox, isFetching, isLoading, refetch } = useMessages();
  const { contacts } = useContacts();
  const { profile } = useAuthContext();
  const selectMessage = useSelectedMessageStore((state) => state.selectMessage);

  const peopleById = useMemo(() => {
    const map = new Map<string, string>();
    if (profile) {
      map.set(profile.id, profile.display_name);
    }
    contacts.forEach((contact) => map.set(contact.id, contact.display_name));
    return map;
  }, [contacts, profile]);

  const data = activeTab === "incoming" ? inbox : outbox;

  const renderItem = ({ item }: { item: FlightMessage }) => {
    const counterpartId = activeTab === "incoming" ? item.sender_id : item.recipient_id;
    const counterpartName = peopleById.get(counterpartId) ?? "Unknown courier";

    return (
      <TouchableOpacity onPress={() => selectMessage(item)}>
        <Card style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Text style={styles.counterpartLabel}>{counterpartName}</Text>
            <Text style={styles.eta}>{item.isDeliveredClientSide ? "Delivered" : item.etaLabel}</Text>
          </View>
          <Text style={styles.bodyPreview} numberOfLines={3}>
            {item.body}
          </Text>
          <View style={styles.progressRow}>
            <ProgressBar progress={item.progress} />
            <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
          </View>
          <Text style={styles.metaText}>
            Flight path: {Math.round(item.distance_km)} km at {Math.round(item.pigeon_speed_kmh)} km/h
          </Text>
          <Text style={styles.metaText}>Arrival {item.arrivalLabel}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Screen scroll={false}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={isLoading ? null : <Text style={styles.emptyText}>No messages yet. Dispatch a pigeon!</Text>}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#E9E5D6",
    borderRadius: 999,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  tabLabel: {
    fontWeight: "600",
    color: "#6D7B73",
  },
  tabLabelActive: {
    color: "#2C3D2F",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#6D7B73",
  },
  messageCard: {
    gap: 12,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counterpartLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3D2F",
  },
  eta: {
    fontSize: 14,
    color: "#2C6E49",
    fontWeight: "600",
  },
  bodyPreview: {
    fontSize: 15,
    color: "#354237",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressText: {
    fontSize: 14,
    color: "#6D7B73",
    width: 50,
  },
  metaText: {
    fontSize: 12,
    color: "#8A958D",
  },
});
