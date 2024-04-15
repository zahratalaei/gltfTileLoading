
import { latlon2mercTile, tileOuterExtent } from "../../../../mercator-transforms-master/src/index.mjs";
import {Cartesian3} from "cesium";
import * as Cesium from "cesium";

const data = [
    [
      {
        x: -3929812.986091716,
        y: 2790844.4248461397,
        z: -4163143.216796866,
      },
      {
        x: -3929815.4887321773,
        y: 2790841.1872122977,
        z: -4163142.1413248205,
      },
      {
        x: -3929818.055068156,
        y: 2790837.994813905,
        z: -4163141.133785391,
      },
      {
        x: -3929820.684923532,
        y: 2790834.847525641,
        z: -4163140.1939905705,
      },
      {
        x: -3929823.3781603356,
        y: 2790831.7452492793,
        z: -4163139.321793026,
      },
      {
        x: -3929826.134678655,
        y: 2790828.6879136288,
        z: -4163138.5170860267,
      },
      {
        x: -3929828.9544165917,
        y: 2790825.675474482,
        z: -4163137.7798033655,
      },
      {
        x: -3929831.8373502037,
        y: 2790822.707914603,
        z: -4163137.1099193366,
      },
      {
        x: -3929834.783493507,
        y: 2790819.7852436965,
        z: -4163136.5074487017,
      },
      {
        x: -3929837.7928984785,
        y: 2790816.907498432,
        z: -4163135.972446715,
      },
      {
        x: -3929840.8656550837,
        y: 2790814.0747424606,
        z: -4163135.505009144,
      },
    ], 
    [
      {
        x: -3929841.027838534,
        y: 2790814.1877530655,
        z: -4163135.591126438,
      },
      {
        x: -3929844.4487491003,
        y: 2790809.947708644,
        z: -4163134.218047879,
      },
      {
        x: -3929847.9679144137,
        y: 2790805.7774416227,
        z: -4163132.949759039,
      },
      {
        x: -3929851.585090907,
        y: 2790801.676778537,
        z: -4163131.7859997735,
      },
      {
        x: -3929855.3001144365,
        y: 2790797.6456023133,
        z: -4163130.726594648,
      },
      {
        x: -3929859.1129001393,
        y: 2790793.6838521957,
        z: -4163129.7714527845,
      },
      {
        x: -3929863.02344238,
        y: 2790789.79152368,
        z: -4163128.920567793,
      },
      {
        x: -3929867.0318147317,
        y: 2790785.968668516,
        z: -4163128.1740177646,
      },
      {
        x: -3929871.138170044,
        y: 2790782.2153947526,
        z: -4163127.5319653368,
      },
      {
        x: -3929875.342740564,
        y: 2790778.5318668205,
        z: -4163126.994657824,
      },
      {
        x: -3929879.645838126,
        y: 2790774.9183056634,
        z: -4163126.562427418,
      },
    ],
     [
      {
        x: -3929812.5475649945,
        y: 2790844.535527413,
        z: -4163142.991662944,
      },
      {
        x: -3929812.6899588,
        y: 2790844.878468089,
        z: -4163141.4622773067,
      },
      {
        x: -3929812.893559193,
        y: 2790845.264875959,
        z: -4163139.998169718,
      },
      {
        x: -3929813.156677507,
        y: 2790845.6935517844,
        z: -4163138.597539114,
      },
      {
        x: -3929813.477870139,
        y: 2790846.1634703693,
        z: -4163137.2588457987,
      },
      {
        x: -3929813.8559326055,
        y: 2790846.6737763407,
        z: -4163135.9808051004,
      },
      {
        x: -3929814.2898945883,
        y: 2790847.2237806055,
        z: -4163134.7623820906,
      },
      {
        x: -3929814.7790159285,
        y: 2790847.812957542,
        z: -4163133.6027873135,
      },
      {
        x: -3929815.3227835954,
        y: 2790848.4409428104,
        z: -4163132.5014735386,
      },
      {
        x: -3929815.9209095533,
        y: 2790849.1075318754,
        z: -4163131.458133508,
      },
      {
        x: -3929816.5733295977,
        y: 2790849.8126791418,
        z: -4163130.472698673,
      },
    ]
];

