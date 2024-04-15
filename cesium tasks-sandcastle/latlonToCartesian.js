// // Assuming proj4 is loaded on the page
// const UTM_PROJECTION = "+proj=utm +zone=55 +south +ellps=GRS80 +datum=GDA94 +units=m +no_defs";
// const CARTESIAN_PROJECTION = "+proj=geocent +ellps=GRS80 +datum=GDA94";

// function fromUTMToCartesian(easting, northing, elevation) {
//     const [x, y, z] = proj4(UTM_PROJECTION, CARTESIAN_PROJECTION, [easting, northing, elevation]);
    

//     return { x, y, z };
// }

// // Fetch the JSON data from the file
// fetch('extracted_data.json')
//     .then(response => response.json())
//     .then(jsonData => {
//         // Convert UTM to Cartesian coordinates
//         const cartesianData = jsonData.map(pointsArray => {
//             return pointsArray.map(point => {
//                 return fromUTMToCartesian(parseFloat(point.Easting), parseFloat(point.Northing), parseFloat(point.Elevation));
//             });
//         });

//         // Transform Cartesian coordinates into the array of arrays of arrays format
//         const arrayOfArraysOfArrays = cartesianData.map(pointsArray => {
//             return pointsArray.map(point => [point.x, point.y, point.z]);
//             // return pointsArray.map(point => [point.x+3940200, point.y-2528000, point.z+4317200]);
//         });
// console.log(arrayOfArraysOfArrays.length);
//         // Convert the transformed data to blob
//         const blob = new Blob([JSON.stringify(arrayOfArraysOfArrays, null, 2)], {type : 'application/json'});

//         // Create a download link
//         const link = document.createElement("a");
//         link.href = URL.createObjectURL(blob);
//         link.download = "new_transformed_coordinates.json";
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     })
//     .catch(error => console.error("Error fetching and processing the JSON file:", error));
// Assuming Cesium and proj4 are loaded on the page

// // Assuming Cesium and proj4 are loaded on the page
// const UTM_PROJECTION = "+proj=utm +zone=55 +south +ellps=GRS80 +datum=GDA94 +units=m +no_defs";

// function fromUTMToCesiumCartesian3(easting, northing, elevation) {
//     // Convert UTM to Longitude/Latitude
//     const [longitude, latitude] = proj4(UTM_PROJECTION).inverse([easting, northing]);
    
//     // Convert Longitude/Latitude to Cesium's Cartesian3
//     const point = Cesium.Cartesian3.fromDegrees(longitude, latitude, elevation);
//     return point;
// }
// const OFFSET_X = 3940200;
// const OFFSET_Y = -2528000;
// const OFFSET_Z = 4317200;

// // Fetch the JSON data from the file
// fetch('filteredData.json')
//     .then(response => response.json())
//     .then(jsonData => {
//         // Convert UTM to Cesium's Cartesian3
//         const cartesianData = jsonData.map(pointsArray => {
//             return pointsArray.map(point => {
//                 const cesiumCartesian = fromUTMToCesiumCartesian3(parseFloat(point.Easting), parseFloat(point.Northing), parseFloat(point.Elevation));
//                 return {
//                     x: cesiumCartesian.x + OFFSET_X,
//                     y: cesiumCartesian.y + OFFSET_Y,
//                     z: cesiumCartesian.z + OFFSET_Z
//                 };
//             });
//         });

//         // Transform Cartesian3 coordinates into the array of arrays of arrays format
//         const arrayOfArraysOfArrays = cartesianData.map(pointsArray => {
//             return pointsArray.map(point => [point.x, point.y, point.z]);
//             // If you need to offset the points you can uncomment the line below
//             // return pointsArray.map(point => [point.x+3940200, point.y-2528000, point.z+4317200]);
//         });
//         console.log(arrayOfArraysOfArrays.length);

//         // Convert the transformed data to blob
//         const blob = new Blob([JSON.stringify(arrayOfArraysOfArrays, null, 2)], {type : 'application/json'});

