import { ConvertSVGOptions } from "./types.ts";

// GeoJSON Spec Recommendation: https://datatracker.ietf.org/doc/html/rfc7946#section-11.2
export const GEOJSON_NUMERIC_PRECISION = 6;

export const DEFAULT_CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 2,
};
