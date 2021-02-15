"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var svgPathParser = require("svg-path-parser");
var utils_1 = require("../utils");
var Vector2_1 = require("../Vector2");
var mathUtils = require("../math-utils");
var pathTransformer = function (input, svgMeta, options) {
    var polygons = [];
    var lineStrings = [];
    var points = [];
    var currentLineString = [];
    var previousCurveHandle = null;
    var pathCommands = svgPathParser.makeAbsolute(svgPathParser.parseSVG(input.attributes.d));
    pathCommands.forEach(function (pathCommand, i) {
        var previousCommand = (i > 0) ? pathCommands[i - 1] : null;
        if (pathCommand.code === 'M') {
            var command = pathCommand;
            if (currentLineString.length === 1) {
                points.push(currentLineString[0]);
            }
            else if (currentLineString.length > 1) {
                lineStrings.push(currentLineString);
            }
            currentLineString = [
                utils_1.svgPointToCoordinate(new Vector2_1.default(command.x, command.y), svgMeta, options, input.attributes.transform),
            ];
        }
        else if (['L', 'V', 'H'].indexOf(pathCommand.code) !== -1) {
            var command = pathCommand;
            currentLineString.push(utils_1.svgPointToCoordinate(new Vector2_1.default(command.x, command.y), svgMeta, options, input.attributes.transform));
        }
        else if (['C', 'S'].indexOf(pathCommand.code) !== -1) {
            var command = pathCommand;
            var p0_1 = new Vector2_1.default(command.x0, command.y0);
            var p1_1;
            if (pathCommand.code === 'C') {
                p1_1 = new Vector2_1.default(command.x1, command.y1);
            }
            else {
                p1_1 = ['C', 'S'].indexOf(previousCommand.code) !== -1 ? p0_1.add(p0_1.subtract(previousCurveHandle)) : p0_1;
            }
            var p2_1 = new Vector2_1.default(command.x2, command.y2);
            var p3_1 = new Vector2_1.default(command.x, command.y);
            var curvePoints = mathUtils.drawCurve(function (t) { return mathUtils.pointOnCubicBezierCurve(p0_1, p1_1, p2_1, p3_1, t); }, options.subdivideThreshold).map(function (p) { return utils_1.svgPointToCoordinate(p, svgMeta, options, input.attributes.transform); });
            currentLineString = currentLineString.concat(curvePoints);
            previousCurveHandle = p2_1;
        }
        else if (['Q', 'T'].indexOf(pathCommand.code) !== -1) {
            var command = pathCommand;
            var p0_2 = new Vector2_1.default(command.x0, command.y0);
            var p1_2;
            if (pathCommand.code === 'Q') {
                p1_2 = new Vector2_1.default(command.x1, command.y1);
            }
            else {
                p1_2 = ['Q', 'T'].indexOf(previousCommand.code) !== -1 ? p0_2.add(p0_2.subtract(previousCurveHandle)) : p0_2;
            }
            var p2_2 = new Vector2_1.default(command.x, command.y);
            var curvePoints = mathUtils.drawCurve(function (t) { return mathUtils.pointOnQuadraticBezierCurve(p0_2, p1_2, p2_2, t); }, options.subdivideThreshold).map(function (p) { return utils_1.svgPointToCoordinate(p, svgMeta, options, input.attributes.transform); });
            currentLineString = currentLineString.concat(curvePoints);
            previousCurveHandle = p1_2;
        }
        else if (pathCommand.code === 'A') {
            var command = pathCommand;
            var p0_3 = new Vector2_1.default(command.x0, command.y0);
            var p1_3 = new Vector2_1.default(command.x, command.y);
            var rx_1 = command.rx;
            var ry_1 = command.ry;
            var xAxisRotation_1 = -command.xAxisRotation;
            var largeArc_1 = command.largeArc;
            var sweep_1 = !command.sweep;
            var curvePoints = mathUtils.drawCurve(function (t) { return mathUtils.pointOnEllipticalArc(p0_3, p1_3, rx_1, ry_1, xAxisRotation_1, largeArc_1, sweep_1, t); }, options.subdivideThreshold).map(function (p) { return utils_1.svgPointToCoordinate(p, svgMeta, options, input.attributes.transform); });
            currentLineString = currentLineString.concat(curvePoints);
        }
        else if (pathCommand.code === 'Z') {
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
                coordinates: point,
            };
            features.push(utils_1.createFeature(geometry, id, properties));
        });
    }
    if (lineStrings.length) {
        lineStrings.forEach(function (lineString) {
            var id = options.idMapper ? options.idMapper(input) : null;
            var geometry = {
                type: 'LineString',
                coordinates: lineString,
            };
            features.push(utils_1.createFeature(geometry, id, properties));
        });
    }
    if (polygons.length) {
        var polygonFeatures = polygons.map(function (polygon) {
            var id = options.idMapper ? options.idMapper(input) : null;
            var geometry = {
                type: 'Polygon',
                coordinates: [polygon],
            };
            return utils_1.createFeature(geometry, id, properties);
        });
        features.push(polygonFeatures[0]);
    }
    return {
        features: features,
        children: [],
    };
};
exports.default = pathTransformer;
//# sourceMappingURL=path.js.map