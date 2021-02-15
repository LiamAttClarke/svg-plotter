export default class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number);
    static fromArray(arr: number[]): Vector2;
    static dot(u: Vector2, v: Vector2): number;
    static distance(v: Vector2, u: Vector2): number;
    static angleBetween(a: Vector2, b: Vector2): number;
    add(v: Vector2): Vector2;
    subtract(v: Vector2): Vector2;
    addScalar(n: number): Vector2;
    subtractScalar(n: number): Vector2;
    multiplyByScalar(n: number): Vector2;
    negate(): Vector2;
    magnitude(): number;
    normalize(): Vector2;
    perpendicular(clockwise?: boolean): Vector2;
    toArray(): number[];
}