const cartesians =[
      {
        x: -3929812.986091716,
        y: 2790844.4248461397,
        z: -4163143.216796866,
      },
      {
        x: -3929815.4887321773,
        y: 2790841.1872122977,
        z: -4163142.1413248205,
      },
      {
        x: -3929818.055068156,
        y: 2790837.994813905,
        z: -4163141.133785391,
      },
      {
        x: -3929820.684923532,
        y: 2790834.847525641,
        z: -4163140.1939905705,
      },
      {
        x: -3929823.3781603356,
        y: 2790831.7452492793,
        z: -4163139.321793026,
      },
      {
        x: -3929826.134678655,
        y: 2790828.6879136288,
        z: -4163138.5170860267,
      },
      {
        x: -3929828.9544165917,
        y: 2790825.675474482,
        z: -4163137.7798033655,
      },
      {
        x: -3929831.8373502037,
        y: 2790822.707914603,
        z: -4163137.1099193366,
      },
      {
        x: -3929834.783493507,
        y: 2790819.7852436965,
        z: -4163136.5074487017,
      },
      {
        x: -3929837.7928984785,
        y: 2790816.907498432,
        z: -4163135.972446715,
      },
      {
        x: -3929840.8656550837,
        y: 2790814.0747424606,
        z: -4163135.505009144,
      },
    ]
/**
 * Calculates the center of a tile in Cartesian3 coordinates.
 *
 * @param {number} x - The x coordinate (longitude) of the tile.
 * @param {number} y - The y coordinate (latitude) of the tile.
 * @param {number} z - The z level of the tile.
 * @param {string} sourceProjection - The projection of the source coordinates.
 * @param {string} targetProjection - The projection for the target coordinates.
 * @param {string} library - The library used for the conversion, e.g., 'cesium'.
 * @returns {Object} Cartesian3 object representing the center of the tile.
 */
export function calculateTileCenterInCartesian(
  x,
  y,
  z,
  sourceProjection = "EPSG:28355",
  targetProjection = "EPSG:3857",
  library = "cesium"
) {
  // Calculate the bounds of the tile.
  const bounds = tileOuterExtent(
    { x, y, z },
    sourceProjection,
    targetProjection,
    library
  );

  // Extract the minimum and maximum corners from the bounds.
  const minCorner = bounds.latlon.extents[0];
  const maxCorner = bounds.latlon.extents[1];

  // Calculate the center by averaging the min and max corners.
  const latCenter = (minCorner[1] + maxCorner[1]) / 2;
  const lonCenter = (minCorner[0] + maxCorner[0]) / 2;

  // Convert the center to Cartesian3 coordinates using the provided library.
  const tileCenterCartesian = Cartesian3.fromDegrees(
    lonCenter,
    latCenter,
    0
  );

  return tileCenterCartesian;
}

const getCenterPointByTiles = (x, y, level) => {
  const tilingScheme = new Cesium.GeographicTilingScheme();
  const rectangle = tilingScheme.tileXYToRectangle(x, y, level);
  const centerPoint = Cesium.Rectangle.center(rectangle);
  return centerPoint;
};
const createRecenterCartesianSet = (coordinates) => {
    // use its first point to identify its belonging tile, get the center point of the tile, and do shifting origin to the center point
    const firstCartesianPoint = coordinates[0];
    // convert cartesian to cartographic degree
    const firstCartographicPoint =
        Cesium.Cartographic.fromCartesian(firstCartesianPoint);
    const firstCartographicPointDegree = {
        longitude: Cesium.Math.toDegrees(firstCartographicPoint.longitude),
        latitude: Cesium.Math.toDegrees(firstCartographicPoint.latitude),
        height: firstCartographicPoint.height,
    };
    const tile = latlon2mercTile(
        [
            firstCartographicPointDegree.longitude,
            firstCartographicPointDegree.latitude,
        ],
        18,
        "cesium"
    );
    const [x, y, level] = tile;
    const centerPointCartographic = getCenterPointByTiles(x, y, level);
    const centerPointCartesian = new Cesium.Cartesian3.fromRadians(
        centerPointCartographic.longitude,
        centerPointCartographic.latitude,
        centerPointCartographic.height
    );
    const cartesianSet = coordinates.map((coord) => {
        return [
            coord.x - centerPointCartesian.x,
            coord.y - centerPointCartesian.y,
            coord.z - centerPointCartesian.z,
        ];
    });
    return cartesianSet;
};
const getMinimumCoords = (cartesian3Array) => {
  const xArray = [];
  const yArray = [];
  const zArray = [];
  cartesian3Array.map((cartesian3) => {
    const [xCoord, yCoord, zCoord] = cartesian3;
    xArray.push(xCoord);
    yArray.push(yCoord);
    zArray.push(zCoord);
  });
  const minimumX = Math.min(...xArray);
  const minimumY = Math.min(...yArray);
  const minimumZ = Math.min(...zArray);

  return [minimumX, minimumY, minimumZ];
};
data.map(cartesians => {
    const cartesianSet =  createRecenterCartesianSet(cartesians);
    // console.log("🚀 ~ cartesianSet:", cartesianSet)
 const min = getMinimumCoords(cartesianSet);
 console.log("🚀 ~ min:", min)})
// // Example usage:
// let x = 472760;
// let y = 190794;
// const z = 18;  // z level
// const centerCartesian = calculateTileCenterInCartesian(x, y, z);
