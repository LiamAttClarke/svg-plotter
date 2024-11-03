"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var mathUtils = require("../math-utils");
var utils_1 = require("../utils");
var Vector2_1 = require("../Vector2");
var rectTransformer = function (input, svgMeta, options) {
    var x = parseFloat(input.attributes.x);
    var y = parseFloat(input.attributes.y);
    var width = parseFloat(input.attributes.width);
    var height = parseFloat(input.attributes.height);
    var rx = mathUtils.clamp(parseFloat(input.attributes.rx), 0, width * 0.5);
    var ry = mathUtils.clamp(parseFloat(input.attributes.ry), 0, height * 0.5);
    var ring = [];
    if (rx || ry) {
        var topLeftCorner = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(new Vector2_1.default(x + rx, y + ry), rx, ry, t); }, options.subdivideThreshold, 0.5, 0.75);
        var topRightCorner = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(new Vector2_1.default(x + width - rx, y + ry), rx, ry, t); }, options.subdivideThreshold, 0.75, 1);
        var bottomRightCorner = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(new Vector2_1.default(x + width - rx, y + height - ry), rx, ry, t); }, options.subdivideThreshold, 0, 0.25);
        var bottomLeftCorner = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(new Vector2_1.default(x + rx, y + height - ry), rx, ry, t); }, options.subdivideThreshold, 0.25, 0.5);
        var isMaxRadiusX = rx * 2 >= width;
        var isMaxRadiusY = ry * 2 >= height;
        ring.push.apply(ring, __spreadArray(__spreadArray(__spreadArray(__spreadArray([], topLeftCorner, false), (isMaxRadiusX ? topRightCorner : topRightCorner.slice(1)), false), (isMaxRadiusY ? bottomRightCorner : bottomRightCorner.slice(1)), false), (isMaxRadiusX ? bottomLeftCorner : bottomLeftCorner.slice(1)), false));
        if (!isMaxRadiusY) {
            ring.push(ring[0]);
        }
    }
    else {
        ring.push(new Vector2_1.default(x, y), new Vector2_1.default(x + width, y), new Vector2_1.default(x + width, y + height), new Vector2_1.default(x, y + height));
        ring.push(ring[0]);
    }
    var id = options.idMapper ? options.idMapper(input) : null;
    var properties = options.propertyMapper
        ? options.propertyMapper(input)
        : null;
    var geometry = {
        type: "Polygon",
        coordinates: [
            ring.map(function (p) { return (0, utils_1.svgPointToCoordinate)(p, svgMeta, options, input.attributes.transform); }),
        ],
    };
    return {
        features: [(0, utils_1.createFeature)(geometry, id, properties)],
        children: [],
    };
};
exports.default = rectTransformer;
//# sourceMappingURL=rect.js.map