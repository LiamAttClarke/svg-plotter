import { SVGNodeTransformer } from '../types';
import * as mathUtils from '../math-utils';
import { createFeature, svgPointToCoordinate } from '../utils';
import Vector2 from '../Vector2';

/** Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect */
const rectTransformer: SVGNodeTransformer = (input, svgMeta, options) => {
  const x = parseFloat(input.attributes.x);
  const y = parseFloat(input.attributes.y);
  const width = parseFloat(input.attributes.width);
  const height = parseFloat(input.attributes.height);
  const rx = mathUtils.clamp(parseFloat(input.attributes.rx), 0, width * 0.5);
  const ry = mathUtils.clamp(parseFloat(input.attributes.ry), 0, height * 0.5);
  const ring: Vector2[] = [];
  if (rx || ry) {
    const topLeftCorner = mathUtils.drawCurve(
      (t) => mathUtils.pointOnEllipse(new Vector2(x + rx, y + ry), rx, ry, t),
      options.subdivideThreshold,
      0.5,
      0.75,
    );
    const topRightCorner = mathUtils.drawCurve(
      (t) => mathUtils.pointOnEllipse(new Vector2(x + width - rx, y + ry), rx, ry, t),
      options.subdivideThreshold,
      0.75,
      1,
    );
    const bottomRightCorner = mathUtils.drawCurve(
      (t) => mathUtils.pointOnEllipse(new Vector2(x + width - rx, y + height - ry), rx, ry, t),
      options.subdivideThreshold,
      0,
      0.25,
    );
    const bottomLeftCorner = mathUtils.drawCurve(
      (t) => mathUtils.pointOnEllipse(new Vector2(x + rx, y + height - ry), rx, ry, t),
      options.subdivideThreshold,
      0.25,
      0.5,
    );
    const isMaxRadiusX = rx * 2 >= width;
    const isMaxRadiusY = ry * 2 >= height;
    ring.push(
      ...topLeftCorner,
      ...(isMaxRadiusX ? topRightCorner : topRightCorner.slice(1)),
      ...(isMaxRadiusY ? bottomRightCorner : bottomRightCorner.slice(1)),
      ...(isMaxRadiusX ? bottomLeftCorner : bottomLeftCorner.slice(1)),
    );
    if (!isMaxRadiusY) {
      // Close polygon
      ring.push(ring[0]);
    }
  } else {
    ring.push(
      new Vector2(x, y),
      new Vector2(x + width, y),
      new Vector2(x + width, y + height),
      new Vector2(x, y + height),
    );
    // Close polygon
    ring.push(ring[0]);
  }
  const id = options.idMapper ? options.idMapper(input) : null;
  const properties = options.propertyMapper ? options.propertyMapper(input) : null;
  const geometry: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [
      ring.map((p) => svgPointToCoordinate(p, svgMeta, options, input.attributes.transform)),
    ],
  };
  return {
    features: [createFeature(geometry, id, properties)],
    children: [],
  };
};

export default rectTransformer;
