# SVGEO
Convert SVG files to GeoJSON

# Usage

SVGEO can be used in both NodeJS and the browser.

Install using npm:

`npm install --save svgeo`

## Example

```
const svgeo = require('svgeo');

const svgCircle = '<svg width="100" height="100"><circle cx="50" cy="50" r="25" stroke="black" /></svg>';

svgeo.convertSVG(svgCircle).then(geoJSONCircle => {

  console.log(geoJSONCircle);

}).catch(error => {

  console.error(error);

});
```

# API

## svgeo.convertSVG

`svgeo.convertSVG(svg[, options])`

Returns: `Promise<GeoJSON>`

- `svg`

  SVG string to be converted

  Type: String

- `options.center`

  Geographic coordinate to center the SVG geometry on.

  Type: `Coordinate`

  Default: `{ longitude: 0, latitude: 0 }`

- `options.scale`

  Type: `Number`

  Default: `1`

- `options.subdivideThreshold`

  Angle in degrees for when to subdivide a continous curve into discreet points. Decrease this number for smoother curves.

  Type: `Number`,

  Default: `5`

- `options.idMapper`

  Function called for each GeoJSON Feature generated to set the Feature's Id. In the case of SVG Paths, multiple GeoJSON Features may be generated.

  Type: `Function(svgObject) -> String|Number|null`

  Default: `null`

  Example:

  Setting each GeoJSON feature id to the original SVG Element id (Note: this may not be unique as multiple GeoJSON Features may be generated for a given SVG Path Element).

  ```
  {
    idMapper: svgObject => svgObject.attributes.id
  }
  ```
- `options.propertyMapper`

  Function called for each SVG Element to determine the resulting GeoJSON Feature's properties.

  Type: `Function(svgObject) -> Object|null`

  Default: `null`

  Example:

  Copying SVG Element attributes to resulting GeoJSON Feature.

  ```
  {
    propertyMapper: svgObject => svgObject.attributes
  }
  ```







