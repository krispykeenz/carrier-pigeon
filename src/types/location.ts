export interface LocationSelection {
  placeId: string;
  label: string;
  description: string;
  latitude: number;
  longitude: number;
  countryCode?: string | null;
}

export interface ResolvedLocation {
  label: string;
  description: string;
  latitude: number;
  longitude: number;
  countryCode?: string | null;
  source: "profile" | "legacy" | "fallback";
}