//         // Create a download link
//         const link = document.createElement("a");
//         link.href = URL.createObjectURL(blob);
//         link.download = "filtered_transformed_coordinates.json";
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     })
//     .catch(error => console.error("Error fetching and processing the JSON file:", error));
const fileNames = [
'119159-48372.json',
'119163-48372.json',
'119163-48373.json',
'119163-48374.json',
'119164-48371.json',
'119164-48372.json',
'119164-48373.json',
'119164-48374.json',
'119164-48375.json',
'119164-48376.json',
'119164-48377.json',
'119164-48378.json',
'119165-48371.json',
'119165-48372.json'
];
const centerTiles = []; // Array to store center tile data

function processCatenaryData(catenaries, center) {
    function toCartesian(longitude, latitude, elevation) {
        return Cesium.Cartesian3.fromDegrees(longitude, latitude, elevation);
    }

    function localizeCoordinates(point, center) {
        // Subtract the center from the point
    let localizedPoint = Cesium.Cartesian3.subtract(point, center, new Cesium.Cartesian3());

    // Create a Cartesian3 object for the offset
    let offset = new Cesium.Cartesian3(0, 0, 0);

    // Add the offset to the localized point
    return Cesium.Cartesian3.add(localizedPoint, offset, new Cesium.Cartesian3());
    }

    const centerCartesian = toCartesian(center.longitude, center.latitude, 0);
    // const rotatedCenter = rotateCoordinates(centerCartesian);

    return catenaries.map(line => 
        line.map(point => {
            let cartesian = toCartesian(point.Longitude, point.Latitude, point.Elevation);
            // let rotated = rotateCoordinates(cartesian);
            // let localized = localizeCoordinates(rotated, rotatedCenter);
            let localized = localizeCoordinates(cartesian, centerCartesian);
            return [localized.x, localized.y, localized.z]; // Return an array of the coordinates
        })
    );
}


// Updated to accept a fileName parameter
function downloadAsJSON(processedData, fileName) {
    const blob = new Blob([JSON.stringify(processedData, null, 2)], {type: 'application/json'});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// Function to extract and store center tile data
function extractAndStoreCenterTile(fileName, jsonData) {
    const centerTile = {
      fileName,
      center: jsonData.center,
    };
    centerTiles.push(centerTile);
    return centerTiles
  }
// Process each file
fileNames.forEach(fileName => {
    fetch(`data/${fileName}`)
        .then(response => response.json())
        .then(jsonData => {
            const processedData = processCatenaryData(jsonData.catenaries, jsonData.center);
            downloadAsJSON(processedData, fileName); 
            // Add a delay before downloading the centerTiles.json file
setTimeout(() => {
    const centerData = extractAndStoreCenterTile(fileName,jsonData)
            if (centerTiles.length === fileNames.length) {
                // Save the centerTiles array as a separate JSON file
                downloadAsJSON(centerData, 'centerTiles.json');
              }
  }, 1000); // Delay in milliseconds// Updated to pass fileName
           
            
        })
        .catch(error => console.error(`Error fetching and processing the file ${fileName}:`, error));
});


// Helper function to check if all files are processed
function checkAllFilesProcessed() {
    if (centerTiles.length === fileNames.length) {
      // Save the centerTiles array as a separate JSON file
      downloadAsJSON(centerTiles, 'centerTiles.json');
    }
  }
  
// // Process each file
// fileNames.forEach((fileName) => {
//     fetch(`data/${fileName}`)
//       .then((response) => response.json())
//       .then((jsonData) => {
//         const processedData = processCatenaryData(jsonData.catenaries, jsonData.center);
//         downloadAsJSON(processedData, fileName); // Updated to pass fileName
  
//         // Extract and store center tile data
//         extractAndStoreCenterTile(fileName, jsonData);
  
//         // Check if all files have been processed
//         checkAllFilesProcessed();
//       })
//       .catch((error) =>
//         console.error(`Error fetching and processing the file ${fileName}:`, error)
//       );
//   });
// // Function to download the processed data as a JSON file
// function downloadAsJSON(processedData) {
//     const blob = new Blob([JSON.stringify(processedData, null, 2)], {type: 'application/json'});
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "119169-48376.json";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }
// // Fetch the JSON data from the file and process it
// fetch('119169-48376.json')
//     .then(response => response.json())
//     .then(jsonData => {
//         console.log(jsonData);
    
//               const processedData = processCatenaryData(jsonData.catenaries, jsonData.center);
//               downloadAsJSON(processedData); // Make sure this function is defined
//         //   });
//     })
//     .catch(error => console.error("Error fetching and processing the JSON file:", error));


