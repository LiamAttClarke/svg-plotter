export default class Vector2 {

  x:number;
  y:number;

  constructor(x:number, y:number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  static fromArray(arr:number[]) {
    if (arr.length !== 2) throw new Error("'arr' length must be 2.");
    return new Vector2(arr[0], arr[1]);
  }

  static dot(u:Vector2, v:Vector2) {
    return u.x * v.x + u.y * v.y;
  }

  static distance(v:Vector2, u:Vector2) {
    return u.subtract(v).magnitude();
  }

  static angleBetween(a:Vector2, b:Vector2):number {
    const p = a.x * b.x + a.y * b.y;
    const n = Math.sqrt((Math.pow(a.x, 2) + Math.pow(a.y, 2)) * (Math.pow(b.x, 2) + Math.pow(b.y, 2)));
    const sign = a.x * b.y - a.y * b.x < 0 ? -1 : 1;
    const angle = Math.acos(p / n);
    return sign * angle;
  }

  add(v:Vector2):Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v:Vector2):Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  // TODO: Add unit test
  addScalar(n:number):Vector2 {
    return new Vector2(this.x + n, this.y + n);
  }

  // TODO: Add unit test
  subtractScalar(n:number):Vector2 {
    return new Vector2(this.x - n, this.y - n);
  }

  multiplyByScalar(n:number):Vector2 {
    return new Vector2(this.x * n, this.y * n);
  }

  negate():Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  magnitude():number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize():Vector2 {
    const magnitude = this.magnitude();
    return new Vector2(this.x / magnitude, this.y / magnitude);
  }

  perpendicular(clockwise:boolean = true):Vector2 {
    return clockwise ? new Vector2(this.y, -this.x) : new Vector2(-this.y, this.x);
  }

  toArray():number[] {
    return [this.x, this.y];
  }
}