import { toDegrees, toRadians } from "./math-utils.ts";

export const EARTH_RADIUS_M = 6371e3;
export const EARTH_CIRCUMFERENCE_M = Math.PI * EARTH_RADIUS_M * 2;

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Computes distance between two points on a sphere.
 * Reference: https://en.wikipedia.org/wiki/Haversine_formula
 *
 * @param a start coordinate
 * @param b end coordinate
 * @param radius Radius of sphere in metres (defaults to Earth's radius (6,371,000 metres))
 * @returns distance in metres between a and b
 */
export function haversineDistance(
  a: Coordinate,
  b: Coordinate,
  radius: number = EARTH_RADIUS_M,
): number {
  const latARad = toRadians(a.latitude);
  const latBRad = toRadians(b.latitude);
  const latDeltaRad = latBRad - latARad;
  const lonDeltaRad = toRadians(b.longitude - a.longitude);
  const halfChordLengthSquared =
    Math.sin(latDeltaRad * 0.5) * Math.sin(latDeltaRad * 0.5) +
    Math.cos(latARad) * Math.cos(latBRad) *
      Math.sin(lonDeltaRad * 0.5) * Math.sin(lonDeltaRad * 0.5);
  const angularDistance = 2 * Math.atan2(
    Math.sqrt(halfChordLengthSquared),
    Math.sqrt(1 - halfChordLengthSquared),
  );
  return radius * angularDistance;
}

/**
 * Computes a new spherical coordinate offset from an origin by a given distance and bearing.
 * Reference: http://www.movable-type.co.uk/scripts/latlong.html
 * @param origin origin coordinate to offset from
 * @param distance number of metres to offset from origin
 * @param bearing bearing (degrees) to offset in from origin (eg. North: 0, South: 180)
 * @param radius Radius of sphere in metres (defaults to Earth's radius (6,371,000 metres))
 * @returns New coordinate offset for the provided origin
 */
export function offsetCoordinate(
  origin: Coordinate,
  distance: number,
  bearing: number,
  radius: number = EARTH_RADIUS_M,
): Coordinate {
  const delta = distance / radius; // angular distance in radians
  const theta = toRadians(bearing);

  const phi1 = toRadians(origin.latitude);
  const lambda1 = toRadians(origin.longitude);

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) +
      Math.cos(phi1) * Math.sin(delta) * Math.cos(theta),
  );

  let lambda2 = lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2),
    );

  // Normalize to [-180, 180]
  lambda2 = (lambda2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

  return { longitude: toDegrees(lambda2), latitude: toDegrees(phi2) };
}
