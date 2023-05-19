import * as svgTransformParser from "ya-svg-transform";
import { ConvertSVGOptions, SVGMetaData } from "../types.ts";
import { Vector2 } from "./Vector2.ts";
import { offsetCoordinate } from "./gis-utils.ts";
import { computeBearing } from "./math-utils.ts";
import { GEOJSON_NUMERIC_PRECISION } from "../constants.ts";

export function createFeature(
  geometry: GeoJSON.Geometry,
  id: string | number | null,
  properties: GeoJSON.GeoJsonProperties,
): GeoJSON.Feature {
  const feature: GeoJSON.Feature = {
    type: "Feature",
    geometry,
    properties,
  };
  if (id !== null) {
    feature.id = id;
  }
  return feature;
}

/** Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/points */
export function parseSVGPointsString(pointString: string): Vector2[] {
  const points: Vector2[] = [];
  const matches = pointString.match(/-?\d+(?:\.\d+)?/g);
  if (matches) {
    for (let i = 0; i < matches.length; i += 2) {
      if (i + 2 > matches.length) break;
      points.push(
        new Vector2(
          parseFloat(matches[i]),
          parseFloat(matches[i + 1]),
        ),
      );
    }
  }
  return points;
}

export function svgPointToCoordinate(
  point: Vector2,
  svgMeta: SVGMetaData,
  options: ConvertSVGOptions,
  svgTransform?: string,
): GeoJSON.Position {
  let point1 = point;
  // Apply SVG Transform
  if (svgTransform) {
    const transformedPoint = svgTransformParser.transform(svgTransform).apply(
      point,
    );
    point1 = new Vector2(transformedPoint.x, transformedPoint.y);
  }
  // Normalize point to [0,1] range, flip y-axis
  const aspect = svgMeta.width / svgMeta.height;
  const outputPoint = new Vector2(
    (point1.x - svgMeta.x) / (svgMeta.width) - 0.5,
    1 - (point1.y - svgMeta.y) / (svgMeta.height * aspect) - 0.5,
  );
  // Transform to coordinate
  const pointDistanceFromOrigin = outputPoint.magnitude() * options.width;
  const pointBearing = computeBearing(outputPoint) + options.bearing;
  const coordinate = offsetCoordinate(
    options.center,
    pointDistanceFromOrigin,
    pointBearing,
  );
  return [
    parseFloat(coordinate.longitude.toPrecision(GEOJSON_NUMERIC_PRECISION)),
    parseFloat(coordinate.latitude.toPrecision(GEOJSON_NUMERIC_PRECISION)),
  ];
}
