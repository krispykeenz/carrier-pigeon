const EARTH_RADIUS_KM = 6371;

export function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function estimateFlightHours(distanceKm: number, speedKmh: number) {
  return distanceKm / speedKmh;
}

export function estimateArrival(launchISO: string, hours: number) {
  const launch = new Date(launchISO);
  return new Date(launch.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function progressBetween(startISO: string, endISO: string, now: Date = new Date()) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  const current = now.getTime();
  if (current <= start) return 0;
  if (current >= end) return 1;
  return (current - start) / (end - start);
}
