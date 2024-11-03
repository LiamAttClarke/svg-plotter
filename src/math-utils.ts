import { Coordinate } from "./types";
import Vector2 from "./Vector2";
import { EARTH_RADIUS } from "./constants";

interface ICurve {
    (t: number): Vector2;
}

export function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(min, n), max);
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function toRadians(deg: number): number {
    return (Math.PI / 180) * deg;
}

export function toDegrees(rad: number): number {
    return (180 / Math.PI) * rad;
}

/** Reference: https://en.wikipedia.org/wiki/Haversine_formula */
export function haversineDistance(coordA: Coordinate, coordB: Coordinate): number {
    const latARad = toRadians(coordA.latitude);
    const latBRad = toRadians(coordB.latitude);
    const latDeltaRad = latBRad - latARad;
    const lonDeltaRad = toRadians(coordB.longitude - coordA.longitude);
    const halfChordLengthSquared = Math.sin(latDeltaRad * 0.5) * Math.sin(latDeltaRad * 0.5)
        + Math.cos(latARad) * Math.cos(latBRad)
        * Math.sin(lonDeltaRad * 0.5) * Math.sin(lonDeltaRad * 0.5);
    const angularDistance = 2 * Math.atan2(
        Math.sqrt(halfChordLengthSquared),
        Math.sqrt(1 - halfChordLengthSquared),
    );
    return EARTH_RADIUS * angularDistance;
}

/**
 *  Cubic Bezier Curve
 *  Reference: https://developer.mozilla.org/en/docs/Web/SVG/Tutorial/Paths#Bezier_Curves
 */
export function cubicBezier(x0: number, x1: number, x2: number, x3: number, t: number): number {
    const n = 1 - t;
    const term1 = n * n * n * x0;
    const term2 = 3 * n * n * t * x1;
    const term3 = 3 * n * t * t * x2;
    const term4 = t * t * t * x3;
    return term1 + term2 + term3 + term4;
}

/**
 *  Quadratic Bezier Curve
 *  Reference: https://developer.mozilla.org/en/docs/Web/SVG/Tutorial/Paths#Bezier_Curves
 */
export function quadraticBezier(x0: number, x1: number, x2: number, t: number): number {
    const n = 1 - t;
    const term1 = n * n * x0;
    const term2 = 2 * n * t * x1;
    const term3 = t * t * x2;
    return term1 + term2 + term3;
}

export function pointOnLine(p0: Vector2, p1: Vector2, t: number): Vector2 {
    const t1 = clamp(t, 0, 1);
    return new Vector2(
        lerp(p0.x, p1.x, t1),
        lerp(p0.y, p1.y, t1),
    );
}

export function pointOnEllipse(center: Vector2, rx: number, ry: number, t: number): Vector2 {
    const theta = Math.PI * 2 * t;
    return new Vector2(center.x + rx * Math.cos(theta), center.y + ry * Math.sin(theta));
}

export function pointOnCubicBezierCurve(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    p3: Vector2,
    t: number,
): Vector2 {
    const t1 = clamp(t, 0, 1);
    return new Vector2(
        cubicBezier(p0.x, p1.x, p2.x, p3.x, t1),
        cubicBezier(p0.y, p1.y, p2.y, p3.y, t1),
    );
}

export function pointOnQuadraticBezierCurve(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    t: number,
): Vector2 {
    const t1 = clamp(t, 0, 1);
    return new Vector2(
        quadraticBezier(p0.x, p1.x, p2.x, t1),
        quadraticBezier(p0.y, p1.y, p2.y, t1),
    );
}

