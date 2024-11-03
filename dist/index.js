"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSVG = exports.getSVGMetadata = void 0;
var svgson_1 = require("svgson");
var Transformers = require("./transformers");
var DEFAULT_CONVERT_OPTIONS = {
    center: { longitude: 0, latitude: 0 },
    width: 1000e3,
    bearing: 0,
    subdivideThreshold: 5,
};
var transformers = {
    svg: Transformers.group,
    g: Transformers.group,
    circle: Transformers.ellipse,
    ellipse: Transformers.ellipse,
    line: Transformers.line,
    path: Transformers.path,
    polyline: Transformers.polyline,
    polygon: Transformers.polygon,
    rect: Transformers.rect,
};
function svgNodeToFeatures(node, svgMeta, options) {
    var outputFeatures = [];
    var transformer = transformers[node.name];
    var errors = [];
    if (transformer) {
        var _a = transformer(node, svgMeta, options), features = _a.features, children = _a.children;
        outputFeatures.push.apply(outputFeatures, features);
        children.forEach(function (n) {
            var childOutput = svgNodeToFeatures(n, svgMeta, options);
            outputFeatures.push.apply(outputFeatures, childOutput.features);
            errors.push.apply(errors, childOutput.errors);
        });
    }
    else {
        errors.push("Skipping unsupported node: ".concat(node.name));
    }
    return {
        features: outputFeatures,
        errors: errors,
    };
}
function getSVGMetadata(parsedSVG) {
    var svgMeta = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };
    if (parsedSVG.attributes.viewBox) {
        var coords = parsedSVG.attributes.viewBox.split(" ");
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
        throw new Error("SVG must have a viewBox or width/height attributes.");
    }
    return svgMeta;
}
exports.getSVGMetadata = getSVGMetadata;
function convertSVG(input, options) {
    if (options === void 0) { options = {}; }
    var parsedSVG = (0, svgson_1.parseSync)(input, { camelcase: true });
    var svgMeta = getSVGMetadata(parsedSVG);
    var _a = svgNodeToFeatures(parsedSVG, svgMeta, __assign(__assign({}, DEFAULT_CONVERT_OPTIONS), options)), features = _a.features, errors = _a.errors;
    return {
        geojson: { type: "FeatureCollection", features: features },
        errors: errors,
    };
}
exports.convertSVG = convertSVG;
//# sourceMappingURL=index.js.map