import 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as svgson from 'svgson';
import * as GeoJSONValidation from 'geojson-validation';
import { getSVGMetadata } from '../../src/index';
import { rect } from '../../src/transformers';
import { DEFAULT_CONVERT_OPTIONS } from '../helpers';

describe('transformer: rect', () => {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect

  const svgRect = fs.readFileSync(path.join(__dirname, '../files/rect.svg'), 'utf8');

  it('should convert a SVG Rect to a GeoJSON Polygon', async () => {
    const parsedSVG = await svgson.parse(svgRect, { camelcase: true });
    const svgMeta = getSVGMetadata(parsedSVG);
    const { features } = rect(parsedSVG.children[0], svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(features.length).to.equal(1);
    const [rectFeature] = features;
    expect(GeoJSONValidation.isFeature(rectFeature, true)).to.be.empty;
    expect(GeoJSONValidation.isPolygon(rectFeature.geometry, true)).to.be.empty;
    expect(rectFeature.geometry.coordinates).to.deep.equal([[
      [-90, 66.51326044311186],
      [90, 66.51326044311186],
      [90, -66.51326044311186],
      [-90, -66.51326044311186],
      [-90, 66.51326044311186]
    ]]);
  });

  it('should convert a rounded SVG Rect to a GeoJSON Polygon', async () => {
    const parsedSVG = await svgson.parse(svgRect, { camelcase: true });
    const svgMeta = getSVGMetadata(parsedSVG);
    const { features } = rect(parsedSVG.children[1], svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(features.length).to.equal(1);
    const [rectFeature] = features;
    expect(GeoJSONValidation.isFeature(rectFeature, true)).to.be.empty;
    expect(GeoJSONValidation.isPolygon(rectFeature.geometry, true)).to.be.empty;
    expect(rectFeature.geometry.coordinates).to.deep.equal([[
      [-90, 40.979898069620134],
      [-83.40990257669732, 60.67484327381422],
      [-76.11037722821453, 65.1101218491444],
      [-67.5, 66.51326044311186],
      [71.88953224536287, 66.1662669326175],
      [76.11037722821452, 65.1101218491444],
      [83.40990257669732, 60.67484327381422],
      [90, 40.97989806962015],
      [83.40990257669732, -60.67484327381424],
      [76.11037722821452, -65.1101218491444],
      [67.5, -66.51326044311186],
      [-71.88953224536287, -66.1662669326175],
      [-76.11037722821452, -65.1101218491444],
      [-83.40990257669732, -60.67484327381424],
      [-90, -40.97989806962015],
      [-90, 40.979898069620134]
    ]]);
  });

});
