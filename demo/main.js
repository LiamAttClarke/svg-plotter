const mapbox = require('mapbox-gl');
const bbox = require('@turf/bbox').default;
const FileSaver = require('file-saver');
const svgeo = require('../dist/svgeo');

const svgPreviewImage = document.getElementById('svgPreviewImage');
const convertForm = document.getElementById('convertForm');
const svgFileInput = document.getElementById('svgFileInput');
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
map.on('load', function() {
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

svgFileInput.addEventListener('change', function(event) {
  if (event.target.files.length) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      svgInput = event.target.result;
      svgPreviewImage.src = 'data:image/svg+xml;base64,' + btoa(event.target.result);
    };
    fileReader.readAsText(event.target.files[0]);
  }
});

convertForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const formData = new FormData(convertForm);
  console.log(parseFloat(formData.get('bearing')))
  svgeo.convertSVG(svgInput, {
    center: {
      latitude: parseFloat(formData.get('centerLatitude')),
      longitude: parseFloat(formData.get('centerLongitude'))
    },
    width: parseFloat(formData.get('width')),
    bearing: parseFloat(formData.get('bearing')),
    subdivideThreshold: parseFloat(formData.get('subdivideThreshold'))
  }).then(geojson => {
    geojsonOutput = geojson;
    downloadButton.removeAttribute('disabled');
    map.getSource('svg').setData(geojson);
    map.fitBounds(bbox(geojson), { padding: 100 });
  }).catch(errors => {
    alert('Failed to convert SVG. See logs for more detail. Sorry :(');
    console.error(errors);
  });
});

downloadButton.addEventListener('click', function() {
  if (geojsonOutput) {
    const formData = new FormData(convertForm);
    const blob = new Blob([JSON.stringify(geojsonOutput, null, 2)], { type: 'application/json' });
    const fileName = formData.get('svgFile').name.replace('.svg', '.geojson');
    FileSaver.saveAs(blob, fileName);
  }
});