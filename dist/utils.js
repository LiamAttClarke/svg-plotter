"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.svgPointToCoordinate = exports.parseSVGPointsString = exports.createFeature = void 0;
var projections_1 = require("projections");
var svgTransformParser = require("ya-svg-transform");
var Vector2_1 = require("./Vector2");
var math_utils_1 = require("./math-utils");
var constants_1 = require("./constants");
function createFeature(geometry, id, properties) {
    var feature = {
        type: 'Feature',
        geometry: geometry,
        properties: properties,
    };
    if (id !== null) {
        feature.id = id;
    }
    return feature;
}
exports.createFeature = createFeature;
function parseSVGPointsString(pointString) {
    var points = [];
    var matches = pointString.match(/-?\d+(?:\.\d+)?/g);
    if (matches) {
        for (var i = 0; i < matches.length; i += 2) {
            if (i + 2 > matches.length)
                break;
            points.push(new Vector2_1.default(parseFloat(matches[i]), parseFloat(matches[i + 1])));
        }
    }
    return points;
}
exports.parseSVGPointsString = parseSVGPointsString;
function svgPointToCoordinate(point, svgMeta, options, svgTransform) {
    var point1 = point;
    if (svgTransform) {
        var transformedPoint = svgTransformParser.transform(svgTransform).apply(point);
        point1 = new Vector2_1.default(transformedPoint.x, transformedPoint.y);
    }
    var aspect = svgMeta.width / svgMeta.height;
    var outputPoint = new Vector2_1.default((point1.x - svgMeta.x) / (svgMeta.width * aspect), (point1.y - svgMeta.y) / svgMeta.height);
    var scale = options.width / constants_1.EARTH_CIRCUMFERENCE;
    var centerPoint = projections_1.mercator({ lon: options.center.longitude, lat: options.center.latitude });
    outputPoint = outputPoint
        .subtractScalar(0.5)
        .multiplyByScalar(scale);
    if (options.bearing) {
        var rotation = math_utils_1.toRadians(options.bearing);
        outputPoint = new Vector2_1.default(outputPoint.x * Math.cos(rotation) - outputPoint.y * Math.sin(rotation), outputPoint.x * Math.sin(rotation) + outputPoint.y * Math.cos(rotation));
    }
    outputPoint = outputPoint.add(centerPoint);
    outputPoint = new Vector2_1.default(math_utils_1.clamp(outputPoint.x, 0, 1), math_utils_1.clamp(outputPoint.y, 0, 1));
    var projectedCoord = projections_1.mercator(outputPoint);
    return [projectedCoord.lon, projectedCoord.lat];
}
exports.svgPointToCoordinate = svgPointToCoordinate;
//# sourceMappingURL=utils.js.map