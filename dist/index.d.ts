import { INode } from 'svgson';
import { ConvertSVGOptions, SVGMetaData } from './types';
export declare function getSVGMetadata(parsedSVG: INode): SVGMetaData;
export interface ConvertSVGOutput {
    geojson: GeoJSON.GeoJSON;
    errors: string[];
}
export declare function convertSVG(input: string, options?: ConvertSVGOptions): ConvertSVGOutput;
