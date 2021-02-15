import { parseSync as parseSVG, INode } from 'svgson';
import {
  ConvertSVGOptions,
  SVGMetaData,
  SVGNodeTransformer,
} from './types';
import * as Transformers from './transformers';

const DEFAULT_CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 5,
};

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

function svgNodeToFeatures(node: INode, svgMeta: SVGMetaData, options: ConvertSVGOptions) {
  const outputFeatures = [];
  const transformer = transformers[node.name];
  if (transformer) {
    const { features, children } = transformer(node, svgMeta, options);
    outputFeatures.push(...features);
    children.forEach((n) => {
      outputFeatures.push(...svgNodeToFeatures(n, svgMeta, options));
    });
  } else {
    console.warn(`Node, '${node.name}' is not supported.`);
  }
  return outputFeatures;
}

export function getSVGMetadata(parsedSVG: INode): SVGMetaData {
  // TODO: Account for different width and height units other than px
  const svgMeta: SVGMetaData = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  if (parsedSVG.attributes.viewBox) {
    const coords = parsedSVG.attributes.viewBox.split(' ');
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
    throw new Error('SVG must have a viewbox or width/height attributes.');
  }
  return svgMeta;
}

export function convertSVG(
  input: string,
  options: ConvertSVGOptions = {},
): GeoJSON.FeatureCollection {
  // Parse SVG
  const parsedSVG = parseSVG(input, { camelcase: true });
  const svgMeta = getSVGMetadata(parsedSVG);
  // Convert SVG to GeoJSON
  const features = svgNodeToFeatures(parsedSVG, svgMeta, {
    ...DEFAULT_CONVERT_OPTIONS,
    ...options,
  });
  return { type: 'FeatureCollection', features };
}
