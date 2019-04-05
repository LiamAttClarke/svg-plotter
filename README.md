# SVGEO
Convert SVG files to GeoJSON

## Usage

SVGEO can be used in both NodeJS and the browser.

Install using npm:

```
npm install --save svgeo
```

### Example

```
const svgeo = require('svgeo');

const svgCircle = '<svg width="100" height="100"><circle cx="50" cy="50" r="25" stroke="black" /></svg>';

svgeo.convertSVG(svgCircle).then(geoJSONCircle => {

  console.log(geoJSONCircle);

}).catch(error => {

  console.error(error);

});
```

## CLI Usage

```
Usage: svgeo <input> [outputPath] [options]

Options:
  -V, --version                                   output the version number
  -c, --center [center]                           Geographic coordinate to center the SVG geometry around. (default: 0,0)
  -w, --width [width]                             Width in metres (default: 1000e3 ie. 1000km)
  -t, --subdivide-threshold [subdivideThreshold]  Angle in degrees at which to subdivide curves. Decrease this number for smoother curves. (Default: 5)
  -p, --pretty                                    Pretty print output
  -v, --verbose                                   Print all logs to console
  -h, --help                                      output usage information
```

## API

### svgeo.convertSVG()

`svgeo.convertSVG(svg[, options])`

Returns: `Promise<GeoJSON>`

- `svg`

  SVG to be converted

  Type: String

- `options.center`

  Geographic coordinate to center the SVG geometry around.

  Type: `Coordinate`

  Default: `{ longitude: 0, latitude: 0 }`

- `options.width`

  The width in metres of the output geometry. SVG padding is included in the final output width.

  Type: `Number`

  Default: `1000e3`

- `options.subdivideThreshold`

  Angle in degrees at which to subdivide curves. Decrease this number for smoother curves.

  Type: `Number`,

  Default: `5`

- `options.idMapper`

  Function called for each GeoJSON Feature generated to set its Id. In the case of SVG Paths, multiple GeoJSON Features may be generated.

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

  ## TODO
  - Add rotation option (compass heading)
  - Add support for percentage units
  - Add support for nested transforms
  - Add missing unit tests
  - Create demo webpage
  - Contribute missing @types typings
  - Publish to NPM registry
