"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var svgTransformParser = require("ya-svg-transform");
var groupTransformer = function (node) {
    var features = [];
    var children = node.children;
    var groupTransform = node.attributes.transform
        ? svgTransformParser.transform(node.attributes.transform).asMatrix()
        : null;
    if (groupTransform && children.length) {
        children = children.map(function (child) {
            var outputChild = child;
            if (node.attributes.transform) {
                outputChild = JSON.parse(JSON.stringify(outputChild));
                if (outputChild.attributes.transform) {
                    var childTransform = svgTransformParser
                        .transform(child.attributes.transform)
                        .asMatrix();
                    outputChild.attributes.transform = groupTransform
                        .dot(childTransform)
                        .render();
                }
                else {
                    outputChild.attributes.transform = node.attributes.transform;
                }
            }
            return outputChild;
        });
    }
    return { features: features, children: children };
};
exports.default = groupTransformer;
//# sourceMappingURL=group.js.map