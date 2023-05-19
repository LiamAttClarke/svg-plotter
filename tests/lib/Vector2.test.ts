import {
  assertAlmostEquals,
  assertEquals,
  assertNotStrictEquals,
  assertThrows,
} from "std/testing/asserts.ts";
import { Vector2 } from "../../src/lib/Vector2.ts";

Deno.test("Vector2.fromArray > should return a Vector2 based on an array of two numbers", () => {
  const v = Vector2.fromArray([1, 2]);
  assertEquals(v.x, 1);
  assertEquals(v.y, 2);
});

Deno.test("Vector2.fromArray > should throw an error when arr.length is not 2", () => {
  assertThrows(Vector2.fromArray.bind(this, [1]));
});

Deno.test("Vector2.dot > should return the dot product of two vectors", () => {
  assertAlmostEquals(Vector2.dot(new Vector2(1, 0), new Vector2(0, 1)), 0);
  assertAlmostEquals(Vector2.dot(new Vector2(0, 1), new Vector2(0, -1)), -1);
  assertAlmostEquals(Vector2.dot(new Vector2(0, 1), new Vector2(0, 1)), 1);
});

Deno.test("Vector2.distance > should return the distance between two positions", () => {
  assertAlmostEquals(
    Vector2.distance(new Vector2(0, 0), new Vector2(-2, 0)),
    2,
  );
  assertAlmostEquals(
    Vector2.distance(new Vector2(0, -1), new Vector2(0, 1)),
    2,
  );
});

Deno.test("Vector2.angleBetween > should return the signed acute angle in radians between two directions", () => {
  assertAlmostEquals(
    Vector2.angleBetween(new Vector2(1, 0), new Vector2(0, 1)),
    Math.PI / 2,
  );
  assertAlmostEquals(
    Vector2.angleBetween(new Vector2(1, 0), new Vector2(0, -1)),
    -Math.PI / 2,
  );
});

Deno.test("Vector2.add > should return the sum of two vectors", () => {
  const sum = new Vector2(1, 2).add(new Vector2(1, 1));
  assertAlmostEquals(sum.x, 2);
  assertAlmostEquals(sum.y, 3);
});

Deno.test("Vector2.addScalar > should return the sum of the vector and a positive scalar", () => {
  const sum = new Vector2(1, 2).addScalar(2);
  assertAlmostEquals(sum.x, 3);
  assertAlmostEquals(sum.y, 4);
});

Deno.test("Vector2.addScalar > should return the sum of the vector and a negative scalar", () => {
  const sum = new Vector2(1, 2).addScalar(-3);
  assertAlmostEquals(sum.x, -2);
  assertAlmostEquals(sum.y, -1);
});

Deno.test("Vector2.subtract > should return the difference of two vectors", () => {
  const diff = new Vector2(1, 2).subtract(new Vector2(1, 1));
  assertAlmostEquals(diff.x, 0);
  assertAlmostEquals(diff.y, 1);
});

Deno.test("Vector2.subtractScalar > should return the difference of the vector and a scalar", () => {
  const diff1 = new Vector2(1, 2).subtractScalar(2);
  assertAlmostEquals(diff1.x, -1);
  assertAlmostEquals(diff1.y, 0);
  const diff2 = new Vector2(1, 2).subtractScalar(-3);
  assertAlmostEquals(diff2.x, 4);
  assertAlmostEquals(diff2.y, 5);
});

Deno.test("Vector2.multiplyByScalar > should return scalar multiple of a vector", () => {
  const product = new Vector2(1, 2).multiplyByScalar(-2);
  assertAlmostEquals(product.x, -2);
  assertAlmostEquals(product.y, -4);
});

Deno.test("Vector2.negate > should return the opposite vector", () => {
  const negation = new Vector2(1, 2).negate();
  assertAlmostEquals(negation.x, -1);
  assertAlmostEquals(negation.y, -2);
});

Deno.test("Vector2.magnitude > should return the length of a vector", () => {
  assertAlmostEquals(new Vector2(3, 0).magnitude(), 3);
  assertAlmostEquals(new Vector2(0, -4).magnitude(), 4);
  assertAlmostEquals(new Vector2(0, 0).magnitude(), 0);
});

Deno.test("Vector2.normalize > should return a unit length vector in the same direction.", () => {
  assertAlmostEquals(new Vector2(-5, 0).normalize().magnitude(), 1);
  assertAlmostEquals(new Vector2(0.5, 0).normalize().magnitude(), 1);
});

Deno.test("Vector2.normalize > should return a new zero vector when the provided vector's magnitude is 0.", () => {
  const input = new Vector2();
  const output = input.normalize();
  assertAlmostEquals(output.magnitude(), 0);
  assertNotStrictEquals(input, output);
});

Deno.test("Vector2.perpendicular > should return a clockwise perpendicular vector by default", () => {
  const output = new Vector2(1, 0).perpendicular();
  assertAlmostEquals(output.x, 0);
  assertAlmostEquals(output.y, -1);
});

Deno.test("Vector2.perpendicular > should return a counter-clockwise perpendicular vector when clockwise=false", () => {
  const output = new Vector2(1, 0).perpendicular(false);
  assertAlmostEquals(output.x, 0);
  assertAlmostEquals(output.y, 1);
});

Deno.test("Vector2.toArray > should return the vector as an array", () => {
  const output = new Vector2(5, 7).toArray();
  assertAlmostEquals(output[0], 5);
  assertAlmostEquals(output[1], 7);
  assertEquals(output.length, 2);
});
