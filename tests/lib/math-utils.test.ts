import { assert, assertAlmostEquals } from "std/testing/asserts.ts";
import { Vector2 } from "../../src/lib/Vector2.ts";
import {
  clamp,
  computeBearing,
  drawCurve,
  lerp,
  pointOnCubicBezierCurve,
  pointOnEllipse,
  pointOnEllipticalArc,
  pointOnLine,
  pointOnQuadraticBezierCurve,
  toDegrees,
  toRadians,
} from "../../src/lib/math-utils.ts";

const TOLERANCE = 1e-6;

const arc1 = (t: number) => {
  return pointOnEllipticalArc(
    new Vector2(40, 50),
    new Vector2(120, 80),
    3,
    1,
    0,
    false,
    false,
    t,
  );
};
const arc2 = (t: number) => {
  return pointOnEllipticalArc(
    new Vector2(250, 100),
    new Vector2(250, 200),
    120,
    80,
    45,
    true,
    true,
    t,
  );
};
const arc3 = (t: number, largeArcFlag = false, sweepFlag = false) => {
  return pointOnEllipticalArc(
    new Vector2(250, 100),
    new Vector2(250, 200),
    120,
    80,
    0,
    largeArcFlag,
    sweepFlag,
    t,
  );
};

Deno.test("clamp > should return n when n >= min and n <= max", () => {
  assertAlmostEquals(clamp(0, 0, 1), 0);
  assertAlmostEquals(clamp(0.5, 0, 1), 0.5);
  assertAlmostEquals(clamp(1, 0, 1), 1);
});

Deno.test("clamp > should return min when n < min", () => {
  assertAlmostEquals(clamp(-1, 0, 1), 0);
});

Deno.test("clamp > should return max when n > max", () => {
  assertAlmostEquals(clamp(2, 0, 1), 1);
});

Deno.test("lerp > should return a number t percent between a and b", () => {
  assertAlmostEquals(lerp(1, 3, 0.5), 2);
  assertAlmostEquals(lerp(0, 10, 1), 10);
  assertAlmostEquals(lerp(-3, 3, 0.5), 0);
});

Deno.test("toRadians > should return an angle in radians given an angle in degrees", () => {
  assertAlmostEquals(toRadians(180), Math.PI);
  assertAlmostEquals(toRadians(-360), Math.PI * -2);
});

Deno.test("toDegrees > should return an angle in degrees given an angle in radians", () => {
  assertAlmostEquals(toDegrees(Math.PI), 180);
  assertAlmostEquals(toDegrees(Math.PI * -2), -360);
});

Deno.test("computeBearing > should return 0 when vector is pointing up", () => {
  assertAlmostEquals(computeBearing(new Vector2(0, 1)), 0);
});

Deno.test("computeBearing > should return 90 when vector is pointing right", () => {
  assertAlmostEquals(computeBearing(new Vector2(1, 0)), 90);
});

Deno.test("computeBearing > should return 180 when vector is pointing down", () => {
  assertAlmostEquals(computeBearing(new Vector2(1, 0)), 90);
});

Deno.test("computeBearing > should return 270 when vector is pointing left", () => {
  assertAlmostEquals(computeBearing(new Vector2(-1, 0)), 270);
});

Deno.test("pointOnLine > should return a point along a line", () => {
  const pointA = new Vector2(1, 3);
  const pointB = new Vector2(3, 1);
  const output1 = pointOnLine(pointA, pointB, 0);
  assertAlmostEquals(output1.x, 1);
  assertAlmostEquals(output1.y, 3);
  const output2 = pointOnLine(pointA, pointB, 0.5);
  assertAlmostEquals(output2.x, 2);
  assertAlmostEquals(output2.y, 2);
  const output3 = pointOnLine(pointA, pointB, 1);
  assertAlmostEquals(output3.x, 3);
  assertAlmostEquals(output3.y, 1);
});

Deno.test("pointOnLine > should return the start point when t is less than 0.", () => {
  const output = pointOnLine(new Vector2(1, 3), new Vector2(3, 1), -1);
  assertAlmostEquals(output.x, 1);
  assertAlmostEquals(output.y, 3);
});

Deno.test("pointOnLine > should return the end point when t is more than 1.", () => {
  const output = pointOnLine(new Vector2(1, 3), new Vector2(3, 1), 2);
  assertAlmostEquals(output.x, 3);
  assertAlmostEquals(output.y, 1);
});

