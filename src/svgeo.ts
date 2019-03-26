import * as svgson from "svgson";
import * as svgPathParser from "svg-path-parser";
import * as svgTransformParser from "ya-svg-transform";
import { mercator } from "projections";
import * as mathUtils from "./math-utils";
import Vector2 from "./Vector2";

export interface ConvertSVGOptions {
  center?:Coordinate,
  scale?:number, // TODO: Replace with metres wide
  subdivideThreshold?:number,
  idMapper?:FeatureIdMapper,
  propertyMapper?:FeaturePropertyMapper
  // TODO: Add floating point precision option?
}

export interface SVGMetaData {
  width:number,
  height:number
}

export interface Coordinate {
  latitude:number,
  longitude:number
}

export interface FeatureIdMapper {
  (input:svgson.SVGObject):number|string;
}

export interface FeaturePropertyMapper {
  (input:svgson.SVGObject):Object;
}

interface IVectorFeatureTransformer {
  (input:svgson.SVGObject, svgMeta:SVGMetaData, options:ConvertSVGOptions):GeoJSON.Feature[];
}

const transformers:{[key:string]:IVectorFeatureTransformer} = {
  svg: groupTransformer,
  g: groupTransformer,
  line: lineTransformer,
  rect: rectTransformer,
  polyline: polylineTransformer,
  polygon: polygonTransformer,
  circle: ellipseTransformer,
  ellipse: ellipseTransformer,
  path: pathTransformer
};

export async function convertSVG(input:string, options:ConvertSVGOptions = {}):Promise<GeoJSON.FeatureCollection> {
  // Set default options
  options.center = options.center || { longitude: 0, latitude: 0 };
  options.scale = options.scale || 1;
  options.subdivideThreshold = options.subdivideThreshold || 5;
  // Parse svg
  const parsedSVG = await svgson.parse(input, { camelcase: true });
  // Set svg metadata
  // TODO: Account for different width and height units other than px
  if (!parsedSVG.attributes.width || !parsedSVG.attributes.height) {
    throw new Error("SVG is missing width and height attributes.");
  }
  const svgMeta:SVGMetaData = {
    width: parseFloat(parsedSVG.attributes.width),
    height: parseFloat(parsedSVG.attributes.height)
  };
  // Convert SVG to GeoJSON
  const output:GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: transformers.svg(parsedSVG, svgMeta, options)
  };

  return output;
}

export function groupTransformer(input: svgson.SVGObject, svgMeta:SVGMetaData, options:ConvertSVGOptions):GeoJSON.Feature[] {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g
  let features:Array<GeoJSON.Feature> = []
  input.children.forEach(child => {
    const transform = transformers[child.name];
    if (transform) {
      features.push(...transform(child, svgMeta, options));
    } else {
      console.warn(`Skipping node, "${child.name}" is not supported.`);
    }
  })
  return features;
}

export function lineTransformer(input: svgson.SVGObject, svgMeta:SVGMetaData, options:ConvertSVGOptions):GeoJSON.Feature[] {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
  const id = options.idMapper ? options.idMapper(input) : null;
  const properties = options.propertyMapper ? options.propertyMapper(input) : null;
  const geometry:GeoJSON.LineString = {
    type: "LineString",
    coordinates: [
      svgPointToCoordinate(new Vector2(input.attributes.x1, input.attributes.y1), svgMeta, options),
      svgPointToCoordinate(new Vector2(input.attributes.x2, input.attributes.y2), svgMeta, options)
    ]
  };
  return [createFeature(geometry, id, properties)];
}

