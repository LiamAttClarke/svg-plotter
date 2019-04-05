var mapbox = require('mapbox-gl');
var bbox = require('@turf/bbox').default;
var FileSaver = require('file-saver');
var svgeo = require('../dist/svgeo');

var svgPreviewImage = document.getElementById('svgPreviewImage');
var convertForm = document.getElementById('convertForm');
var svgFileInput = document.getElementById('svgFileInput');
var downloadButton = document.getElementById('downloadButton');

var svgInput = null;
var geojsonOutput = null;

// Setup map preview
mapbox.accessToken = 'pk.eyJ1IjoibGlhbWF0dGNsYXJrZSIsImEiOiJjaXEzN2VidjUwMGFybmptNHVtNHB3cGptIn0.ZSHWqW1AMlyE3A6FlqA0ww';
var map = new mapbox.Map({
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
    var fileReader = new FileReader();
    fileReader.onload = function(event) {
      svgInput = event.target.result;
      svgPreviewImage.src = 'data:image/svg+xml;base64,' + btoa(event.target.result);
    };
    fileReader.readAsText(event.target.files[0]);
  }
});

convertForm.addEventListener('submit', function(event) {
  event.preventDefault();
  var formData = new FormData(convertForm);
  svgeo.convertSVG(svgInput, {
    center: {
      latitude: parseFloat(formData.get('centerLatitude')),
      longitude: parseFloat(formData.get('centerLongitude'))
    },
    width: parseFloat(formData.get('width')),
    subdivideThreshold: parseFloat(formData.get('subdivideThreshold'))
  }).then(geojson => {
    geojsonOutput = geojson;
    downloadButton.removeAttribute('disabled');
    map.getSource('svg').setData(geojson);
    map.fitBounds(bbox(geojson), { padding: 100 });
  }).catch(errors => {
    console.warn(errors);
  });
});

downloadButton.addEventListener('click', function() {
  if (geojsonOutput) {
    var blob = new Blob([JSON.stringify(geojsonOutput, null, 2)], { type: 'application/json' });
    FileSaver.saveAs(blob, 'test.geojson');
  }
});