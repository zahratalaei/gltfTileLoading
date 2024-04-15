import * as Cesium from 'cesium';
import gdal from 'gdal-async';
import fs from 'fs/promises';
function testGdal(filePath) {
     try {
         const dataset = gdal.open(filePath);
         if (!dataset) {
             console.error('Failed to open the dataset.');
             return;
         }
 
         // Accessing geoTransform as a property, not a function
         const geoTransform = dataset.geoTransform;
         if (!geoTransform) {
             console.error('GeoTransform is null.');
             return;
         }
 
         console.log('GeoTransform:', geoTransform);
     } catch (error) {
         console.error('Error:', error);
     }
 }
 
 
 const filePath = '6175_2_Cumberland_Strait.tif'; // Replace with your DEM file path
 testGdal(filePath);
// // Function to convert lat, lon, and elevation to Cartesian3
// function toCartesian3(latitude, longitude, elevation) {
//     return Cesium.Cartesian3.fromDegrees(longitude, latitude, elevation);
// }

// async function getTerrainHeight(latitude, longitude) {
//      try {
//          const dataset = gdal.open('./6175_2_Cumberland_Strait.tif');
//          if (!dataset) {
//              throw new Error('Failed to open DEM file');
//          }
 
//          const band = dataset.bands.get(1);
//          if (!band) {
//              throw new Error('Failed to get band from DEM file');
//          }
 
//          const geoTransform = dataset.geoTransform;
//          console.log('GeoTransform:', geoTransform);
 
//          const x = Math.floor((longitude - geoTransform[0]) / geoTransform[1]);
//          const y = Math.floor((latitude - geoTransform[3]) / geoTransform[5]);
//          console.log(`Pixel coordinates: (${x}, ${y})`);
 
//          if (x < 0 || x >= band.xSize || y < 0 || y >= band.ySize) {
//              throw new Error('Coordinates are outside the bounds of the DEM data');
//          }
 
//          const elevation = band.pixels.read(x, y, 1, 1)[0];
//          if (elevation === null) {
//              throw new Error('Elevation data could not be read');
//          }
//          return elevation;
//      } catch (error) {
//          console.error('Error in getTerrainHeight:', error);
//          throw error;
//      }
//  }
 
// // Main function to process the data
// async function processCatenaryData(data) {
//     const catenaries = data.catenaries;
//     const center = data.center;

//     // Convert center to Cartesian3 with terrain height
//     const centerElevation = await getTerrainHeight(center.latitude, center.longitude);
//     const centerCartesian = toCartesian3(center.latitude, center.longitude, centerElevation);

//       // Process each catenary point
//       for (const catenary of catenaries) {
//           for (const point of catenary) {
//               const cartesian = toCartesian3(point.Latitude, point.Longitude, parseFloat(point.Elevation));
  
//               // Apply the global offsets
//               const transformedCartesian = Cesium.Cartesian3.subtract(cartesian, centerCartesian, new Cesium.Cartesian3());
  
//               // Update the point in the catenaries array
//               point.TransformedCartesian = {
//                   x: transformedCartesian.x,
//                   y: transformedCartesian.y,
//                   z: transformedCartesian.z
//               };
//           }
//       }

//     // Write the transformed data to a new JSON file
//     await fs.writeFile('../../output/119171-48378-cart.json', JSON.stringify(catenaries, null, 2));
// }

// // Function to read JSON data from a file
// async function readJsonFile(filePath) {
//      try {
//          const data = await fs.readFile(filePath, 'utf8');
//          return JSON.parse(data);
//      } catch (error) {
//          console.error('Error reading JSON file:', error);
//          throw error;
//      }
//  }
// // Example usage
// const filePath = '../../test/16/119171-48378.json'; // Replace with your JSON file path
// readJsonFile(filePath).then(jsonData => {
//     processCatenaryData(jsonData).then(() => {
//         console.log('Processing complete');
//     }).catch(error => {
//         console.error('Error processing data:', error);
//     });
// }).catch(error => {
//     console.error('Error reading JSON file:', error);
// });
