import { Coordinate } from "./types";
import Vector2 from "./Vector2";
interface ICurve {
    (t: number): Vector2;
}
export declare function clamp(n: number, min: number, max: number): number;
export declare function lerp(a: number, b: number, t: number): number;
export declare function toRadians(deg: number): number;
export declare function toDegrees(rad: number): number;
export declare function haversineDistance(coordA: Coordinate, coordB: Coordinate): number;
export declare function cubicBezier(x0: number, x1: number, x2: number, x3: number, t: number): number;
export declare function quadraticBezier(x0: number, x1: number, x2: number, t: number): number;
export declare function pointOnLine(p0: Vector2, p1: Vector2, t: number): Vector2;
export declare function pointOnEllipse(center: Vector2, rx: number, ry: number, t: number): Vector2;
export declare function pointOnCubicBezierCurve(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: number): Vector2;
export declare function pointOnQuadraticBezierCurve(p0: Vector2, p1: Vector2, p2: Vector2, t: number): Vector2;
export declare function pointOnEllipticalArc(p0: Vector2, p1: Vector2, rx: number, ry: number, xAxisRotation: number, largeArc: boolean, sweep: boolean, t: number): Vector2;
export declare function drawCurve(curve: ICurve, subdivideThreshold: number, start?: number, end?: number): Vector2[];
export {};
