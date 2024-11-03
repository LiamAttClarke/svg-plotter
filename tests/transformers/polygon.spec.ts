import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import * as svgson from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import { getSVGMetadata } from "../../src/index";
import { polygon } from "../../src/transformers";
import { DEFAULT_CONVERT_OPTIONS } from "../helpers";

describe("transformer: polygon", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon

    const svgPolygon = fs.readFileSync(path.join(__dirname, "../files/polygon.svg"), "utf8");

    it("should convert a SVG Polygon to a GeoJSON Polygon", async () => {
        const parsedSVG = await svgson.parse(svgPolygon, { camelcase: true });
        const svgMeta = getSVGMetadata(parsedSVG);
        const { features } = polygon(parsedSVG.children[0], svgMeta, DEFAULT_CONVERT_OPTIONS);
        expect(features.length).to.equal(1);
        const [polygonFeature] = features;
        expect(GeoJSONValidation.isFeature(polygonFeature, true)).to.be.empty;
        expect(GeoJSONValidation.isPolygon(polygonFeature.geometry, true)).to.be.empty;
        expect(polygonFeature.geometry.type).to.equal("Polygon");
        if (polygonFeature.geometry.type == "Polygon") {
            expect(polygonFeature.geometry.coordinates).to.deep.equal([
                [
                    [-108, -44.92996307231136],
                    [-100.80000000000001, -61.81964504535566],
                    [-79.19999999999999, -61.81964504535566],
                    [-93.60000000000001, -67.90729697116636],
                    [-86.4, -74.74627295233269],
                    [-108, -70.46268063408844],
                    [-129.60000000000002, -74.74627295233269],
                    [-122.39999999999999, -67.90729697116636],
                    [-136.79999999999998, -61.81964504535566],
                    [-115.20000000000002, -61.81964504535566],
                    [-108, -44.92996307231136],
                ],
            ]);
        }
    });
});
