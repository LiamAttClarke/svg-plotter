"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2 = (function () {
    function Vector2(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Vector2.fromArray = function (arr) {
        if (arr.length !== 2)
            throw new Error("'arr' length must be 2.");
        return new Vector2(arr[0], arr[1]);
    };
    Vector2.dot = function (u, v) {
        return u.x * v.x + u.y * v.y;
    };
    Vector2.distance = function (v, u) {
        return u.subtract(v).magnitude();
    };
    Vector2.angleBetween = function (a, b) {
        var p = a.x * b.x + a.y * b.y;
        var n = Math.sqrt((Math.pow(a.x, 2) + Math.pow(a.y, 2)) * (Math.pow(b.x, 2) + Math.pow(b.y, 2)));
        var sign = a.x * b.y - a.y * b.x < 0 ? -1 : 1;
        var angle = Math.acos(p / n);
        return sign * angle;
    };
    Vector2.prototype.add = function (v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    };
    Vector2.prototype.subtract = function (v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    };
    Vector2.prototype.multiplyByScalar = function (n) {
        return new Vector2(this.x * n, this.y * n);
    };
    Vector2.prototype.negate = function () {
        return new Vector2(-this.x, -this.y);
    };
    Vector2.prototype.magnitude = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector2.prototype.normalize = function () {
        var magnitude = this.magnitude();
        return new Vector2(this.x / magnitude, this.y / magnitude);
    };
    Vector2.prototype.perpendicular = function (clockwise) {
        if (clockwise === void 0) { clockwise = true; }
        return clockwise ? new Vector2(this.y, -this.x) : new Vector2(-this.y, this.x);
    };
    Vector2.prototype.toArray = function () {
        return [this.x, this.y];
    };
    return Vector2;
}());
exports.default = Vector2;
//# sourceMappingURL=Vector2.js.map