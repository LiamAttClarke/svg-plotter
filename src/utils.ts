import { mercator } from 'projections';
import * as svgTransformParser from 'ya-svg-transform';
import { ConvertSVGOptions, SVGMetaData } from './types';
import Vector2 from './Vector2';
import { toRadians, clamp } from './math-utils';
import { EARTH_CIRCUMFERENCE } from './constants';

export function createFeature(
  geometry: GeoJSON.Geometry,
  id: string|number|null,
  properties: GeoJSON.GeoJsonProperties,
): GeoJSON.Feature {
  const feature: GeoJSON.Feature = {
    type: 'Feature',
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
      points.push(new Vector2(
        parseFloat(matches[i]),
        parseFloat(matches[i + 1]),
      ));
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
    const transformedPoint = svgTransformParser.transform(svgTransform).apply(point);
    point1 = new Vector2(transformedPoint.x, transformedPoint.y);
  }
  // Normalize point to [0,1] range
  const aspect = svgMeta.width / svgMeta.height;
  let outputPoint = new Vector2(
    (point1.x - svgMeta.x) / (svgMeta.width * aspect),
    (point1.y - svgMeta.y) / svgMeta.height,
  );
  // Scale, rotate, and offset point
  const scale = options.width / EARTH_CIRCUMFERENCE;
  const centerPoint = mercator({ lon: options.center.longitude, lat: options.center.latitude });
  // Scale point
  outputPoint = outputPoint
    .subtractScalar(0.5)
    .multiplyByScalar(scale);
  // Rotate point
  if (options.bearing) {
    const rotation = toRadians(options.bearing);
    outputPoint = new Vector2(
      outputPoint.x * Math.cos(rotation) - outputPoint.y * Math.sin(rotation),
      outputPoint.x * Math.sin(rotation) + outputPoint.y * Math.cos(rotation),
    );
  }
  // Translate point
  outputPoint = outputPoint.add(centerPoint as Vector2);
  // Clamp values to [0,1] range
  outputPoint = new Vector2(
    clamp(outputPoint.x, 0, 1),
    clamp(outputPoint.y, 0, 1),
  );
  // Apply mercator projection
  const projectedCoord = mercator(outputPoint);
  return [projectedCoord.lon, projectedCoord.lat];
}
