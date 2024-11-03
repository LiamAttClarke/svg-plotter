import { INode } from "svgson";
export interface Coordinate {
    latitude: number;
    longitude: number;
}
export interface SVGMetaData {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface FeaturePropertyMapper {
    (input: INode): Record<string, any>;
}
export interface FeatureIdMapper {
    (input: INode): number | string;
}
export interface ConvertSVGOptions {
    center?: Coordinate;
    width?: number;
    bearing?: number;
    subdivideThreshold?: number;
    idMapper?: FeatureIdMapper;
    propertyMapper?: FeaturePropertyMapper;
}
export interface SVGNodeTransformerOutput {
    features: GeoJSON.Feature[];
    children: INode[];
}
export interface SVGNodeTransformer {
    (node: INode, svgMeta: SVGMetaData, options: ConvertSVGOptions): SVGNodeTransformerOutput;
}
