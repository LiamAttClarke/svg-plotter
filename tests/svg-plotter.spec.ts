import 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { parseSync as parseSVG } from 'svgson';
import * as GeoJSONValidation from 'geojson-validation';
import { getSVGMetadata, convertSVG } from '../src/index';

const SVG_SHAPES = fs.readFileSync(path.join(__dirname, 'files/shapes.svg'), 'utf8');
const SVG_NO_DIMENSIONS = fs.readFileSync(path.join(__dirname, 'files/no-dimensions.svg'), 'utf8');
const SVG_PATTERN = fs.readFileSync(path.join(__dirname, 'files/pattern.svg'), 'utf8');
const SVG_VIEWBOX = fs.readFileSync(path.join(__dirname, 'files/viewbox.svg'), 'utf8');

describe('svg-plotter', () => {

  describe('getSVGMetadata', () => {

    it('should parse svg dimensions given width, height, x, y attributes', () => {
      const parsedSVG = parseSVG(SVG_SHAPES, { camelcase: true });
      const meta = getSVGMetadata(parsedSVG);
      expect(meta).to.deep.equal({
        x: 0,
        y: 0,
        width: 100,
        height: 250,
      });
    });

    it('should parse svg dimensions given a viewBox attribute', () => {
      const parsedSVG = parseSVG(SVG_VIEWBOX, { camelcase: true });
      const meta = getSVGMetadata(parsedSVG);
      expect(meta).to.deep.equal({
        x: 128,
        y: 128,
        width: 128,
        height: 128,
      });
    });

  });

  describe('convertSVG', () => {

    it('should convert an SVG string to valid GeoJSON', async () => {
      const { geojson, errors } = await convertSVG(SVG_SHAPES);
      expect(errors).to.be.empty;
      expect(GeoJSONValidation.valid(geojson, true)).to.be.empty;
    });

    it('should set feature id based on options.idMapper', async () => {
      const { geojson, errors } = await convertSVG(SVG_SHAPES, {
        idMapper: input => input.attributes.id
      });
      expect(errors).to.be.empty;
      const expectedIds = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
      geojson.features.forEach((f, i) => {
        expect(f.id).to.equal(expectedIds[i]);
      });
    });

    it('should set feature properties based on options.propertyMapper', async () => {
      const { geojson, errors } = await convertSVG(SVG_SHAPES, {
        propertyMapper: input => ({ svgType: input.name })
      });
      expect(errors).to.be.empty;
      const expectedSVGType = ['rect', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'];
      geojson.features.forEach((f, i) => {
        expect(f.properties).to.not.be.null;
        if (f.properties) {
          expect(f.properties.svgType).to.equal(expectedSVGType[i]);
        }
      });
    });

    it('should throw error if SVG does not have a width or height attribute', () => {
      try {
        convertSVG(SVG_NO_DIMENSIONS);
        throw new Error('Error was not thrown for missing SVG width/height/viewBox attributes.');
      } catch ({ message }) {
        expect(message).to.equal('SVG must have a viewBox or width/height attributes.');
      }
    });

    it('should return a list of errors that include all skipped geometry.', () => {
      const { errors } = convertSVG(SVG_PATTERN);
      expect(errors).to.include('Skipping unsupported node: pattern');
    });

  });

});
