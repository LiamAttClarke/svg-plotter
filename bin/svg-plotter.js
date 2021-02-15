#!/usr/bin/env node

const commander = require('commander');
const fs = require('fs');
const path = require('path');
const { convertSVG } = require('../dist');

commander
  .version('0.0.0')
  .usage('<input> [outputPath] [options]')
  .option('-c, --center [center]', 'Geographic coordinate to center the SVG geometry around. (default: 0,0)')
  .option('-w, --width [width]', 'Width in metres (default: 1000e3 ie. 1000km)')
  .option('-b, --bearing [bearing]', 'Angle in degrees to rotate geometry clockwise around it\'s center. (default: 0)')
  .option('-t, --subdivide-threshold [subdivideThreshold]', 'Angle in degrees at which to subdivide curves. Decrease this number for smoother curves. (Default: 5)')
  .option('-p, --pretty', 'Pretty print output')
  .parse(process.argv);

const options = commander.opts();

// Validate arguments

if (commander.args.length < 1) {
  console.error('No input file specified.');
  process.exit(1);
}

if (!fs.statSync(commander.args[0]).isFile() || path.extname(commander.args[0]) !== '.svg') {
  console.error('Input argument must be an SVG file.');
  process.exit(1);
}

if (options.center && !options.center.match(/(\-)?\d+(\.\d+)?\(\-)?\d+(\.\d+)?/)) {
  console.error('\'center\' must be in the form: {latitude},{longitude}');
}

if (options.width) {
  const width = parseFloat(options.width);
  if (!width || width <= 0) {
    console.error('\'scale\' must be greater than zero.');
    process.exit(1);
  }
}

if (options.subdivideThreshold && parseFloat(options.subdivideThreshold) <= 0) {
  console.error('\'subdivideThreshold\' must be greater than zero.');
  process.exit(1);
}

// Process SVG

const inputPath = commander.args[0];
const inputDir = path.dirname(inputPath);
const outputFileName = path.basename(inputPath, '.svg') + '.geojson';
let outputPath;
if (commander.args.length > 1) {
  outputPath = commander.args[1];
  if (!path.extname(outputPath)) {
    outputPath = path.join(outputPath, outputFileName);
  }
} else {
  outputPath = path.join(inputDir, outputFileName);
}

const svg = fs.readFileSync(inputPath, 'utf8');
const convertOptions = {};
if (options.center) {
  convertOptions.center = options.center.split(',').map(coord => parseFloat(coord));
}
if (options.width) {
  convertOptions.width = parseFloat(options.width);
}
if (options.wbearingidth) {
  convertOptions.bearing = parseFloat(options.bearing);
}
if (options.subdivideThreshold) {
  convertOptions.subdivideThreshold = parseFloat(options.subdivideThreshold);
}
try {
  const { geojson, errors } = convertSVG(svg, convertOptions)
  errors.forEach((e) => {
    console.warn(e);
  });
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, options.pretty ? 2 : 0));
  console.info('Converted SVG to GeoJSON.');
} catch (e) {
  console.error(e);
}