export function rectTransformer(input: svgson.SVGObject, svgMeta:SVGMetaData, options:ConvertSVGOptions):GeoJSON.Feature[] {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
  const x = parseFloat(input.attributes.x);
  const y = parseFloat(input.attributes.y);
  const width = parseFloat(input.attributes.width);
  const height = parseFloat(input.attributes.height);
  const ring = [
    svgPointToCoordinate(new Vector2(x, y), svgMeta, options),
    svgPointToCoordinate(new Vector2(x + width, y), svgMeta, options),
    svgPointToCoordinate(new Vector2(x + width, y + height), svgMeta, options),
    svgPointToCoordinate(new Vector2(x, y + height), svgMeta, options)
  ]
  ring.push(ring[0]);
  const id = options.idMapper ? options.idMapper(input) : null;
  const properties = options.propertyMapper ? options.propertyMapper(input) : null;
  const geometry:GeoJSON.Polygon = {
    type: "Polygon",
    coordinates: [ring]
  };
  return [createFeature(geometry, id, properties)];
}

export function polylineTransformer(input: svgson.SVGObject, svgMeta:SVGMetaData, options:ConvertSVGOptions):GeoJSON.Feature[] {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline
  const features: GeoJSON.Feature[] = [];
  let points = parseSVGPointsString(input.attributes.points).map(p => svgPointToCoordinate(p, svgMeta, options));
  let geometry: GeoJSON.Geometry = null;
  if (points.length > 1) {
    geometry = {
      type: "LineString",
      coordinates: points
    };
  } else if (points.length === 1) {
    geometry = {
      type: "Point",
      coordinates: points[0]
    };
  }
  if (geometry) {
    const id = options.idMapper ? options.idMapper(input) : null;
    const properties = options.propertyMapper ? options.propertyMapper(input) : null;
    features.push(createFeature(geometry, id, properties));
  }
  return features;
}

export function polygonTransformer(input: svgson.SVGObject, svgMeta:SVGMetaData, options:ConvertSVGOptions):GeoJSON.Feature[] {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon
  const points = parseSVGPointsString(input.attributes.points).map(p => svgPointToCoordinate(p, svgMeta, options));
  points.push(points[0]);
  const id = options.idMapper ? options.idMapper(input) : null;
  const properties = options.propertyMapper ? options.propertyMapper(input) : null;
  const geometry:GeoJSON.Polygon = {
    type: "Polygon",
    coordinates: [points]
  };
  return [createFeature(geometry, id, properties)];
}

export function ellipseTransformer(input: svgson.SVGObject, svgMeta:SVGMetaData, options:ConvertSVGOptions):GeoJSON.Feature[] {
  // Circle reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
  // Ellipse reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
  const center = new Vector2(parseFloat(input.attributes.cx), parseFloat(input.attributes.cy));
  let rx = 0;
  let ry = 0;
  if (input.attributes.r) {
      rx = ry = parseFloat(input.attributes.r)
  } else {
      rx = parseFloat(input.attributes.rx)
      ry = parseFloat(input.attributes.ry)
  }
  const points = mathUtils.drawCurve((t:number) => mathUtils.pointOnEllipse(center, rx, ry, t), options.subdivideThreshold)
    .map(p => svgPointToCoordinate(p, svgMeta, options));
  const id = options.idMapper ? options.idMapper(input) : null;
  const properties = options.propertyMapper ? options.propertyMapper(input) : null;
  const geometry:GeoJSON.Polygon = {
    type: "Polygon",
    coordinates: [points]
  };
  return [createFeature(geometry, id, properties)];
}

