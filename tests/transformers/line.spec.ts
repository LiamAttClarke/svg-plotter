import 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as svgson from 'svgson';
import * as GeoJSONValidation from 'geojson-validation';
import { getSVGMetadata } from '../../src/index';
import { line } from '../../src/transformers';
import { DEFAULT_CONVERT_OPTIONS } from '../helpers';

describe('transformer: line', () => {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line

  const svgLine = fs.readFileSync(path.join(__dirname, '../files/line.svg'), 'utf8');

  it('should convert a SVG Line to a GeoJSON LineString', async () => {
    const parsedSVG = await svgson.parse(svgLine, { camelcase: true });
    const svgMeta = getSVGMetadata(parsedSVG);
    const { features } = line([parsedSVG.children[0]], svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(features.length).to.equal(1);
    const [lineFeature] = features;
    expect(GeoJSONValidation.isFeature(lineFeature, true)).to.be.empty;
    expect(GeoJSONValidation.isLineString(lineFeature.geometry, true)).to.be.empty;
    expect((lineFeature.geometry as GeoJsonObject).coordinates).to.deep.equal([[-90, 66.51326044311186], [90, -66.51326044311186]]);
  });

});