export function pointOnEllipticalArc(
    p0: Vector2,
    p1: Vector2,
    rx: number,
    ry: number,
    xAxisRotation: number,
    largeArc: boolean,
    sweep: boolean,
    t: number,
): Vector2 {
    // SVG arc reference: https://www.w3.org/TR/SVG/implnote.html#ArcSyntax
    let rx1 = Math.abs(rx);
    let ry1 = Math.abs(ry);
    const xAxisRotation1 = toRadians(xAxisRotation % 360);
    const t1 = clamp(t, 0, 1);
    // If the endpoints are identical,
    // then this is equivalent to omitting the elliptical arc segment entirely.
    if (p0.x === p1.x && p0.y === p1.y) return p0;
    // If rx = 0 or ry = 0 then this arc is treated as a straight line segment joining the endpoints.
    if (!rx1 || !ry1) return pointOnLine(p0, p1, t1);
    // Following 'Conversion from endpoint to center parameterization'
    // http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
    // Compute transformedPoint
    const dx = (p0.x - p1.x) * 0.5;
    const dy = (p0.y - p1.y) * 0.5;
    const transformedPoint = new Vector2(
        Math.cos(xAxisRotation1) * dx + Math.sin(xAxisRotation1) * dy,
        -Math.sin(xAxisRotation1) * dx + Math.cos(xAxisRotation1) * dy,
    );
    // Ensure radii are large enough
    const radiiCheck = (transformedPoint.x ** 2) / (rx1 ** 2)
        + (transformedPoint.y ** 2) / (ry1 ** 2);
    if (radiiCheck > 1) {
        const radiiCheckRoot = Math.sqrt(radiiCheck);
        rx1 *= radiiCheckRoot;
        ry1 *= radiiCheckRoot;
    }
    // Compute transformedCenter
    const cSquareNumerator = (rx1 ** 2) * (ry1 ** 2)
        - (rx1 ** 2) * (transformedPoint.y ** 2)
        - (ry1 ** 2) * (transformedPoint.x ** 2);
    const cSquareRootDenom = (rx1 ** 2) * (transformedPoint.y ** 2)
        + (ry1 ** 2) * (transformedPoint.x ** 2);
    // Make sure this never drops below zero because of precision
    const cRadicand = Math.max(cSquareNumerator / cSquareRootDenom, 0);
    const cCoef = (largeArc !== sweep ? 1 : -1) * Math.sqrt(cRadicand);
    const transformedCenter = new Vector2(
        cCoef * ((rx1 * transformedPoint.y) / ry1),
        cCoef * (-(ry1 * transformedPoint.x) / rx1),
    );
    // Compute center
    const center = new Vector2(
        Math.cos(xAxisRotation1) * transformedCenter.x
        - Math.sin(xAxisRotation1) * transformedCenter.y
        + (p0.x + p1.x) / 2,
        Math.sin(xAxisRotation1) * transformedCenter.x
        + Math.cos(xAxisRotation1) * transformedCenter.y
        + (p0.y + p1.y) / 2,
    );
    // Compute start/sweep angles
    // Start angle of the elliptical arc prior to the stretch and rotate operations.
    // Difference between the start and end angles
    const startVector = new Vector2(
        (transformedPoint.x - transformedCenter.x) / rx1,
        (transformedPoint.y - transformedCenter.y) / ry1,
    );
    const startAngle = Vector2.angleBetween(new Vector2(1, 0), startVector);
    const endVector = new Vector2(
        (-transformedPoint.x - transformedCenter.x) / rx1,
        (-transformedPoint.y - transformedCenter.y) / ry1,
    );
    let sweepAngle = Vector2.angleBetween(startVector, endVector);

    if (!sweep && sweepAngle > 0) {
        sweepAngle -= 2 * Math.PI;
    } else if (sweep && sweepAngle < 0) {
        sweepAngle += 2 * Math.PI;
    }
    sweepAngle %= 2 * Math.PI;

    // From http://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives
    const angle = startAngle + (sweepAngle * t1);
    const ellipseComponentX = rx1 * Math.cos(angle);
    const ellipseComponentY = ry1 * Math.sin(angle);

    return new Vector2(
        Math.cos(xAxisRotation1) * ellipseComponentX
        - Math.sin(xAxisRotation1) * ellipseComponentY
        + center.x,
        Math.sin(xAxisRotation1) * ellipseComponentX
        + Math.cos(xAxisRotation1) * ellipseComponentY
        + center.y,
    );
}

export function drawCurve(
    curve: ICurve,
    subdivideThreshold: number,
    start = 0,
    end = 1,
): Vector2[] {
    if (subdivideThreshold <= 0) throw new Error("'curveThreshold' must be greater than zero.");
    if (start < 0 || start > 1) throw new Error("'start' must be between 0 and 1.");
    if (end < 0 || end > 1) throw new Error("'end' must be between 0 and 1.");
    const middle = lerp(start, end, 0.5);
    const startPoint = curve(start);
    const midPoint = curve(middle);
    const endPoint = curve(end);
    const toMidPoint = midPoint.subtract(startPoint);
    const toEndPoint = endPoint.subtract(startPoint);
    const angleToMidPoint = toDegrees(Math.abs(Vector2.angleBetween(toMidPoint, toEndPoint)));
    let positions: Vector2[] = [];
    // Subdivided curve at least once so that closed curves (ellipse) don't immediately terminate
    if ((start === 0 && end === 1) || angleToMidPoint > subdivideThreshold) {
        positions = positions.concat(
            drawCurve(curve, subdivideThreshold, start, middle),
            drawCurve(curve, subdivideThreshold, middle, end).slice(1),
        );
    } else {
        positions = [startPoint, endPoint];
    }
    return positions;
}
