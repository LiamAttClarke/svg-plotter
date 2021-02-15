"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCurve = exports.pointOnEllipticalArc = exports.pointOnQuadraticBezierCurve = exports.pointOnCubicBezierCurve = exports.pointOnEllipse = exports.pointOnLine = exports.quadraticBezier = exports.cubicBezier = exports.haversineDistance = exports.toDegrees = exports.toRadians = exports.lerp = exports.clamp = void 0;
var Vector2_1 = require("./Vector2");
var constants_1 = require("./constants");
function clamp(n, min, max) {
    return Math.min(Math.max(min, n), max);
}
exports.clamp = clamp;
function lerp(a, b, t) {
    return a + (b - a) * t;
}
exports.lerp = lerp;
function toRadians(deg) {
    return (Math.PI / 180) * deg;
}
exports.toRadians = toRadians;
function toDegrees(rad) {
    return (180 / Math.PI) * rad;
}
exports.toDegrees = toDegrees;
function haversineDistance(coordA, coordB) {
    var latARad = toRadians(coordA.latitude);
    var latBRad = toRadians(coordB.latitude);
    var latDeltaRad = latBRad - latARad;
    var lonDeltaRad = toRadians(coordB.longitude - coordA.longitude);
    var halfChordLengthSquared = Math.sin(latDeltaRad * 0.5) * Math.sin(latDeltaRad * 0.5)
        + Math.cos(latARad) * Math.cos(latBRad)
            * Math.sin(lonDeltaRad * 0.5) * Math.sin(lonDeltaRad * 0.5);
    var angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLengthSquared), Math.sqrt(1 - halfChordLengthSquared));
    return constants_1.EARTH_RADIUS * angularDistance;
}
exports.haversineDistance = haversineDistance;
function cubicBezier(x0, x1, x2, x3, t) {
    var n = 1 - t;
    var term1 = n * n * n * x0;
    var term2 = 3 * n * n * t * x1;
    var term3 = 3 * n * t * t * x2;
    var term4 = t * t * t * x3;
    return term1 + term2 + term3 + term4;
}
exports.cubicBezier = cubicBezier;
function quadraticBezier(x0, x1, x2, t) {
    var n = 1 - t;
    var term1 = n * n * x0;
    var term2 = 2 * n * t * x1;
    var term3 = t * t * x2;
    return term1 + term2 + term3;
}
exports.quadraticBezier = quadraticBezier;
function pointOnLine(p0, p1, t) {
    var t1 = clamp(t, 0, 1);
    return new Vector2_1.default(lerp(p0.x, p1.x, t1), lerp(p0.y, p1.y, t1));
}
exports.pointOnLine = pointOnLine;
function pointOnEllipse(center, rx, ry, t) {
    var theta = Math.PI * 2 * t;
    return new Vector2_1.default(center.x + rx * Math.cos(theta), center.y + ry * Math.sin(theta));
}
exports.pointOnEllipse = pointOnEllipse;
function pointOnCubicBezierCurve(p0, p1, p2, p3, t) {
    var t1 = clamp(t, 0, 1);
    return new Vector2_1.default(cubicBezier(p0.x, p1.x, p2.x, p3.x, t1), cubicBezier(p0.y, p1.y, p2.y, p3.y, t1));
}
exports.pointOnCubicBezierCurve = pointOnCubicBezierCurve;
function pointOnQuadraticBezierCurve(p0, p1, p2, t) {
    var t1 = clamp(t, 0, 1);
    return new Vector2_1.default(quadraticBezier(p0.x, p1.x, p2.x, t1), quadraticBezier(p0.y, p1.y, p2.y, t1));
}
exports.pointOnQuadraticBezierCurve = pointOnQuadraticBezierCurve;
function pointOnEllipticalArc(p0, p1, rx, ry, xAxisRotation, largeArc, sweep, t) {
    var rx1 = Math.abs(rx);
    var ry1 = Math.abs(ry);
    var xAxisRotation1 = toRadians(xAxisRotation % 360);
    var t1 = clamp(t, 0, 1);
    if (p0.x === p1.x && p0.y === p1.y)
        return p0;
    if (!rx1 || !ry1)
        return pointOnLine(p0, p1, t1);
    var dx = (p0.x - p1.x) * 0.5;
    var dy = (p0.y - p1.y) * 0.5;
    var transformedPoint = new Vector2_1.default(Math.cos(xAxisRotation1) * dx + Math.sin(xAxisRotation1) * dy, -Math.sin(xAxisRotation1) * dx + Math.cos(xAxisRotation1) * dy);
    var radiiCheck = (Math.pow(transformedPoint.x, 2)) / (Math.pow(rx1, 2))
        + (Math.pow(transformedPoint.y, 2)) / (Math.pow(ry1, 2));
    if (radiiCheck > 1) {
        var radiiCheckRoot = Math.sqrt(radiiCheck);
        rx1 *= radiiCheckRoot;
        ry1 *= radiiCheckRoot;
    }
    var cSquareNumerator = (Math.pow(rx1, 2)) * (Math.pow(ry1, 2))
        - (Math.pow(rx1, 2)) * (Math.pow(transformedPoint.y, 2))
        - (Math.pow(ry1, 2)) * (Math.pow(transformedPoint.x, 2));
    var cSquareRootDenom = (Math.pow(rx1, 2)) * (Math.pow(transformedPoint.y, 2))
        + (Math.pow(ry1, 2)) * (Math.pow(transformedPoint.x, 2));
    var cRadicand = Math.max(cSquareNumerator / cSquareRootDenom, 0);
    var cCoef = (largeArc !== sweep ? 1 : -1) * Math.sqrt(cRadicand);
    var transformedCenter = new Vector2_1.default(cCoef * ((rx1 * transformedPoint.y) / ry1), cCoef * (-(ry1 * transformedPoint.x) / rx1));
    var center = new Vector2_1.default(Math.cos(xAxisRotation1) * transformedCenter.x
        - Math.sin(xAxisRotation1) * transformedCenter.y
        + (p0.x + p1.x) / 2, Math.sin(xAxisRotation1) * transformedCenter.x
        + Math.cos(xAxisRotation1) * transformedCenter.y
        + (p0.y + p1.y) / 2);
    var startVector = new Vector2_1.default((transformedPoint.x - transformedCenter.x) / rx1, (transformedPoint.y - transformedCenter.y) / ry1);
    var startAngle = Vector2_1.default.angleBetween(new Vector2_1.default(1, 0), startVector);
    var endVector = new Vector2_1.default((-transformedPoint.x - transformedCenter.x) / rx1, (-transformedPoint.y - transformedCenter.y) / ry1);
    var sweepAngle = Vector2_1.default.angleBetween(startVector, endVector);
    if (!sweep && sweepAngle > 0) {
        sweepAngle -= 2 * Math.PI;
    }
    else if (sweep && sweepAngle < 0) {
        sweepAngle += 2 * Math.PI;
    }
    sweepAngle %= 2 * Math.PI;
    var angle = startAngle + (sweepAngle * t1);
    var ellipseComponentX = rx1 * Math.cos(angle);
    var ellipseComponentY = ry1 * Math.sin(angle);
    return new Vector2_1.default(Math.cos(xAxisRotation1) * ellipseComponentX
        - Math.sin(xAxisRotation1) * ellipseComponentY
        + center.x, Math.sin(xAxisRotation1) * ellipseComponentX
        + Math.cos(xAxisRotation1) * ellipseComponentY
        + center.y);
}
exports.pointOnEllipticalArc = pointOnEllipticalArc;
function drawCurve(curve, subdivideThreshold, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = 1; }
    if (subdivideThreshold <= 0)
        throw new Error("'curveThreshold' must be greater than zero.");
    if (start < 0 || start > 1)
        throw new Error("'start' must be between 0 and 1.");
    if (end < 0 || end > 1)
        throw new Error("'end' must be between 0 and 1.");
    var middle = lerp(start, end, 0.5);
    var startPoint = curve(start);
    var midPoint = curve(middle);
    var endPoint = curve(end);
    var toMidPoint = midPoint.subtract(startPoint);
    var toEndPoint = endPoint.subtract(startPoint);
    var angleToMidPoint = toDegrees(Math.abs(Vector2_1.default.angleBetween(toMidPoint, toEndPoint)));
    var positions = [];
    if ((start === 0 && end === 1) || angleToMidPoint > subdivideThreshold) {
        positions = positions.concat(drawCurve(curve, subdivideThreshold, start, middle), drawCurve(curve, subdivideThreshold, middle, end).slice(1));
    }
    else {
        positions = [startPoint, endPoint];
    }
    return positions;
}
exports.drawCurve = drawCurve;
//# sourceMappingURL=math-utils.js.map