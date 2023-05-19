import { INode } from "svgson";
import * as svgTransformParser from "ya-svg-transform";
import { SVGNodeTransformer } from "../types.ts";

/** Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g */
const groupTransformer: SVGNodeTransformer = (node) => {
  const features: Array<GeoJSON.Feature> = [];
  let { children } = node;
  const groupTransform = node.attributes.transform
    ? svgTransformParser.transform(node.attributes.transform).asMatrix()
    : null;
  if (groupTransform && children.length) {
    // Apply transform attribute to children recursively
    children = children.map((child: any) => {
      let outputChild = child;
      if (node.attributes.transform) {
        // Clone child
        outputChild = JSON.parse(JSON.stringify(outputChild)) as INode;
        // Apply transform
        if (outputChild.attributes.transform) {
          const childTransform = svgTransformParser
            .transform(child.attributes.transform)
            .asMatrix();
          outputChild.attributes.transform = groupTransform.dot(childTransform)
            .render();
        } else {
          outputChild.attributes.transform = node.attributes.transform;
        }
      }
      return outputChild;
    });
  }
  return { features, children };
};

export default groupTransformer;
