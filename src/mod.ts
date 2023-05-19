import { INode, parseSync as parseSVG } from "svgson";
import { ConvertSVGOptions, SVGMetaData, SVGNodeTransformer } from "./types.ts";
import * as Transformers from "./transformers/index.ts";
import { DEFAULT_CONVERT_OPTIONS } from "./constants.ts";

const transformers: { [key: string]: SVGNodeTransformer } = {
  svg: Transformers.group,
  g: Transformers.group,
  circle: Transformers.ellipse,
  ellipse: Transformers.ellipse,
  line: Transformers.line,
  path: Transformers.path,
  polyline: Transformers.polyline,
  polygon: Transformers.polygon,
  rect: Transformers.rect,
};

function svgNodeToFeatures(
  node: INode,
  svgMeta: SVGMetaData,
  options: ConvertSVGOptions,
): { features: GeoJSON.Feature[]; errors: string[] } {
  const outputFeatures: GeoJSON.Feature[] = [];
  const transformer = transformers[node.name];
  const errors: string[] = [];
  if (transformer) {
    const { features, children } = transformer(node, svgMeta, options);
    outputFeatures.push(...features);
    children.forEach((n) => {
      const childOutput = svgNodeToFeatures(n, svgMeta, options);
      outputFeatures.push(...childOutput.features);
      errors.push(...childOutput.errors);
    });
  } else {
    errors.push(`Skipping unsupported node: ${node.name}`);
  }
  return {
    features: outputFeatures,
    errors,
  };
}

export function getSVGMetadata(parsedSVG: INode): SVGMetaData {
  const svgMeta: SVGMetaData = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  if (parsedSVG.attributes.viewBox) {
    const coords = parsedSVG.attributes.viewBox.split(" ");
    svgMeta.x = parseFloat(coords[0]);
    svgMeta.y = parseFloat(coords[1]);
    svgMeta.width = parseFloat(coords[2]) - svgMeta.x;
    svgMeta.height = parseFloat(coords[3]) - svgMeta.y;
  } else if (parsedSVG.attributes.width && parsedSVG.attributes.height) {
    svgMeta.x = parseFloat(parsedSVG.attributes.x) || 0;
    svgMeta.y = parseFloat(parsedSVG.attributes.y) || 0;
    svgMeta.width = parseFloat(parsedSVG.attributes.width) - svgMeta.x;
    svgMeta.height = parseFloat(parsedSVG.attributes.height) - svgMeta.y;
  } else {
    throw new Error("SVG must have a viewBox or width/height attributes.");
  }
  return svgMeta;
}

export interface ConvertSVGOutput {
  geojson: GeoJSON.FeatureCollection;
  errors: string[];
}

export function convertSVG(
  input: string,
  options: Partial<ConvertSVGOptions> = {},
): ConvertSVGOutput {
  // Parse SVG
  const parsedSVG = parseSVG(input, { camelcase: true });
  const svgMeta = getSVGMetadata(parsedSVG);
  // Convert SVG to GeoJSON
  const { features, errors } = svgNodeToFeatures(parsedSVG, svgMeta, {
    ...DEFAULT_CONVERT_OPTIONS,
    ...options,
  });
  return {
    geojson: { type: "FeatureCollection", features },
    errors,
  };
}
