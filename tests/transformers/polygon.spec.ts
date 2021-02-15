import 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as svgson from 'svgson';
import * as GeoJSONValidation from 'geojson-validation';
import { getSVGMetadata } from '../../src/index';
import { polygon } from '../../src/transformers';
import { DEFAULT_CONVERT_OPTIONS } from '../helpers';

describe('transformer: polygon', () => {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon

  const svgPolygon = fs.readFileSync(path.join(__dirname, '../files/polygon.svg'), 'utf8');

  it('should convert a SVG Polygon to a GeoJSON Polygon', async () => {
    const parsedSVG = await svgson.parse(svgPolygon, { camelcase: true });
    const svgMeta = getSVGMetadata(parsedSVG);
    const { features } = polygon(parsedSVG.children[0], svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(features.length).to.equal(1);
    const [polygonFeature] = features;
    expect(GeoJSONValidation.isFeature(polygonFeature, true)).to.be.empty;
    expect(GeoJSONValidation.isPolygon(polygonFeature.geometry, true)).to.be.empty;
    expect(polygonFeature.geometry.coordinates).to.deep.equal([
      [
        [-122.39999999999999, -72.73278609432643],
        [-116.64, -80.73800862798672],
        [-99.36000000000001, -80.73800862798672],
        [-110.88, -83.22814054417216],
        [-105.12000000000002, -85.10173601678947],
        [-122.39999999999999, -84.21070904403568],
        [-139.68, -85.10173601678947],
        [-133.92, -83.22814054417216],
        [-145.44000000000003, -80.73800862798672],
        [-128.16, -80.73800862798672],
        [-122.39999999999999, -72.73278609432643]
      ]
    ]);
  });

});
