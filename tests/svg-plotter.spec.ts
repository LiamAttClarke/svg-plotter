import 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as GeoJSONValidation from 'geojson-validation';
import { convertSVG } from '../src/index';

describe('svg-plotter', () => {

  describe('convertSVG', () => {
    const svg_shapes = fs.readFileSync(path.join(__dirname, 'files/shapes.svg'), 'utf8');
    const svg_noDimensions = fs.readFileSync(path.join(__dirname, 'files/no-dimensions.svg'), 'utf8');

    it('should convert an SVG string to valid GeoJSON', async () => {
      const geoJSON = await convertSVG(svg_shapes);
      expect(GeoJSONValidation.valid(geoJSON, true)).to.be.empty;
    });

    it('should set feature id based on options.idMapper', async () => {
      const geoJSON = await convertSVG(svg_shapes, {
        idMapper: input => input.attributes.id
      });
      const expectedIds = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
      geoJSON.features.forEach((f, i) => {
        expect(f.id).to.equal(expectedIds[i]);
      });
    });

    it('should set feature properties based on options.propertyMapper', async () => {
      const geoJSON = await convertSVG(svg_shapes, {
        propertyMapper: input => ({ svgType: input.name })
      });
      const expectedSVGType = ['rect', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'];
      geoJSON.features.forEach((f, i) => {
        expect(f.properties.svgType).to.equal(expectedSVGType[i]);
      });
    });

    it('should throw error if SVG does not have a width or height attribute', () => {
      try {
        convertSVG(svg_noDimensions);
        throw new Error('Error was not thrown for missing SVG width/height/viewbox attributes.');
      } catch ({ message }) {
        expect(message).to.equal('SVG must have a viewbox or width/height attributes.');
      }
    });

  });

});