# svg-plotter
Convert SVG files to GeoJSON

[Online Utility](/demo)

[API Documentation](/docs)

## Usage

svg-plotter can be used in both NodeJS and the browser.

Install using npm:

```
npm install svg-plotter
```

#### Example:
```javascript
const { convertSVG } = require('svg-plotter');

const svg = `
    <svg height="512" width="512" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <line x1="128" y1="128" x2="384" y2="384" stroke="black" />
    </svg>
`;

const { geojson, errors } = convertSVG(svg);
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
