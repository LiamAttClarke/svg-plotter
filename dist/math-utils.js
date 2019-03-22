"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2_1 = require("./Vector2");
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
function pointOnLine(p0, p1, t) {
    t = clamp(t, 0, 1);
    return new Vector2_1.default(lerp(p0.x, p1.x, t), lerp(p0.y, p1.y, t));
}
exports.pointOnLine = pointOnLine;
function pointOnEllipse(center, rx, ry, t) {
    var theta = Math.PI * 2 * t;
    return new Vector2_1.default(center.x + rx * Math.cos(theta), center.y + ry * Math.sin(theta));
}
exports.pointOnEllipse = pointOnEllipse;
function pointOnCubicBezierCurve(p0, p1, p2, p3, t) {
    t = clamp(t, 0, 1);
    var f = function (x0, x1, x2, x3, t) {
        var n = 1 - t;
        var term1 = n * n * n * x0;
        var term2 = 3 * n * n * t * x1;
        var term3 = 3 * n * t * t * x2;
        var term4 = t * t * t * x3;
        return term1 + term2 + term3 + term4;
    };
    return new Vector2_1.default(f(p0.x, p1.x, p2.x, p3.x, t), f(p0.y, p1.y, p2.y, p3.y, t));
}
exports.pointOnCubicBezierCurve = pointOnCubicBezierCurve;
function pointOnQuadraticBezierCurve(p0, p1, p2, t) {
    t = clamp(t, 0, 1);
    var f = function (x0, x1, x2, t) {
        var n = 1 - t;
        var term1 = n * n * x0;
        var term2 = 2 * n * t * x1;
        var term3 = t * t * x2;
        return term1 + term2 + term3;
    };
    return new Vector2_1.default(f(p0.x, p1.x, p2.x, t), f(p0.y, p1.y, p2.y, t));
}
exports.pointOnQuadraticBezierCurve = pointOnQuadraticBezierCurve;
function pointOnEllipticalArc(p0, p1, rx, ry, xAxisRotation, largeArc, sweep, t) {
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    xAxisRotation = toRadians(xAxisRotation % 360);
    t = clamp(t, 0, 1);
    if (p0.x === p1.x && p0.y === p1.y)
        return p0;
    if (!rx || !ry)
        return pointOnLine(p0, p1, t);
    var dx = (p0.x - p1.x) * 0.5;
    var dy = (p0.y - p1.y) * 0.5;
    var transformedPoint = new Vector2_1.default(Math.cos(xAxisRotation) * dx + Math.sin(xAxisRotation) * dy, -Math.sin(xAxisRotation) * dx + Math.cos(xAxisRotation) * dy);
    var radiiCheck = Math.pow(transformedPoint.x, 2) / Math.pow(rx, 2) + Math.pow(transformedPoint.y, 2) / Math.pow(ry, 2);
    if (radiiCheck > 1) {
        var radiiCheckRoot = Math.sqrt(radiiCheck);
        rx *= radiiCheckRoot;
        ry *= radiiCheckRoot;
    }
    var cSquareNumerator = Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) - Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
    var cSquareRootDenom = Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) + Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
    var cRadicand = Math.max(cSquareNumerator / cSquareRootDenom, 0);
    var cCoef = (largeArc !== sweep ? 1 : -1) * Math.sqrt(cRadicand);
    var transformedCenter = new Vector2_1.default(cCoef * ((rx * transformedPoint.y) / ry), cCoef * (-(ry * transformedPoint.x) / rx));
    var center = new Vector2_1.default(Math.cos(xAxisRotation) * transformedCenter.x - Math.sin(xAxisRotation) * transformedCenter.y + ((p0.x + p1.x) / 2), Math.sin(xAxisRotation) * transformedCenter.x + Math.cos(xAxisRotation) * transformedCenter.y + ((p0.y + p1.y) / 2));
    var startVector = new Vector2_1.default((transformedPoint.x - transformedCenter.x) / rx, (transformedPoint.y - transformedCenter.y) / ry);
    var startAngle = Vector2_1.default.angleBetween(new Vector2_1.default(1, 0), startVector);
    var endVector = new Vector2_1.default((-transformedPoint.x - transformedCenter.x) / rx, (-transformedPoint.y - transformedCenter.y) / ry);
    var sweepAngle = Vector2_1.default.angleBetween(startVector, endVector);
    if (!sweep && sweepAngle > 0) {
        sweepAngle -= 2 * Math.PI;
    }
    else if (sweep && sweepAngle < 0) {
        sweepAngle += 2 * Math.PI;
    }
    sweepAngle %= 2 * Math.PI;
    var angle = startAngle + (sweepAngle * t);
    var ellipseComponentX = rx * Math.cos(angle);
    var ellipseComponentY = ry * Math.sin(angle);
    return new Vector2_1.default(Math.cos(xAxisRotation) * ellipseComponentX - Math.sin(xAxisRotation) * ellipseComponentY + center.x, Math.sin(xAxisRotation) * ellipseComponentX + Math.cos(xAxisRotation) * ellipseComponentY + center.y);
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