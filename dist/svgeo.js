"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var svgson = require("svgson");
var svgPathParser = require("svg-path-parser");
var svgTransformParser = require("ya-svg-transform");
var projections_1 = require("projections");
var mathUtils = require("./math-utils");
var Vector2_1 = require("./Vector2");
var transformers = {
    svg: groupTransformer,
    g: groupTransformer,
    line: lineTransformer,
    rect: rectTransformer,
    polyline: polylineTransformer,
    polygon: polygonTransformer,
    circle: ellipseTransformer,
    ellipse: ellipseTransformer,
    path: pathTransformer
};
function convertSVG(input, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var parsedSVG, svgMeta, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options.center = options.center || { longitude: 0, latitude: 0 };
                    options.scale = options.scale || 1;
                    options.subdivideThreshold = Math.abs(options.subdivideThreshold) || 5;
                    return [4, svgson.parse(input, { camelcase: true })];
                case 1:
                    parsedSVG = _a.sent();
                    svgMeta = GetSVGMeta(parsedSVG);
                    output = {
                        type: "FeatureCollection",
                        features: transformers.svg(parsedSVG, svgMeta, options)
                    };
                    return [2, output];
            }
        });
    });
}
exports.convertSVG = convertSVG;
function GetSVGMeta(parsedSVG) {
    var svgMeta = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    if (parsedSVG.attributes.viewBox) {
        var coords = parsedSVG.attributes.viewBox.split(' ');
        svgMeta.x = parseFloat(coords[0]);
        svgMeta.y = parseFloat(coords[1]);
        svgMeta.width = parseFloat(coords[2]) - svgMeta.x;
        svgMeta.height = parseFloat(coords[3]) - svgMeta.y;
    }
    else if (parsedSVG.attributes.width && parsedSVG.attributes.height) {
        svgMeta.x = parseFloat(parsedSVG.attributes.x) || 0;
        svgMeta.y = parseFloat(parsedSVG.attributes.y) || 0;
        svgMeta.width = parseFloat(parsedSVG.attributes.width) - svgMeta.x;
        svgMeta.height = parseFloat(parsedSVG.attributes.height) - svgMeta.y;
    }
    else {
        throw new Error("SVG must have a viewbox or width/height attributes.");
    }
    return svgMeta;
}
exports.GetSVGMeta = GetSVGMeta;
function groupTransformer(input, svgMeta, options) {
    var features = [];
    input.children.forEach(function (child) {
        var transform = transformers[child.name];
        if (transform) {
            features.push.apply(features, transform(child, svgMeta, options));
        }
        else {
            if (options.verbose) {
                warn("Skipping node, \"" + child.name + "\" is not supported.");
            }
        }
    });
    return features;
}
exports.groupTransformer = groupTransformer;
function lineTransformer(input, svgMeta, options) {
    var id = options.idMapper ? options.idMapper(input) : null;
    var properties = options.propertyMapper ? options.propertyMapper(input) : null;
    var geometry = {
        type: "LineString",
        coordinates: [
            svgPointToCoordinate(new Vector2_1.default(input.attributes.x1, input.attributes.y1), svgMeta, options),
            svgPointToCoordinate(new Vector2_1.default(input.attributes.x2, input.attributes.y2), svgMeta, options)
        ]
    };
    return [createFeature(geometry, id, properties)];
}
exports.lineTransformer = lineTransformer;
function rectTransformer(input, svgMeta, options) {
    var x = parseFloat(input.attributes.x);
    var y = parseFloat(input.attributes.y);
    var width = parseFloat(input.attributes.width);
    var height = parseFloat(input.attributes.height);
    var rx = mathUtils.clamp(parseFloat(input.attributes.rx), 0, width * .5);
    var ry = mathUtils.clamp(parseFloat(input.attributes.ry), 0, height * .5);
    var ring = [];
    if (rx || ry) {
        var topLeftCorner = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(new Vector2_1.default(x + rx, y + ry), rx, ry, t); }, options.subdivideThreshold, .5, .75);
        var topRightCorner = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(new Vector2_1.default(x + width - rx, y + ry), rx, ry, t); }, options.subdivideThreshold, .75, 1);
        var bottomRightCorner = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(new Vector2_1.default(x + width - rx, y + height - ry), rx, ry, t); }, options.subdivideThreshold, 0, .25);
        var bottomLeftCorner = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(new Vector2_1.default(x + rx, y + height - ry), rx, ry, t); }, options.subdivideThreshold, .25, .5);
        var isMaxRadiusX = rx * 2 >= width;
        var isMaxRadiusY = ry * 2 >= height;
        ring.push.apply(ring, topLeftCorner.concat((isMaxRadiusX ? topRightCorner : topRightCorner.slice(1)), (isMaxRadiusY ? bottomRightCorner : bottomRightCorner.slice(1)), (isMaxRadiusX ? bottomLeftCorner : bottomLeftCorner.slice(1))));
        if (!isMaxRadiusY) {
            ring.push(ring[0]);
        }
    }
    else {
        ring.push(new Vector2_1.default(x, y), new Vector2_1.default(x + width, y), new Vector2_1.default(x + width, y + height), new Vector2_1.default(x, y + height));
        ring.push(ring[0]);
    }
    var id = options.idMapper ? options.idMapper(input) : null;
    var properties = options.propertyMapper ? options.propertyMapper(input) : null;
    var geometry = {
        type: "Polygon",
        coordinates: [ring.map(function (p) { return svgPointToCoordinate(p, svgMeta, options); })]
    };
    return [createFeature(geometry, id, properties)];
}
exports.rectTransformer = rectTransformer;
function polylineTransformer(input, svgMeta, options) {
    var features = [];
    var points = parseSVGPointsString(input.attributes.points).map(function (p) { return svgPointToCoordinate(p, svgMeta, options); });
    var geometry = null;
    if (points.length > 1) {
        geometry = {
            type: "LineString",
            coordinates: points
        };
    }
    else if (points.length === 1) {
        geometry = {
            type: "Point",
            coordinates: points[0]
        };
    }
    if (geometry) {
        var id = options.idMapper ? options.idMapper(input) : null;
        var properties = options.propertyMapper ? options.propertyMapper(input) : null;
        features.push(createFeature(geometry, id, properties));
    }
    return features;
}
exports.polylineTransformer = polylineTransformer;
function polygonTransformer(input, svgMeta, options) {
    var points = parseSVGPointsString(input.attributes.points).map(function (p) { return svgPointToCoordinate(p, svgMeta, options); });
    points.push(points[0]);
    var id = options.idMapper ? options.idMapper(input) : null;
    var properties = options.propertyMapper ? options.propertyMapper(input) : null;
    var geometry = {
        type: "Polygon",
        coordinates: [points]
    };
    return [createFeature(geometry, id, properties)];
}
exports.polygonTransformer = polygonTransformer;
function ellipseTransformer(input, svgMeta, options) {
    var center = new Vector2_1.default(parseFloat(input.attributes.cx), parseFloat(input.attributes.cy));
    var rx = 0;
    var ry = 0;
    if (input.attributes.r) {
        rx = ry = parseFloat(input.attributes.r);
    }
    else {
        rx = parseFloat(input.attributes.rx);
        ry = parseFloat(input.attributes.ry);
    }
    var points = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipse(center, rx, ry, t); }, options.subdivideThreshold)
        .map(function (p) { return svgPointToCoordinate(p, svgMeta, options); });
    var id = options.idMapper ? options.idMapper(input) : null;
    var properties = options.propertyMapper ? options.propertyMapper(input) : null;
    var geometry = {
        type: "Polygon",
        coordinates: [points]
    };
    return [createFeature(geometry, id, properties)];
}
exports.ellipseTransformer = ellipseTransformer;
function pathTransformer(input, svgMeta, options) {
    var polygons = [];
    var lineStrings = [];
    var points = [];
    var currentLineString = [];
    var previousCurveHandle = null;
    var pathCommands = svgPathParser.makeAbsolute(svgPathParser.parseSVG(input.attributes.d));
    pathCommands.forEach(function (pathCommand, i) {
        var previousCommand = (i > 0) ? pathCommands[i - 1] : null;
        if (pathCommand.code === "M") {
            var command = pathCommand;
            if (currentLineString.length === 1) {
                points.push(currentLineString[0]);
            }
            else if (currentLineString.length > 1) {
                lineStrings.push(currentLineString);
            }
            currentLineString = [svgPointToCoordinate(new Vector2_1.default(command.x, command.y), svgMeta, options)];
        }
        else if (["L", "V", "H"].indexOf(pathCommand.code) !== -1) {
            var command = pathCommand;
            currentLineString.push(svgPointToCoordinate(new Vector2_1.default(command.x, command.y), svgMeta, options));
        }
        else if (["C", "S"].indexOf(pathCommand.code) !== -1) {
            var command = pathCommand;
            var p0_1 = new Vector2_1.default(command.x0, command.y0);
            var p1_1;
            if (pathCommand.code === "C") {
                p1_1 = new Vector2_1.default(command.x1, command.y1);
            }
            else {
                p1_1 = ["C", "S"].indexOf(previousCommand.code) !== -1 ? p0_1.add(p0_1.subtract(previousCurveHandle)) : p0_1;
            }
            var p2_1 = new Vector2_1.default(command.x2, command.y2);
            var p3_1 = new Vector2_1.default(command.x, command.y);
            var curvePoints = mathUtils.drawCurve(function (t) { return mathUtils.pointOnCubicBezierCurve(p0_1, p1_1, p2_1, p3_1, t); }, options.subdivideThreshold)
                .map(function (p) { return svgPointToCoordinate(p, svgMeta, options); });
            currentLineString = currentLineString.concat(curvePoints);
            previousCurveHandle = p2_1;
        }
        else if (["Q", "T"].indexOf(pathCommand.code) !== -1) {
            var command = pathCommand;
            var p0_2 = new Vector2_1.default(command.x0, command.y0);
            var p1_2;
            if (pathCommand.code === "Q") {
                p1_2 = new Vector2_1.default(command.x1, command.y1);
            }
            else {
                p1_2 = ["Q", "T"].indexOf(previousCommand.code) !== -1 ? p0_2.add(p0_2.subtract(previousCurveHandle)) : p0_2;
            }
            var p2_2 = new Vector2_1.default(command.x, command.y);
            var curvePoints = mathUtils.drawCurve(function (t) { return mathUtils.pointOnQuadraticBezierCurve(p0_2, p1_2, p2_2, t); }, options.subdivideThreshold)
                .map(function (p) { return svgPointToCoordinate(p, svgMeta, options); });
            currentLineString = currentLineString.concat(curvePoints);
            previousCurveHandle = p1_2;
        }
        else if (pathCommand.code === "A") {
            var command = pathCommand;
            var p0_3 = new Vector2_1.default(command.x0, command.y0);
            var p1_3 = new Vector2_1.default(command.x, command.y);
            var rx_1 = command.rx;
            var ry_1 = command.ry;
            var xAxisRotation_1 = -command.xAxisRotation;
            var largeArc_1 = command.largeArc;
            var sweep_1 = !command.sweep;
            var curvePoints = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipticalArc(p0_3, p1_3, rx_1, ry_1, xAxisRotation_1, largeArc_1, sweep_1, t); }, options.subdivideThreshold)
                .map(function (p) { return svgPointToCoordinate(p, svgMeta, options); });
            currentLineString = currentLineString.concat(curvePoints);
        }
        else if (pathCommand.code === "Z") {
            currentLineString.push(currentLineString[0]);
            polygons.push(currentLineString);
            currentLineString = [];
        }
    });
    if (currentLineString.length === 1) {
        points.push(currentLineString[0]);
    }
    else if (currentLineString.length > 1) {
        lineStrings.push(currentLineString);
    }
    var features = [];
    var properties = options.propertyMapper ? options.propertyMapper(input) : null;
    if (points.length) {
        points.forEach(function (point) {
            var id = options.idMapper ? options.idMapper(input) : null;
            var geometry = {
                type: 'Point',
                coordinates: point
            };
            features.push(createFeature(geometry, id, properties));
        });
    }
    if (lineStrings.length) {
        lineStrings.forEach(function (lineString) {
            var id = options.idMapper ? options.idMapper(input) : null;
            var geometry = {
                type: 'LineString',
                coordinates: lineString
            };
            features.push(createFeature(geometry, id, properties));
        });
    }
    if (polygons.length) {
        var polygonFeatures = polygons.map(function (polygon) {
            var id = options.idMapper ? options.idMapper(input) : null;
            var geometry = {
                type: 'Polygon',
                coordinates: [polygon]
            };
            return createFeature(geometry, id, properties);
        });
        features.push(polygonFeatures[0]);
    }
    return features;
}
exports.pathTransformer = pathTransformer;
function createFeature(geometry, id, properties) {
    var feature = {
        type: 'Feature',
        geometry: geometry,
        properties: properties
    };
    if (id !== null) {
        feature.id = id;
    }
    return feature;
}
exports.createFeature = createFeature;
function parseSVGPointsString(pointString) {
    var points = [];
    var matches = pointString.match(/\-?\d+(?:\.\d+)?/g);
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
    if (svgTransform) {
        var transformedPoint = svgTransformParser.transform(svgTransform).apply(point);
        point = new Vector2_1.default(transformedPoint.x, transformedPoint.y);
    }
    var halfWidth = svgMeta.width * 0.5;
    var halfHeight = svgMeta.height * 0.5;
    var aspect = svgMeta.width / svgMeta.height;
    var normalizedPoint = new Vector2_1.default(mathUtils.clamp(((point.x - svgMeta.x - halfWidth) * options.scale + halfWidth) / svgMeta.width * aspect, 0, 1), mathUtils.clamp(((point.y - svgMeta.y - halfHeight) * options.scale + halfHeight) / svgMeta.height, 0, 1));
    var projectedCoord = projections_1.mercator(normalizedPoint);
    return [
        options.center.longitude + projectedCoord.lon,
        options.center.latitude + projectedCoord.lat
    ];
}
exports.svgPointToCoordinate = svgPointToCoordinate;
function warn(warning) {
    console.log("(WARNING) " + warning);
}
//# sourceMappingURL=svgeo.js.map