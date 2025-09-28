import { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import type { LocationSelection } from "@/types/location";
import { MIN_LOCATION_QUERY_LENGTH } from "@/services/geocoding";

interface LocationSearchFieldProps {
  label: string;
  value: LocationSelection | null;
  onChange: (value: LocationSelection | null) => void;
  placeholder?: string;
}

export function LocationSearchField({ label, value, onChange, placeholder }: LocationSearchFieldProps) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const { results, isLoading, error } = useLocationSearch(query);

  useEffect(() => {
    if (!isFocused) {
      setQuery(value?.label ?? "");
    }
  }, [value, isFocused]);

  const showSuggestions = isFocused && query.trim().length >= MIN_LOCATION_QUERY_LENGTH;
  const noResults = showSuggestions && !isLoading && !error && results.length === 0;

  return (
    <View style={styles.wrapper}>
      <TextField
        label={label}
        value={query}
        placeholder={placeholder ?? "Search for a city, town, or address"}
        onChangeText={(text) => {
          setQuery(text);
          if (!text.trim().length) {
            onChange(null);
          }
        }}
        autoCorrect={false}
        autoCapitalize="none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 120)}
        returnKeyType="search"
      />
      {showSuggestions && (
        <View style={styles.dropdown}>
          {isLoading && (
            <View style={styles.stateRow}>
              <ActivityIndicator size="small" color="#2C6E49" />
              <Text style={styles.stateText}>Searching roosts...</Text>
            </View>
          )}
          {!isLoading && error && <Text style={styles.errorText}>{error}</Text>}
          {noResults && <Text style={styles.stateText}>No results matched that search.</Text>}
          {!isLoading && !error && results.map((result) => (
            <TouchableOpacity
              key={result.placeId}
              style={styles.option}
              onPress={() => {
                onChange(result);
                setQuery(result.label);
                setIsFocused(false);
                Keyboard.dismiss();
              }}
            >
              <Text style={styles.optionTitle}>{result.label}</Text>
              {result.description !== result.label && (
                <Text style={styles.optionSubtitle}>{result.description}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
      {value && !isFocused && (
        <View style={styles.selectionCard}>
          <Text style={styles.selectionTitle}>{value.label}</Text>
          {value.description !== value.label && (
            <Text style={styles.selectionSubtitle}>{value.description}</Text>
          )}
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              onChange(null);
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear selection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  dropdown: {
    marginTop: -8,
    borderWidth: 1,
    borderColor: "#D7D9CE",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionTitle: {
    fontWeight: "600",
    color: "#2C3D2F",
  },
  optionSubtitle: {
    color: "#6D7B73",
    marginTop: 2,
    fontSize: 12,
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stateText: {
    color: "#6D7B73",
    fontSize: 13,
  },
  errorText: {
    color: "#C05746",
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  selectionCard: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#F0ECE0",
    padding: 12,
    gap: 6,
  },
  selectionTitle: {
    fontWeight: "600",
    color: "#2C3D2F",
  },
  selectionSubtitle: {
    color: "#56655B",
    fontSize: 13,
  },
  clearButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  clearButtonText: {
    color: "#C05746",
    fontWeight: "500",
    fontSize: 12,
  },
});
