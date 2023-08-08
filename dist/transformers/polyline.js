"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var polylineTransformer = function (stack, svgMeta, options) {
    var input = stack.pop();
    var features = [];
    var points = utils_1.parseSVGPointsString(input.attributes.points)
        .map(function (p) { return utils_1.svgPointToCoordinate(p, svgMeta, options, input.attributes.transform); });
    var geometry = null;
    if (points.length > 1) {
        geometry = {
            type: 'LineString',
            coordinates: points,
        };
    }
    else if (points.length === 1) {
        geometry = {
            type: 'Point',
            coordinates: points[0],
        };
    }
    if (geometry) {
        var id = options.idMapper ? options.idMapper(input) : null;
        var properties = options.propertyMapper ? options.propertyMapper(input, { stack: stack }) : null;
        features.push(utils_1.createFeature(geometry, id, properties));
    }
    return {
        features: features,
        children: [],
    };
};
exports.default = polylineTransformer;
//# sourceMappingURL=polyline.js.map