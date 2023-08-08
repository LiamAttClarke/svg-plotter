"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mathUtils = require("../math-utils");
var utils_1 = require("../utils");
var Vector2_1 = require("../Vector2");
var rectTransformer = function (stack, svgMeta, options) {
    var input = stack.pop();
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
        ring.push.apply(ring, __spreadArrays(topLeftCorner, (isMaxRadiusX ? topRightCorner : topRightCorner.slice(1)), (isMaxRadiusY ? bottomRightCorner : bottomRightCorner.slice(1)), (isMaxRadiusX ? bottomLeftCorner : bottomLeftCorner.slice(1))));
        if (!isMaxRadiusY) {
            ring.push(ring[0]);
        }
    }
    else {
        ring.push(new Vector2_1.default(x, y), new Vector2_1.default(x + width, y), new Vector2_1.default(x + width, y + height), new Vector2_1.default(x, y + height));
        ring.push(ring[0]);
    }
    var id = options.idMapper ? options.idMapper(input) : null;
    var properties = options.propertyMapper ? options.propertyMapper(input, { stack: stack }) : null;
    var geometry = {
        type: 'Polygon',
        coordinates: [
            ring.map(function (p) { return utils_1.svgPointToCoordinate(p, svgMeta, options, input.attributes.transform); }),
        ],
    };
    return {
        features: [utils_1.createFeature(geometry, id, properties)],
        children: [],
    };
};
exports.default = rectTransformer;
//# sourceMappingURL=rect.js.map