export function pathTransformer(input: svgson.SVGObject, svgMeta:SVGMetaData, options:ConvertSVGOptions):GeoJSON.Feature[] {
  // Reference:  https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
  const polygons:number[][][] = [];
  const lineStrings:number[][][] = [];
  const points:number[][] = [];
  let currentLineString:number[][] = [];
  let previousCurveHandle:Vector2 = null;
  const pathCommands = svgPathParser.makeAbsolute(svgPathParser.parseSVG(input.attributes.d));
  pathCommands.forEach((pathCommand, i) => {
    const previousCommand = (i > 0) ? pathCommands[i - 1] : null;
    type LineCommand = svgPathParser.LineToCommand&svgPathParser.HorizontalLineToCommand&svgPathParser.VerticalLineToCommand;
    if (pathCommand.code === "M") {
      const command = <svgPathParser.MoveToCommand>pathCommand;
      if (currentLineString.length === 1) {
        points.push(currentLineString[0]);
      } else if (currentLineString.length > 1) {
        lineStrings.push(currentLineString);
      }
      currentLineString = [svgPointToCoordinate(new Vector2(command.x, command.y), svgMeta, options)];
    } else if (["L", "V", "H"].indexOf(pathCommand.code) !== -1) {
      const command = <LineCommand>pathCommand;
      currentLineString.push(svgPointToCoordinate(new Vector2(command.x, command.y), svgMeta, options));
    } else if (["C", "S"].indexOf(pathCommand.code) !== -1) {
      const command = <svgPathParser.CurveToCommand>pathCommand;
      const p0 = new Vector2((command as any).x0, (command as any).y0); // Type does not include x0 and y0
      let p1:Vector2;
      if (pathCommand.code === "C") {
        p1 = new Vector2(command.x1, command.y1);
      } else {
        p1 = ["C", "S"].indexOf(previousCommand.code) !== -1 ? p0.add(p0.subtract(previousCurveHandle)) : p0;
      }
      const p2 = new Vector2(command.x2, command.y2);
      const p3 = new Vector2(command.x, command.y);
      const curvePoints = mathUtils.drawCurve((t:number) => mathUtils.pointOnCubicBezierCurve(p0, p1, p2, p3, t), options.subdivideThreshold)
        .map(p => svgPointToCoordinate(p, svgMeta, options));
      currentLineString = currentLineString.concat(curvePoints);
      previousCurveHandle = p2;
    } else if (["Q", "T"].indexOf(pathCommand.code) !== -1) {
      const command = <svgPathParser.QuadraticCurveToCommand>pathCommand;
      const p0 = new Vector2((command as any).x0, (command as any).y0); // Type does not include x0 and y0
      let p1:Vector2;
      if (pathCommand.code === "Q") {
        p1 = new Vector2(command.x1, command.y1);
      } else {
        p1 = ["Q", "T"].indexOf(previousCommand.code) !== -1 ? p0.add(p0.subtract(previousCurveHandle)) : p0;
      }
      const p2 = new Vector2(command.x, command.y);
      const curvePoints = mathUtils.drawCurve((t:number) => mathUtils.pointOnQuadraticBezierCurve(p0, p1, p2, t), options.subdivideThreshold)
        .map(p => svgPointToCoordinate(p, svgMeta, options));
      currentLineString = currentLineString.concat(curvePoints);
      previousCurveHandle = p1;
    } else if (pathCommand.code === "A") {
      const command = <svgPathParser.EllipticalArcCommand>pathCommand;
      const p0 = new Vector2((command as any).x0, (command as any).y0); // Type definition does not include x0 and y0
      const p1 = new Vector2(command.x, command.y);
      const rx = command.rx;
      const ry = command.ry;
      const xAxisRotation = -command.xAxisRotation;
      const largeArc = command.largeArc;
      const sweep = !command.sweep;
      const curvePoints = mathUtils.drawCurve((t:number) => mathUtils.pointOnEllipticalArc(p0, p1, rx, ry, xAxisRotation, largeArc, sweep, t), options.subdivideThreshold)
        .map(p => svgPointToCoordinate(p, svgMeta, options));
      currentLineString = currentLineString.concat(curvePoints);
    } else if (pathCommand.code === "Z") {
      currentLineString.push(currentLineString[0]);
      polygons.push(currentLineString);
      currentLineString = [];
    }
  });
  if (currentLineString.length === 1) {
    points.push(currentLineString[0]);
  } else if (currentLineString.length > 1) {
    lineStrings.push(currentLineString);
  }
  let features:GeoJSON.Feature[] = [];
  const properties = options.propertyMapper ? options.propertyMapper(input) : null;
  if (points.length) {
    points.forEach(point => {
      const id = options.idMapper ? options.idMapper(input) : null;
      const geometry:GeoJSON.Geometry = {
        type: 'Point',
        coordinates: point
      };
      features.push(createFeature(geometry, id, properties));
    });
  }
  if (lineStrings.length) {
    lineStrings.forEach(lineString => {
      const id = options.idMapper ? options.idMapper(input) : null;
      const geometry:GeoJSON.Geometry = {
        type: 'LineString',
        coordinates: lineString
      };
      features.push(createFeature(geometry, id, properties));
    })
  }
  if (polygons.length) {
    const polygonFeatures = polygons.map(polygon => {
      const id = options.idMapper ? options.idMapper(input) : null;
      const geometry:GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: [polygon]
      };
      return createFeature(geometry, id, properties);
    });
    features.push(polygonFeatures[0]);
    // features.push(polygonFeatures.length > 1 ? compositePolygons(polygonFeatures, properties) : polygonFeatures[0]);
  }
  return features;
}

