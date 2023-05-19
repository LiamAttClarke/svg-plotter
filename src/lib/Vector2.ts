import { toRadians } from "./math-utils.ts";

export class Vector2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static fromArray(arr: number[]): Vector2 {
    if (arr.length !== 2) throw new Error("'arr' length must be 2.");
    return new Vector2(arr[0], arr[1]);
  }

  static dot(u: Vector2, v: Vector2): number {
    return u.x * v.x + u.y * v.y;
  }

  static distance(v: Vector2, u: Vector2): number {
    return u.subtract(v).magnitude();
  }

  /** Computes angle (radians) between two vectors. */
  static angleBetween(a: Vector2, b: Vector2): number {
    const p = a.x * b.x + a.y * b.y;
    const n = Math.sqrt(
      (a.x ** 2 + a.y ** 2) * (b.x ** 2 + b.y ** 2),
    );
    const sign = a.x * b.y - a.y * b.x < 0 ? -1 : 1;
    const angle = Math.acos(p / n);
    return sign * angle;
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  addScalar(n: number): Vector2 {
    return new Vector2(this.x + n, this.y + n);
  }

  subtractScalar(n: number): Vector2 {
    return new Vector2(this.x - n, this.y - n);
  }

  multiplyByScalar(n: number): Vector2 {
    return new Vector2(this.x * n, this.y * n);
  }

  negate(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2 {
    const magnitude = this.magnitude();
    if (magnitude === 0) return new Vector2();
    return new Vector2(this.x / magnitude, this.y / magnitude);
  }

  perpendicular(clockwise = true): Vector2 {
    return clockwise
      ? new Vector2(this.y, -this.x)
      : new Vector2(-this.y, this.x);
  }

  rotate(deg: number): Vector2 {
    const rad = toRadians(deg);
    return new Vector2(
      this.x * Math.cos(rad) - this.y * Math.sin(rad),
      this.x * Math.sin(rad) + this.y * Math.cos(rad),
    );
  }

  toArray(): number[] {
    return [this.x, this.y];
  }
}
