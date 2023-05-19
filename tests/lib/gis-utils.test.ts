import { assertAlmostEquals } from "std/testing/asserts.ts";
import { haversineDistance } from "../../src/lib/gis-utils.ts";

Deno.test("haversineDistance > should return the great-cirlce distance (in metres) between two coordinates", () => {
  const coordA = { latitude: 0, longitude: 0 };
  const coordB = { latitude: 43.6529, longitude: -79.3849 };
  assertAlmostEquals(haversineDistance(coordA, coordB), 9155865.3400348);
});