Deno.test("pointOnEllipse > should return a point along an ellipse", () => {
  const center = new Vector2(0, 0);
  const r = 1;

  const output1 = pointOnEllipse(center, r, r, 0);
  assertAlmostEquals(output1.x, 1, TOLERANCE);
  assertAlmostEquals(output1.y, 0, TOLERANCE);

  const output2 = pointOnEllipse(center, r, r, 0.25);
  assertAlmostEquals(output2.x, 0, TOLERANCE);
  assertAlmostEquals(output2.y, 1, TOLERANCE);

  const output3 = pointOnEllipse(center, r, r, 0.5);
  assertAlmostEquals(output3.x, -1, TOLERANCE);
  assertAlmostEquals(output3.y, 0, TOLERANCE);

  const output4 = pointOnEllipse(center, r, r, 0.75);
  assertAlmostEquals(output4.x, 0, TOLERANCE);
  assertAlmostEquals(output4.y, -1, TOLERANCE);

  const output5 = pointOnEllipse(center, r, r, 1);
  assertAlmostEquals(output5.x, 1, TOLERANCE);
  assertAlmostEquals(output5.y, 0, TOLERANCE);
});

Deno.test("pointOnCubicBezierCurve > should return a point along a cubic bezier curve", () => {
  const p0 = new Vector2(0, 0);
  const p1 = new Vector2(0, 1);
  const p2 = new Vector2(1, 0);
  const p3 = new Vector2(1, 1);

  const output1 = pointOnCubicBezierCurve(p0, p1, p2, p3, 0);
  assertAlmostEquals(output1.x, 0);
  assertAlmostEquals(output1.y, 0);

  const output2 = pointOnCubicBezierCurve(p0, p1, p2, p3, 0.5);
  assertAlmostEquals(output2.x, 0.5);
  assertAlmostEquals(output2.y, 0.5);

  const output3 = pointOnCubicBezierCurve(p0, p1, p2, p3, 1);
  assertAlmostEquals(output3.x, 1);
  assertAlmostEquals(output3.y, 1);
});

Deno.test("pointOnQuadraticBezierCurve > should return a point along a quadratic bezier curve", () => {
  const p0 = new Vector2(0, 0);
  const p1 = new Vector2(0.5, 0.5);
  const p2 = new Vector2(1, 1);

  const output1 = pointOnQuadraticBezierCurve(p0, p1, p2, 0);
  assertAlmostEquals(output1.x, 0);
  assertAlmostEquals(output1.y, 0);

  const output2 = pointOnQuadraticBezierCurve(p0, p1, p2, 0.5);
  assertAlmostEquals(output2.x, 0.5);
  assertAlmostEquals(output2.y, 0.5);

  const output3 = pointOnQuadraticBezierCurve(p0, p1, p2, 1);
  assertAlmostEquals(output3.x, 1);
  assertAlmostEquals(output3.y, 1);
});

Deno.test("pointOnEllipticalArc > should return starting point if t = 0", () => {
  const output1 = arc1(0);
  assertAlmostEquals(output1.x, 40);
  assertAlmostEquals(output1.y, 50);
  const output2 = arc2(0);
  assertAlmostEquals(output2.x, 250);
  assertAlmostEquals(output2.y, 100);
  const output3 = arc3(0);
  assertAlmostEquals(output3.x, 250);
  assertAlmostEquals(output3.y, 100);
});

Deno.test("pointOnEllipticalArc > should return end point if t = 1", () => {
  const output1 = arc1(1);
  assertAlmostEquals(output1.x, 120);
  assertAlmostEquals(output1.y, 80);
  const output2 = arc2(1);
  assertAlmostEquals(output2.x, 250);
  assertAlmostEquals(output2.y, 200);
  const output3 = arc3(1);
  assertAlmostEquals(output3.x, 250);
  assertAlmostEquals(output3.y, 200);
});

Deno.test("pointOnEllipticalArc > should return values along a given arc", () => {
  const output1 = arc1(0.35);
  assertAlmostEquals(output1.x, 21.7450864219);
  assertAlmostEquals(output1.y, 70.07022949308);
  const output2 = arc1(0.82);
  assertAlmostEquals(output2.x, 89.660911246025);
  assertAlmostEquals(output2.y, 84.80927614891685);
  const output3 = arc2(0.5);
  assertAlmostEquals(output3.x, 438.38624784078576);
  assertAlmostEquals(output3.y, 222.45624916953307);
});

