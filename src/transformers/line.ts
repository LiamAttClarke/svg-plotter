import { SVGNodeTransformer } from "../types";
import { createFeature, svgPointToCoordinate } from "../utils";
import Vector2 from "../Vector2";

/** Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line */
const lineTransformer: SVGNodeTransformer = (input, svgMeta, options) => {
    const id = options.idMapper ? options.idMapper(input) : null;
    const properties = options.propertyMapper
        ? options.propertyMapper(input)
        : null;
    const geometry: GeoJSON.LineString = {
        type: "LineString",
        coordinates: [
            svgPointToCoordinate(
                new Vector2(
                    parseFloat(input.attributes.x1),
                    parseFloat(input.attributes.y1),
                ),
                svgMeta,
                options,
                input.attributes.transform,
            ),
            svgPointToCoordinate(
                new Vector2(
                    parseFloat(input.attributes.x2),
                    parseFloat(input.attributes.y2),
                ),
                svgMeta,
                options,
                input.attributes.transform,
            ),
        ],
    };
    return {
        features: [createFeature(geometry, id, properties)],
        children: [],
    };
};

export default lineTransformer;
