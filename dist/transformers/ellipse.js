"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var Vector2_1 = require("../Vector2");
var mathUtils = require("../math-utils");
var ellipseTransformer = function (input, svgMeta, options) {
    var center = new Vector2_1.default(parseFloat(input.attributes.cx), parseFloat(input.attributes.cy));
    var rx = 0;
    var ry = 0;
    if (input.attributes.r) {
        rx = parseFloat(input.attributes.r);
        ry = rx;
    }
    else {
        rx = parseFloat(input.attributes.rx);
        ry = parseFloat(input.attributes.ry);
    }
    var points = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(center, rx, ry, t); }, options.subdivideThreshold).map(function (p) { return (0, utils_1.svgPointToCoordinate)(p, svgMeta, options, input.attributes.transform); });
    points[points.length - 1] = points[0];
    var id = options.idMapper ? options.idMapper(input) : null;
    var properties = options.propertyMapper ? options.propertyMapper(input) : null;
    var geometry = {
        type: 'Polygon',
        coordinates: [points],
    };
    return {
        features: [(0, utils_1.createFeature)(geometry, id, properties)],
        children: [],
    };
};
exports.default = ellipseTransformer;
//# sourceMappingURL=ellipse.js.map