Deno.test("pointOnEllipticalArc > should return a point along a straight line when rx or ry is 0", () => {
  const output1 = pointOnEllipticalArc(
    new Vector2(0, 0),
    new Vector2(10, 20),
    0,
    80,
    45,
    true,
    true,
    0.5,
  );
  assertAlmostEquals(output1.x, 5);
  assertAlmostEquals(output1.y, 10);
  const output2 = pointOnEllipticalArc(
    new Vector2(0, 0),
    new Vector2(10, 20),
    120,
    0,
    45,
    true,
    true,
    0.5,
  );
  assertAlmostEquals(output2.x, 5);
  assertAlmostEquals(output2.y, 10);
});

Deno.test("pointOnEllipticalArc > should sample properly with largeArc=false and sweep=false", () => {
  const output = arc3(0.5, false, false);
  assertAlmostEquals(output.x, 223.67496997597596);
  assertAlmostEquals(output.y, 150);
});

Deno.test("pointOnEllipticalArc > should sample properly with largeArc=true and sweep=true", () => {
  const output = arc3(0.5, true, true);
  assertAlmostEquals(output.x, 463.67496997597596);
  assertAlmostEquals(output.y, 150);
});

Deno.test("pointOnEllipticalArc > should sample properly with largeArc=true and sweep=false", () => {
  const output = arc3(0.5, true, false);
  assertAlmostEquals(output.x, 36.325030024024045);
  assertAlmostEquals(output.y, 150);
});

Deno.test("pointOnEllipticalArc > should sample properly with largeArc=false and sweep=true", () => {
  const output = arc3(0.5, false, true);
  assertAlmostEquals(output.x, 276.32503002402404);
  assertAlmostEquals(output.y, 150);
});

Deno.test("drawCurve > should return a list of points where the first element is the start position of the curve", () => {
  const center = new Vector2(0, 0);
  const r = 1;
  const curveStart = pointOnEllipse(center, r, r, 0);
  const curve = drawCurve(
    (t: number) => pointOnEllipse(center, r, r, t),
    1,
    0,
    1,
  );
  assertAlmostEquals(curve[0].x, curveStart.x);
  assertAlmostEquals(curve[0].y, curveStart.y);
});

Deno.test("should return a list of points where the last element is the end position of the curve", () => {
  const center = new Vector2(0, 0);
  const r = 1;
  const curveEnd = pointOnEllipse(center, r, r, 1);
  const curve = drawCurve(
    (t: number) => pointOnEllipse(center, r, r, t),
    1,
    0,
    1,
  );
  const lastElement = curve[curve.length - 1];
  assertAlmostEquals(lastElement.x, curveEnd.x);
  assertAlmostEquals(lastElement.y, curveEnd.y);
});

Deno.test("should return at least the start and end points of the curve", () => {
  const p0 = new Vector2(0, 0);
  const p1 = new Vector2(2, 8);
  const p2 = new Vector2(4, 0);
  const curve = drawCurve(
    (t: number) => pointOnQuadraticBezierCurve(p0, p1, p2, t),
    90,
    0,
    1,
  );
  const curveStart = curve[0];
  const curveEnd = curve[curve.length - 1];
  assert(curve.length > 1);
  assertAlmostEquals(curveStart.x, p0.x);
  assertAlmostEquals(curveStart.y, p0.y);
  assertAlmostEquals(curveEnd.x, p2.x);
  assertAlmostEquals(curveEnd.y, p2.y);
});

Deno.test("should return an ordered list of points along a curve", () => {
  const curve = drawCurve(
    (t: number) => pointOnEllipse(new Vector2(0, 0), 1, 1, t),
    33,
  );
  const expectedCurve = [
    new Vector2(1, 0),
    new Vector2(0, 1),
    new Vector2(-1, 0),
    new Vector2(0, -1),
    new Vector2(1, 0),
  ];
  assert(curve.length === 5);
  curve.forEach((point, i) => {
    const expectedPoint = expectedCurve[i];
    assertAlmostEquals(point.x, expectedPoint.x, TOLERANCE);
    assertAlmostEquals(point.y, expectedPoint.y, TOLERANCE);
  });
});