// function compositePolygons(polygonFeatures, properties) {
//   if (!polygonFeatures) {
//       throw new Error('PolygonFeatures is a required argument.')
//   } else if (polygonFeatures.length < 2) {
//       throw new Error('PolygonFeatures must contain 2 or more polygon features.')
//   }
//   const multiPolygonCoordinates = []
//   const capturedPolygonIndeces = []
//   for (let i = 0; i < polygonFeatures.length; i++) {
//       if (capturedPolygonIndeces.includes(i)) { continue }
//       capturedPolygonIndeces.push(i)
//       const currentPolygon = polygonFeatures[i]
//       const polygonGroup = [i]
//       for (let j = i + 1; j < polygonFeatures.length; j++) {
//           if (capturedPolygonIndeces.includes(j)) { continue }
//           const nextPolygon = polygonFeatures[j]
//           if (geojsonUtils.arePolygonsNested(currentPolygon, nextPolygon)) {
//               capturedPolygonIndeces.push(j)
//               polygonGroup.push(j)
//           }
//       }
//       // Construct polygon
//       let polygonCoordinates = []
//       polygonGroup.forEach(index => {
//           polygonCoordinates = polygonCoordinates.concat(polygonFeatures[index].geometry.coordinates)
//       })
//       multiPolygonCoordinates.push(polygonCoordinates)
//   }
//   return mapToFeature('MultiPolygon', multiPolygonCoordinates, properties)
// }

export function createFeature(geometry:GeoJSON.Geometry, id: string|number|null, properties:GeoJSON.GeoJsonProperties):GeoJSON.Feature {
  const feature:GeoJSON.Feature = {
    type: 'Feature',
    geometry,
    properties
  };
  if (id !== null) {
    feature.id = id;
  }
  return feature;
}

export function parseSVGPointsString(pointString:string):Vector2[] {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/points
  let points:Vector2[] = [];
  const matches = pointString.match(/\-?\d+(?:\.\d+)?/g);
  if (matches) {
    for (let i = 0; i < matches.length; i += 2) {
      if (i + 2 > matches.length) break;
      points.push(new Vector2(
        parseFloat(matches[i]),
        parseFloat(matches[i + 1])
      ));
    }
  }
  return points;
}

export function svgPointToCoordinate(point:Vector2, svgMeta:SVGMetaData, options:ConvertSVGOptions, svgTransform?:string):GeoJSON.Position {
  // Apply SVG Transform
  // TODO: Account for nested transforms D:
  if (svgTransform) {
    const transformedPoint = svgTransformParser.transform(svgTransform).apply(point);
    point = new Vector2(transformedPoint.x, transformedPoint.y);
  }
  // Normalize point to range [0,1] and apply scale
  const halfWidth = svgMeta.width * 0.5;
  const halfHeight = svgMeta.height * 0.5;
  const aspect = svgMeta.width / svgMeta.height;
  const normalizedPoint = new Vector2(
    mathUtils.clamp(((point.x - halfWidth) * options.scale + halfWidth) / svgMeta.width * aspect, 0, 1),
    mathUtils.clamp(((point.y - halfHeight) * options.scale + halfHeight) / svgMeta.height, 0, 1)
  );
  // Apply mercator projection
  const projectedCoord = mercator(normalizedPoint);
  // Offset position from options.center
  return [
    options.center.longitude + projectedCoord.lon,
    options.center.latitude + projectedCoord.lat
  ];
}
