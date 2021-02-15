import { SVGNodeTransformer } from '../types';
import { createFeature, parseSVGPointsString, svgPointToCoordinate } from '../utils';

/** Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon */
const polygonTransformer: SVGNodeTransformer = (node, svgMeta, options) => {
  const points = parseSVGPointsString(node.attributes.points)
    .map((p) => svgPointToCoordinate(p, svgMeta, options, node.attributes.transform));
  points.push(points[0]);
  const id = options.idMapper ? options.idMapper(node) : null;
  const properties = options.propertyMapper ? options.propertyMapper(node) : null;
  const geometry: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [points],
  };
  return {
    features: [createFeature(geometry, id, properties)],
    children: [],
  };
};

export default polygonTransformer;
