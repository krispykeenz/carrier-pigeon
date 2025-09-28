export type PostalLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  mapPosition: {
    x: number;
    y: number;
  };
};

export const LOCATIONS: PostalLocation[] = [
  {
    id: 'nyc',
    name: 'New York City, USA',
    latitude: 40.7128,
    longitude: -74.006,
    description: 'Bustling eastern US metropolis, a common departure perch.',
    mapPosition: { x: 0.32, y: 0.36 },
  },
  {
    id: 'ldn',
    name: 'London, United Kingdom',
    latitude: 51.5072,
    longitude: -0.1276,
    description: 'Historic roost along the Thames.',
    mapPosition: { x: 0.47, y: 0.31 },
  },
  {
    id: 'tko',
    name: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    description: 'Neon skies over the Pacific.',
    mapPosition: { x: 0.83, y: 0.36 },
  },
  {
    id: 'syd',
    name: 'Sydney, Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    description: 'Harbour breezes and eucalyptus thermals.',
    mapPosition: { x: 0.87, y: 0.78 },
  },
  {
    id: 'cpt',
    name: 'Cape Town, South Africa',
    latitude: -33.9249,
    longitude: 18.4241,
    description: 'Cliffs of the Cape, a southern waypoint.',
    mapPosition: { x: 0.53, y: 0.78 },
  },
  {
    id: 'scl',
    name: 'Santiago, Chile',
    latitude: -33.4489,
    longitude: -70.6693,
    description: 'High Andes air currents for determined birds.',
    mapPosition: { x: 0.21, y: 0.69 },
  },
];

export const DEFAULT_LEGACY_LOCATION = LOCATIONS[0];

export function getLegacyLocationById(id: string | null | undefined) {
  if (!id) return null;
  return LOCATIONS.find((loc) => loc.id === id) ?? null;
}

export function legacyLocationToGeoPoint(location: PostalLocation) {
  return {
    label: location.name,
    description: location.description,
    latitude: location.latitude,
    longitude: location.longitude,
  } as const;
}
