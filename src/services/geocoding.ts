import type { LocationSelection } from "@/types/location";

const MAPBOX_BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const MIN_QUERY_LENGTH = 3;

function extractCountryCode(feature: any): string | null {
  const contextArray: any[] = Array.isArray(feature?.context) ? feature.context : [];
  for (const entry of contextArray) {
    if (typeof entry?.id === "string" && entry.id.startsWith("country")) {
      const code = (entry?.short_code as string | undefined) ?? (entry?.properties?.short_code as string | undefined);
      if (code) {
        return code.toUpperCase();
      }
    }
  }
  const code = feature?.properties?.short_code as string | undefined;
  return code ? code.toUpperCase() : null;
}

export async function searchLocations(query: string, signal?: AbortSignal): Promise<LocationSelection[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    throw new Error("Missing Mapbox token. Set EXPO_PUBLIC_MAPBOX_TOKEN in your environment.");
  }

  const url = `${MAPBOX_BASE_URL}/${encodeURIComponent(trimmed)}.json?access_token=${token}&limit=6&types=place,locality,region,address`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Mapbox request failed (${response.status})`);
  }

  const payload = (await response.json()) as { features?: any[] };
  const features = Array.isArray(payload.features) ? payload.features : [];

  return features
    .filter((feature) => Array.isArray(feature?.center) && feature.center.length === 2)
    .map((feature) => {
      const longitude = Number(feature.center[0]);
      const latitude = Number(feature.center[1]);
      const label = (feature.text as string | undefined) ?? (feature.place_name as string | undefined) ?? trimmed;
      const description = (feature.place_name as string | undefined) ?? label;

      return {
        placeId: (feature.id as string | undefined) ?? `${latitude},${longitude}`,
        label,
        description,
        latitude,
        longitude,
        countryCode: extractCountryCode(feature),
      } satisfies LocationSelection;
    });
}

export { MIN_QUERY_LENGTH as MIN_LOCATION_QUERY_LENGTH };
