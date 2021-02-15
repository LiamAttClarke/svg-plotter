import { ConvertSVGOptions, SVGMetaData } from './types';
import Vector2 from './Vector2';
export declare function createFeature(geometry: GeoJSON.Geometry, id: string | number | null, properties: GeoJSON.GeoJsonProperties): GeoJSON.Feature;
export declare function parseSVGPointsString(pointString: string): Vector2[];
export declare function svgPointToCoordinate(point: Vector2, svgMeta: SVGMetaData, options: ConvertSVGOptions, svgTransform?: string): GeoJSON.Position;
