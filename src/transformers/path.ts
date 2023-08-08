import * as svgPathParser from 'svg-path-parser';
import { SVGNodeTransformer } from '../types';
import { createFeature, svgPointToCoordinate } from '../utils';
import Vector2 from '../Vector2';
import * as mathUtils from '../math-utils';

// Command types are missing x0, y0 properties
interface EllipticalArcCommand extends svgPathParser.EllipticalArcCommand {
  x0: number;
  y0: number;
}

interface CurveToCommand extends svgPathParser.CurveToCommand {
  x0: number;
  y0: number;
}

interface QuadraticCurveToCommand extends svgPathParser.QuadraticCurveToCommand {
  x0: number;
  y0: number;
}

/** Reference:  https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths */
const pathTransformer: SVGNodeTransformer = (stack, svgMeta, options) => {
  const input = stack.pop();
  const polygons: number[][][][] = [];
  const lineStrings: number[][][] = [];
  const points: number[][] = [];
  let currentLineString: number[][] = [];
  let currentPolygon: number[][][] = [];
  let previousCurveHandle: Vector2 = null;
  const pathCommands = svgPathParser.makeAbsolute(svgPathParser.parseSVG(input.attributes.d));
  pathCommands.forEach((pathCommand, i) => {
    const previousCommand = (i > 0) ? pathCommands[i - 1] : null;
    if (pathCommand.code === 'M') {
      const command = pathCommand as svgPathParser.MoveToCommand;
      if (currentLineString.length === 1) {
        points.push(currentLineString[0]);
      } else if (currentLineString.length > 1) {
        lineStrings.push(currentLineString);
      }
      currentLineString = [
        svgPointToCoordinate(
          new Vector2(command.x, command.y),
          svgMeta,
          options,
          input.attributes.transform,
        ),
      ];
    } else if (['L', 'V', 'H'].indexOf(pathCommand.code) !== -1) {
      const command = pathCommand as svgPathParser.LineToCommand;
      currentLineString.push(svgPointToCoordinate(
        new Vector2(command.x, command.y),
        svgMeta,
        options,
        input.attributes.transform,
      ));
    } else if (['C', 'S'].indexOf(pathCommand.code) !== -1) {
      const command = pathCommand as CurveToCommand;
      const p0 = new Vector2(command.x0, command.y0);
      let p1: Vector2;
      if (pathCommand.code === 'C') {
        p1 = new Vector2(command.x1, command.y1);
      } else {
        p1 = ['C', 'S'].indexOf(previousCommand.code) !== -1 ? p0.add(p0.subtract(previousCurveHandle)) : p0;
      }
      const p2 = new Vector2(command.x2, command.y2);
      const p3 = new Vector2(command.x, command.y);
      const curvePoints = mathUtils.drawCurve(
        (t: number) => mathUtils.pointOnCubicBezierCurve(p0, p1, p2, p3, t),
        options.subdivideThreshold,
      ).map((p) => svgPointToCoordinate(p, svgMeta, options, input.attributes.transform));
      currentLineString = currentLineString.concat(curvePoints);
      previousCurveHandle = p2;
    } else if (['Q', 'T'].indexOf(pathCommand.code) !== -1) {
      const command = pathCommand as QuadraticCurveToCommand;
      const p0 = new Vector2(command.x0, command.y0);
      let p1: Vector2;
      if (pathCommand.code === 'Q') {
        p1 = new Vector2(command.x1, command.y1);
      } else {
        p1 = ['Q', 'T'].indexOf(previousCommand.code) !== -1 ? p0.add(p0.subtract(previousCurveHandle)) : p0;
      }
      const p2 = new Vector2(command.x, command.y);
      const curvePoints = mathUtils.drawCurve(
        (t: number) => mathUtils.pointOnQuadraticBezierCurve(p0, p1, p2, t),
        options.subdivideThreshold,
      ).map((p) => svgPointToCoordinate(p, svgMeta, options, input.attributes.transform));
      currentLineString = currentLineString.concat(curvePoints);
      previousCurveHandle = p1;
    } else if (pathCommand.code === 'A') {
      const command = pathCommand as EllipticalArcCommand;
      const p0 = new Vector2(command.x0, command.y0);
      const p1 = new Vector2(command.x, command.y);
      const { rx } = command;
      const { ry } = command;
      const xAxisRotation = -command.xAxisRotation;
      const { largeArc } = command;
      const sweep = !command.sweep;
      const curvePoints = mathUtils.drawCurve(
        (t: number) => mathUtils.pointOnEllipticalArc(
          p0, p1, rx, ry, xAxisRotation, largeArc, sweep, t,
        ),
        options.subdivideThreshold,
      ).map((p) => svgPointToCoordinate(p, svgMeta, options, input.attributes.transform));
      currentLineString = currentLineString.concat(curvePoints);
    } else if (pathCommand.code === 'Z') {
      currentLineString.push(currentLineString[0]);

      const isLastCommand = i === pathCommands.length - 1;
      currentPolygon.push(currentLineString);

      if (isLastCommand) {
        polygons.push(currentPolygon);
        currentPolygon = [];
      }

      currentLineString = [];
    }
  });

  if (currentPolygon.length) {
    polygons.push(currentPolygon);
  }

  if (currentLineString.length === 1) {
    points.push(currentLineString[0]);
  } else if (currentLineString.length > 1) {
    lineStrings.push(currentLineString);
  }

  const features: GeoJSON.Feature[] = [];
  const properties = options.propertyMapper ? options.propertyMapper(input, { stack }) : null;
  if (points.length) {
    points.forEach((point) => {
      const id = options.idMapper ? options.idMapper(input) : null;
      const geometry: GeoJSON.Geometry = {
        type: 'Point',
        coordinates: point,
      };
      features.push(createFeature(geometry, id, properties));
    });
  }
  if (lineStrings.length) {
    lineStrings.forEach((lineString) => {
      const id = options.idMapper ? options.idMapper(input) : null;
      const geometry: GeoJSON.Geometry = {
        type: 'LineString',
        coordinates: lineString,
      };
      features.push(createFeature(geometry, id, properties));
    });
  }
  if (polygons.length) {
    const polygonFeatures = polygons.map((polygon) => {
      const id = options.idMapper ? options.idMapper(input) : null;
      const geometry: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: polygon,
      };
      return createFeature(geometry, id, properties);
    });
    features.push(polygonFeatures[0]);
    // features.push(
    //   polygonFeatures.length > 1
    //     ? compositePolygons(polygonFeatures, properties)
    //     : polygonFeatures[0],
    // );
  }
  return {
    features,
    children: [],
  };
};

export default pathTransformer;
