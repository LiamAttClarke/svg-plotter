import 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as svgson from 'svgson';
import * as GeoJSONValidation from 'geojson-validation';
import { getSVGMetadata } from '../../src/index';
import { ellipse } from '../../src/transformers';
import { DEFAULT_CONVERT_OPTIONS } from '../helpers';

describe('transformer: ellipse', () => {
  // Circle reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
  // Ellipse reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse

  const svgCircle = fs.readFileSync(path.join(__dirname, '../files/circle.svg'), 'utf8');
  const svgEllipse = fs.readFileSync(path.join(__dirname, '../files/ellipse.svg'), 'utf8');

  it('should convert a SVG Circle to a GeoJSON Polygon', async () => {
    const parsedSVG = await svgson.parse(svgCircle, { camelcase: true });
    const svgMeta = getSVGMetadata(parsedSVG);
    const { features } = ellipse([parsedSVG.children[0]], svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(features.length).to.equal(1);
    const [ellipseFeature] = features;
    expect(GeoJSONValidation.isFeature(ellipseFeature, true)).to.be.empty;
    expect(GeoJSONValidation.isPolygon(ellipseFeature.geometry, true)).to.be.empty;
    expect(ellipseFeature.geometry.coordinates).to.deep.equal([[
      [90, 0],
      [83.14915792601583, -32.537020833713726],
      [63.63961030678928, -53.54434684391228],
      [34.44150891285806, -63.62879981868179],
      [0, -66.51326044311186],
      [-34.44150891285806, -63.62879981868179],
      [-63.63961030678928, -53.54434684391228],
      [-83.1491579260158, -32.537020833713726],
      [-90, 0],
      [-83.14915792601583, 32.537020833713726],
      [-63.63961030678929, 53.5443468439123],
      [-34.441508912858126, 63.62879981868177],
      [-1.9984014443252818e-14, 66.51326044311186],
      [34.44150891285811, 63.62879981868177],
      [63.63961030678928, 53.54434684391231],
      [83.14915792601579, 32.53702083371378],
      [90, 0]
    ]]);
  });

  it('should convert a SVG Ellipse to a GeoJSON Polygon', async () => {
    const parsedSVG = await svgson.parse(svgEllipse, { camelcase: true });
    const svgMeta = getSVGMetadata(parsedSVG);
    const { features } = ellipse([parsedSVG.children[0]], svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(features.length).to.equal(1);
    const [ellipseFeature] = features;
    expect(GeoJSONValidation.isFeature(ellipseFeature, true)).to.be.empty;
    expect(GeoJSONValidation.isPolygon(ellipseFeature.geometry, true)).to.be.empty;
    expect(ellipseFeature.geometry.coordinates).to.deep.equal([[
      [90, 0],
      [88.27067523629073, -8.74491305102165],
      [83.14915792601583, -16.967185870864693],
      [63.63961030678928, -30.29995252677561],
      [0, -40.97989806962015],
      [-63.63961030678928, -30.29995252677561],
      [-83.1491579260158, -16.967185870864693],
      [-90, 0],
      [-88.27067523629073, 8.74491305102165],
      [-83.14915792601583, 16.967185870864668],
      [-63.63961030678929, 30.29995252677559],
      [-1.9984014443252818e-14, 40.979898069620134],
      [63.63961030678928, 30.29995252677561],
      [83.14915792601579, 16.967185870864693],
      [90, 0]
    ]]);
  });

});
