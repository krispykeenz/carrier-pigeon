import type { ProfileRow } from "@/types/database";
import { DEFAULT_LEGACY_LOCATION, getLegacyLocationById, legacyLocationToGeoPoint } from "@/constants/locations";
import type { ResolvedLocation } from "@/types/location";

interface ResolveOptions {
  fallbackToDefault?: boolean;
}

function createResolvedLocation(
  label: string,
  description: string,
  latitude: number,
  longitude: number,
  source: ResolvedLocation["source"],
  countryCode?: string | null
): ResolvedLocation {
  return {
    label,
    description,
    latitude,
    longitude,
    countryCode: countryCode ?? null,
    source,
  };
}

export function resolveProfileLocation(
  profile: ProfileRow | null | undefined,
  options: ResolveOptions = {}
): ResolvedLocation | null {
  if (!profile) return null;

  if (profile.home_location_latitude != null && profile.home_location_longitude != null) {
    const label = profile.home_location_label ?? profile.home_location_id ?? "Unknown loft";
    return createResolvedLocation(
      label,
      label,
      profile.home_location_latitude,
      profile.home_location_longitude,
      "profile",
      profile.home_location_country_code
    );
  }

  const legacy = getLegacyLocationById(profile.home_location_id);
  if (legacy) {
    const fallback = legacyLocationToGeoPoint(legacy);
    const label = profile.home_location_label ?? fallback.label;
    const description = profile.home_location_label ?? fallback.description;
    return createResolvedLocation(label, description, fallback.latitude, fallback.longitude, "legacy");
  }

  if (options.fallbackToDefault && DEFAULT_LEGACY_LOCATION) {
    const fallback = legacyLocationToGeoPoint(DEFAULT_LEGACY_LOCATION);
    return createResolvedLocation(
      fallback.label,
      fallback.description,
      fallback.latitude,
      fallback.longitude,
      "fallback"
    );
  }

  return null;
}
