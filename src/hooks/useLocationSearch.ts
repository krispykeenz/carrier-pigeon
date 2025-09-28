import { useEffect, useMemo, useState } from "react";
import { MIN_LOCATION_QUERY_LENGTH, searchLocations } from "@/services/geocoding";
import type { LocationSelection } from "@/types/location";

interface UseLocationSearchResult {
  results: LocationSelection[];
  isLoading: boolean;
  error: string | null;
}

export function useLocationSearch(query: string): UseLocationSearchResult {
  const [results, setResults] = useState<LocationSelection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (trimmedQuery.length < MIN_LOCATION_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      try {
        setIsLoading(true);
        const locations = await searchLocations(trimmedQuery, controller.signal);
        setResults(locations);
        setError(null);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err?.message ?? "Unable to search locations");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [trimmedQuery]);

  return { results, isLoading, error };
}
