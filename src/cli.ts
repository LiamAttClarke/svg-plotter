import * as path from "std/path/mod.ts";
import * as flags from "std/flags/mod.ts";
import { convertSVG } from "./mod.ts";
import { ConvertSVGOptions } from "./types.ts";

// TODO: add --output option

const HELP = `
svg-plotter - Convert SVG to GeoJSON

Usage:
svg-plotter [OPTIONS] <SVG_FILE>

Options:
  --center=<LONGITUDE,LATITUDE>
    Geographic coordinate to center the SVG geometry around. (default: 0,0)

  --width=<KILOMETRES>
    Width in metres (default: 1000e3 ie. 1000km)
  
  --bearing=<DEGREES>
    Angle in degrees to rotate geometry clockwise around it's center. (default: 0)

  --subdivision-angle=<DEGREES>
    Maximum angle between two points along a curve. Curves will be adaptively subdivided into discrete points based on this threshold. Smaller values produce smoother curves. (default: 5)
`;

run();

function run() {
  const parsedArgs = flags.parse(
    Deno.args,
    {
      alias: {
        pretty: "p",
        help: "h",
      },
      boolean: ["pretty", "help"],
      string: ["center", "width", "bearing", "subdivision-angle"],
    },
  );

  if (parsedArgs.help) {
    console.info(HELP);
  } else {
    // Parse/validate arguments
    if (!parsedArgs._.length) {
      console.error("No input file specified.");
      Deno.exit(1);
    }
    const convertOptions: Partial<ConvertSVGOptions> = {};

    if (parsedArgs.center) {
      if (!parsedArgs.center.match(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)) {
        console.error("'center' must be in the form: {latitude},{longitude}");
        Deno.exit(1);
      }
      const [longitude, latitude] = parsedArgs.center.split(",").map(
        parseFloat,
      );
      convertOptions.center = { longitude, latitude };
    }

    if (parsedArgs.width) {
      const width = parseFloat(parsedArgs.width);
      if (!width || width <= 0) {
        console.error("'scale' must be greater than zero.");
        Deno.exit(1);
      }
      convertOptions.width = width;
    }

    if (parsedArgs.bearing) {
      const bearing = parseFloat(parsedArgs.bearing);
      if (!bearing || bearing <= 0) {
        console.error("'bearing' must be greater than zero.");
        Deno.exit(1);
      }
      convertOptions.bearing = bearing;
    }

    if (
      parsedArgs["subdivision-angle"]
    ) {
      const subdivisionAngle = parseFloat(parsedArgs["subdivision-angle"]);
      if (subdivisionAngle <= 0) {
        console.error("'subdivision-angle' must be greater than zero.");
        Deno.exit(1);
      }
      convertOptions.subdivideThreshold = subdivisionAngle;
    }

    const svgPath = String(parsedArgs._[0]);
    if (!Deno.statSync(String(svgPath)).isFile) {
      console.error(`'${svgPath}' is not a file.`);
      Deno.exit(1);
    }
    processSVG(svgPath, convertOptions, parsedArgs.pretty);
  }
}

function processSVG(
  svgPath: string,
  options: Partial<ConvertSVGOptions>,
  pretty: boolean,
) {
  const inputDir = path.dirname(svgPath);
  const outputFileName = path.basename(svgPath, ".svg") + ".geojson";
  const outputPath = path.join(inputDir, outputFileName);
  const svg = Deno.readTextFileSync(svgPath);
  try {
    const { geojson, errors } = convertSVG(svg, options);
    errors.forEach((e) => {
      console.warn(e);
    });
    Deno.writeTextFileSync(
      outputPath,
      JSON.stringify(geojson, null, pretty ? 2 : 0),
    );
    console.info(`Converted: ${svgPath}`);
  } catch (e) {
    console.error(e);
  }
}
