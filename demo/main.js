const mapbox = require('mapbox-gl');
const bbox = require('@turf/bbox').default;
const FileSaver = require('file-saver');
const { convertSVG } = require('../dist');

const svgPreviewImage = document.getElementById('svgPreviewImage');
const convertForm = document.getElementById('convertForm');
const svgFileInput = document.getElementById('svgFileInput');
const convertButton = document.getElementById('convertButton');
const downloadButton = document.getElementById('downloadButton');

let svgInput = null;
let geojsonOutput = null;

// Setup map preview
mapbox.accessToken = 'pk.eyJ1IjoibGlhbWF0dGNsYXJrZSIsImEiOiJjaXEzN2VidjUwMGFybmptNHVtNHB3cGptIn0.ZSHWqW1AMlyE3A6FlqA0ww';
const map = new mapbox.Map({
  container: 'previewMap',
  style: 'mapbox://styles/liamattclarke/cjtzbrujx4jya1fqwtdtj9ety',
  center: [-79.411079, 43.761539],
  zoom: 9
});
map.on('load', () => {
  map.addSource('svg', {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": []
    }
  });
  map.addLayer({
    "id": "svg-point",
    "source": "svg",
    "type": "symbol",
    "filter": ["==", "$type", "Point"]
  });
  map.addLayer({
    "id": "svg-line",
    "source": "svg",
    "type": "line",
    "paint": {
      "line-color": "#55acee",
      "line-width": 2
    },
    "filter": ["in", "$type", "LineString", "Polygon"]
  });
  map.addLayer({
    "id": "svg-fill",
    "source": "svg",
    "type": "fill",
    "paint": {
      "fill-color": "#55acee",
      "fill-opacity": 0.25
    },
    "filter": ["==", "$type", "Polygon"]
  });
});

svgFileInput.addEventListener('change', (event) => {
  if (event.target.files.length) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      svgInput = event.target.result;
      svgPreviewImage.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(event.target.result)));
    };
    fileReader.readAsText(event.target.files[0]);
  }
});

convertButton.addEventListener('click', (event) => {
  event.preventDefault();
  const formData = new FormData(convertForm);
  try {
    const { geojson, errors } = convertSVG(svgInput, {
      center: {
        latitude: parseFloat(formData.get('centerLatitude')),
        longitude: parseFloat(formData.get('centerLongitude'))
      },
      width: parseFloat(formData.get('width')),
      bearing: parseFloat(formData.get('bearing')),
      subdivideThreshold: parseFloat(formData.get('subdivideThreshold'))
    });
    geojsonOutput = geojson;
    errors.forEach((e) => console.warn(e));
    downloadButton.removeAttribute('disabled');
    map.getSource('svg').setData(geojsonOutput);
    map.fitBounds(bbox(geojsonOutput), {
      padding: 100,
      // Offsetting to righ to accomodate floating control panel
      offset: [100, 0]
    });
  } catch(e) {
    alert('Failed to convert SVG. See logs for more detail.');
    console.error(e);
  }
});

downloadButton.addEventListener('click', () => {
  if (geojsonOutput) {
    const formData = new FormData(convertForm);
    const blob = new Blob([JSON.stringify(geojsonOutput, null, 2)], { type: 'application/json' });
    const fileName = formData.get('svgFile').name.replace('.svg', '.geojson');
    FileSaver.saveAs(blob, fileName);
  }
});
