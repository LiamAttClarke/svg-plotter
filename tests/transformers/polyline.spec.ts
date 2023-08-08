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
    const { features } = polyline([parsedSVG.children[0]], svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(features.length).to.equal(1);
    const [polylineFeature] = features;
    expect(GeoJSONValidation.isFeature(polylineFeature, true)).to.be.empty;
    expect(GeoJSONValidation.isLineString(polylineFeature.geometry, true)).to.be.empty;
    expect(polylineFeature.geometry.coordinates).to.deep.equal([
      [-110.88, -17.711014416582245],
      [-105.12000000000002, -33.841220320476765],
      [-99.36000000000001, -26.05283495188394],
      [-93.60000000000001, -47.422140992876095],
      [-87.84, -40.97989806962015],
      [-82.08, -58.22628219768537],
      [-76.32000000000001, -53.16258159476075],
      [-70.56, -66.51326044311186],
      [-64.80000000000001, -62.658000452319406],
    ]);
  });

});
