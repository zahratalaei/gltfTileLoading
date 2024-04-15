// const west = 2.570539198473151;
// const south = -0.7483217188850815;
// const east = 2.5709604048782797;
// const north = -0.7478858047576911;
// const minimumHeight = 20;
// const maximumHeight = 70;

// const centerLongitude = (west + east) / 2;
// const centerLatitude = (south + north) / 2;
// const centerHeight = (minimumHeight + maximumHeight) / 2;

// // Convert radians to degrees for longitude and latitude
// const centerLongitudeDegrees = Cesium.Math.toDegrees(centerLongitude);
// const centerLatitudeDegrees = Cesium.Math.toDegrees(centerLatitude);

// // Convert position to Cartesian3 coordinates
// var centerPosition = Cesium.Cartesian3.fromDegrees(centerLongitudeDegrees, centerLatitudeDegrees, centerHeight);
// console.log(centerPosition);
// // Create a local east-north-up frame at the center position
// var transform = Cesium.Transforms.eastNorthUpToFixedFrame(centerPosition);

// console.log(transform);
// Assuming these are the corrected min and max latitude and longitude values for the bounding box
const viewer = new Cesium.Viewer("cesiumContainer",{
     terrainProvider: await Cesium.createWorldTerrainAsync()
 
   });
const minLongitude = 147.29095458984375;
const minLatitude =  -42.857666015625;
const maxLongitude =  147.293701171875;
const maxLatitude = -42.86041259765625;

// Calculate the center of the bounding box
const centerLongitude = (minLongitude + maxLongitude) / 2;
const centerLatitude = (minLatitude + maxLatitude) / 2;
const averageHeight = 0; // Replace with the average height of your tileset if known
const carto = Cesium.Cartographic.fromDegrees(centerLongitude, centerLatitude);
  console.log("file: transformMatrix.js:38 , carto:", carto);
  const sampledPositions = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [carto]);
  console.log("file: transformMatrix.js:35 , height:", sampledPositions[0].height);
// Convert the center position to Cesium's Cartesian3 coordinates
const centerPosition = Cesium.Cartesian3.fromDegrees(centerLongitude, centerLatitude, averageHeight);

// Create a local east-north-up frame at the center position
const transformMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(centerPosition);

// Convert the Cesium Matrix4 to a regular array
const matrixArray = Cesium.Matrix4.toArray(transformMatrix);
// Log the matrix array to the console or use it as needed
console.log('Transform Matrix Array:', matrixArray);

// The transformMatrix is a 4x4 matrix that can be directly used as the transform matrix for your tileset
// Log the matrix to the console or use it as needed
console.log('Transform Matrix:', transformMatrix);
