import { INode } from 'svgson';
import { ConvertSVGOptions, SVGMetaData } from './types';
export declare function getSVGMetadata(parsedSVG: INode): SVGMetaData;
export declare function convertSVG(input: string, options?: ConvertSVGOptions): GeoJSON.FeatureCollection;
