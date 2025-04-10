// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  userLat: number,
  userLng: number,
  collegeLat: number,
  collegeLng: number,
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const earthRadius = 6371000; // Earth's radius in meters
  const dLat = toRadians(collegeLat - userLat);
  const dLng = toRadians(collegeLng - userLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(userLat)) *
      Math.cos(toRadians(collegeLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInMeters = earthRadius * c;

  const isWithinRange = distanceInMeters <= 500; // 500 meters range

  return { distanceInMeters, isWithinRange };
}
