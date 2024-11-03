import 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as svgson from 'svgson';
import * as GeoJSONValidation from 'geojson-validation';
import { getSVGMetadata } from '../../src/index';
import { polyline } from '../../src/transformers';
import { DEFAULT_CONVERT_OPTIONS } from '../helpers';

describe('transformer: polyline', () => {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline

  const svgPolyline = fs.readFileSync(path.join(__dirname, '../files/polyline.svg'), 'utf8');

  it('should convert a SVG Polyline to a GeoJSON LineString', async () => {
    const parsedSVG = await svgson.parse(svgPolyline, { camelcase: true });
    const svgMeta = getSVGMetadata(parsedSVG);
    const { features } = polyline(parsedSVG.children[0], svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(features.length).to.equal(1);
    const [polylineFeature] = features;
    expect(GeoJSONValidation.isFeature(polylineFeature, true)).to.be.empty;
    expect(GeoJSONValidation.isLineString(polylineFeature.geometry, true)).to.be.empty;
    expect(polylineFeature.geometry.type).to.equal("LineString");
    if (polylineFeature.geometry.type == "LineString") {
      expect(polylineFeature.geometry.coordinates).to.deep.equal([
        [-93.60000000000001, 21.105820224194197],
        [-86.4, 7.181124828276247],
        [-79.19999999999999, 14.25075373529648],
        [-72, -7.181124828276273],
        [-64.80000000000001, 0],
        [-57.599999999999994, -21.105820224194215],
        [-50.400000000000006, -14.2507537352965],
        [-43.2, -33.841220320476765],
        [-35.99999999999999, -27.658619791226744],
      ]);
    }
  });

});
