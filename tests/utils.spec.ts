import 'mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiRoughly from 'chai-roughly';
import GeoJSONValidation from 'geojson-validation';
import { ConvertSVGOptions, SVGMetaData } from '../src/types';
import { EARTH_CIRCUMFERENCE } from '../src/constants';
import Vector2 from '../src/Vector2';
import {
  parseSVGPointsString,
  createFeature,
  svgPointToCoordinate,
} from '../src/utils';
import { DEFAULT_CONVERT_OPTIONS } from './helpers';

chai.use(chaiRoughly);

describe('parseSVGPointsString', () => {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/points

  it('should return a list of points given a comma delimited SVG points string', () => {
    const parsedPoints = parseSVGPointsString('1,2 3,-4 5.1,-6.01');
    expect(parsedPoints.length).to.equal(3);
    expect(parsedPoints[0]).to.deep.equal(new Vector2(1, 2));
    expect(parsedPoints[1]).to.deep.equal(new Vector2(3, -4));
    expect(parsedPoints[2]).to.deep.equal(new Vector2(5.1, -6.01));
  });

  it('should return a list of points given a space delimited SVG points string', () => {
    const parsedPoints = parseSVGPointsString('1 2 3 -4 5.1 -6.01');
    expect(parsedPoints.length).to.equal(3);
    expect(parsedPoints[0]).to.deep.equal(new Vector2(1, 2));
    expect(parsedPoints[1]).to.deep.equal(new Vector2(3, -4));
    expect(parsedPoints[2]).to.deep.equal(new Vector2(5.1, -6.01));
  });

  it('should ignore coordinates that are not a multiple of two', () => {
    const parsedPoints = parseSVGPointsString('1 2 3 4 5 6 7');
    expect(parsedPoints.length).to.equal(3);
    expect(parsedPoints[0]).to.deep.equal(new Vector2(1, 2));
    expect(parsedPoints[1]).to.deep.equal(new Vector2(3, 4));
    expect(parsedPoints[2]).to.deep.equal(new Vector2(5, 6));
  });

});

describe('createFeature', () => {

  it('should return a valid GeoJSON Feature', () => {
    const feature = createFeature({ type: 'Point', coordinates: [0, 0] }, 'test', { a: 123 });
    expect(GeoJSONValidation.isFeature(feature, true)).to.be.empty;
    expect(feature).to.deep.equal({
      id:'test',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      },
      properties: {
        a: 123
      }
    });
  });

  it('should return a GeoJSON Feature with no id property when id is null', () => {
    const feature = createFeature({ type: 'Point', coordinates: [0, 0] }, null, { a: 123 });
    expect('id' in feature).to.be.false;
  });

  it('should return a GeoJSON Feature with properties=null when argument properties is null', () => {
    const feature = createFeature({ type: 'Point', coordinates: [0, 0] }, null, null);
    expect(feature.properties).to.equal(null);
  });

});

describe('svgPointToCoordinate', () => {

  // TODO: Add test case for svg with x/y and viewbox attributes

  const svgMeta: SVGMetaData = { x: 0, y: 0, width: 512, height: 512 };

  it('should return the point projected with a mercator projection', () => {
    const coord1 = svgPointToCoordinate(new Vector2(256, 256), svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(coord1).to.deep.equal([0, 0]);
    const coord2 = svgPointToCoordinate(new Vector2(512, 512), svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(coord2).to.deep.equal([180, -85.05112877980663]);
  });

  it('should clamp latitudes that exceed (+/-)85 degrees', () => {
    const coord1 = svgPointToCoordinate(new Vector2(256, 512), svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(Math.round(coord1[1])).to.equal(-85);
    const coord2 = svgPointToCoordinate(new Vector2(256, 0), svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(Math.round(coord2[1])).to.equal(85);
  });

  it('should clamp longitudes that exceed (+/-)180 degrees', () => {
    const coord1 = svgPointToCoordinate(new Vector2(600, 256), svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(coord1[0]).to.equal(180);
    const coord2 = svgPointToCoordinate(new Vector2(-600, 256), svgMeta, DEFAULT_CONVERT_OPTIONS);
    expect(coord2[0]).to.equal(-180);
  });

  it('should scale coordinate to fit options.width', () => {
    const convertOptions:ConvertSVGOptions = {
      center: { longitude: 0, latitude: 0 },
      width: EARTH_CIRCUMFERENCE / 2
    };
    const coord1 = svgPointToCoordinate(new Vector2(256, 256), svgMeta, convertOptions);
    expect(coord1).to.deep.equal([0, 0]);
    const coord2 = svgPointToCoordinate(new Vector2(512, 256), svgMeta, convertOptions);
    expect(coord2).to.deep.equal([90, 0]);
  });

  it('should position the point relative to options.center', () => {
    const convertOptions:ConvertSVGOptions = {
      center: { longitude: 15, latitude: 15 },
      width: EARTH_CIRCUMFERENCE,
      subdivideThreshold: 10
    };
    const coord1 = svgPointToCoordinate(new Vector2(256, 256), svgMeta, convertOptions);
    expect(coord1).to.roughly.deep.equal([15, 15]);
  });

  // TODO: Fill out this test case
  it('should return a point transformed by an SVG transform', () => {})

});
