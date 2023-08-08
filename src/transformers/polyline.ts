import { SVGNodeTransformer } from '../types';
import { createFeature, parseSVGPointsString, svgPointToCoordinate } from '../utils';

/** Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline */
const polylineTransformer: SVGNodeTransformer = (stack, svgMeta, options) => {
  const input = stack.pop();
  const features: GeoJSON.Feature[] = [];
  const points = parseSVGPointsString(input.attributes.points)
    .map((p) => svgPointToCoordinate(p, svgMeta, options, input.attributes.transform));
  let geometry: GeoJSON.Geometry = null;
  if (points.length > 1) {
    geometry = {
      type: 'LineString',
      coordinates: points,
    };
  } else if (points.length === 1) {
    geometry = {
      type: 'Point',
      coordinates: points[0],
    };
  }
  if (geometry) {
    const id = options.idMapper ? options.idMapper(input) : null;
    const properties = options.propertyMapper ? options.propertyMapper(input, { stack }) : null;
    features.push(createFeature(geometry, id, properties));
  }
  return {
    features,
    children: [],
  };
};

export default polylineTransformer;
