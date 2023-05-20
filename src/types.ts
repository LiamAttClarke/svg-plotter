/// <reference types="@types/geojson" />
// TODO: Remove when this issue is resolved: https://github.com/denoland/dnt/issues/297
/// <reference types="@types/svg-path-parser" />
// TODO: Replace with https://github.com/DefinitelyTyped/DefinitelyTyped/pull/65551
/// <reference path="./typings/geojson-validation.d.ts" />

import { INode } from "svgson";
import { Coordinate } from "./lib/gis-utils.ts";

export interface SVGMetaData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FeaturePropertyMapper {
  // deno-lint-ignore no-explicit-any
  (input: INode): Record<string, any>;
}
export interface FeatureIdMapper {
  (input: INode): number | string;
}

export interface ConvertSVGOptions {
  /** Geographic coordinate to center the SVG geometry around (default: { lon: 0, lat: 0 }) */
  center: Coordinate;
  /** Width in metres. (default: 1000e3 ie. 1000km) */
  width: number;
  /** Angle in degrees to rotate geometry clockwise around it's center. (default: 0) */
  bearing: number;
  /** Angle in degrees at which to subdivide curves.
   *  Decrease this number for smoother curves. (Default: 5) */
  subdivideThreshold: number;
  /** Function that gets called to set the id of each GeoJSON feature.
   *  In the case of an SVG Path, multiple GeoJSON Features may be generated.
   *  Id's default to `null`. */
  idMapper?: FeatureIdMapper;
  /** Function that gets called to set the properties of each GeoJSON feature.
   *  Properties default to `null`. */
  propertyMapper?: FeaturePropertyMapper;
}

export interface SVGNodeTransformerOutput {
  features: GeoJSON.Feature[];
  children: INode[];
}

export interface SVGNodeTransformer {
  (
    node: INode,
    svgMeta: SVGMetaData,
    options: ConvertSVGOptions,
  ): SVGNodeTransformerOutput;
}
