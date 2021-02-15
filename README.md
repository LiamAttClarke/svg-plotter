# svg-plotter
Convert SVG files to GeoJSON

## Usage

svg-plotter can be used in both NodeJS and the browser.

Install using npm:

```
npm install svg-plotter
```

## CLI Usage

### Install globally:
```
npm install -g svg-plotter
```

### Example usage
```
svg-plotter ./path/to/input.svg
```

### Print available options
```
svg-plotter --help
```

## TODO
- Polish demo site
- Convert cli to typescript
- Update README
- Add support for composite paths (convert to multi-polygons)
- Add support for percentage units
- Add warning messages to convertSVG output and demo page
- Add missing unit tests
- Contribute missing @types typings
- Publish to NPM registry
