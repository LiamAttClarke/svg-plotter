import { SVGNodeTransformer } from '../types';
import { createFeature, svgPointToCoordinate } from '../utils';
import Vector2 from '../Vector2';
import * as mathUtils from '../math-utils';

/**
 * Ellipse reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
 * Circle reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
*/
const ellipseTransformer: SVGNodeTransformer = (stack, svgMeta, options) => {
  const input = stack.pop();
  const center = new Vector2(parseFloat(input.attributes.cx), parseFloat(input.attributes.cy));
  let rx = 0;
  let ry = 0;
  if (input.attributes.r) {
    rx = parseFloat(input.attributes.r);
    ry = rx;
  } else {
    rx = parseFloat(input.attributes.rx);
    ry = parseFloat(input.attributes.ry);
  }
  const points = mathUtils.drawCurve(
    (t: number) => mathUtils.pointOnEllipse(center, rx, ry, t),
    options.subdivideThreshold,
  ).map((p) => svgPointToCoordinate(p, svgMeta, options, input.attributes.transform));
  // Ensure first and last points are identical
  // eslint-disable-next-line prefer-destructuring
  points[points.length - 1] = points[0];
  const id = options.idMapper ? options.idMapper(input) : null;
  const properties = options.propertyMapper ? options.propertyMapper(input, { stack }) : null;
  const geometry: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [points],
  };
  return {
    features: [createFeature(geometry, id, properties)],
    children: [],
  };
};

export default ellipseTransformer;
