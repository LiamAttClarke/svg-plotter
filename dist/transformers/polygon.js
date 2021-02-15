"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var polygonTransformer = function (node, svgMeta, options) {
    var points = utils_1.parseSVGPointsString(node.attributes.points)
        .map(function (p) { return utils_1.svgPointToCoordinate(p, svgMeta, options, node.attributes.transform); });
    points.push(points[0]);
    var id = options.idMapper ? options.idMapper(node) : null;
    var properties = options.propertyMapper ? options.propertyMapper(node) : null;
    var geometry = {
        type: 'Polygon',
        coordinates: [points],
    };
    return {
        features: [utils_1.createFeature(geometry, id, properties)],
        children: [],
    };
};
exports.default = polygonTransformer;
//# sourceMappingURL=polygon.js.map