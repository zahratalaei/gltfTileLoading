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

// Define the projection string for UTM
const UTM_PROJECTION = "+proj=utm +zone=55 +south +ellps=GRS80 +datum=GDA94 +units=m +no_defs";

// Define the offset values
const OFFSET_X = 3940200;
const OFFSET_Y = -2528000;
const OFFSET_Z = 4317200;

// Function to convert UTM coordinates to Cesium Cartesian3 with applied offsets
function fromUTMToCesiumCartesian3WithOffset(easting, northing, elevation) {
    // Convert UTM to Longitude/Latitude
    const [longitude, latitude] = proj4(UTM_PROJECTION).inverse([easting, northing]);
    
    // Convert Longitude/Latitude to Cesium's Cartesian3
    const point = Cesium.Cartesian3.fromDegrees(longitude, latitude, elevation);
    
    // Apply the offsets
    point.x += OFFSET_X;
    point.y += OFFSET_Y;
    point.z += OFFSET_Z;

    return point;
}

// Function to process the fetched JSON data
function processJSONData(jsonData) {
    // Convert UTM to Cesium's Cartesian3 with offsets and structure the data
    const structuredData = jsonData.map(pointsArray => 
        pointsArray.map(point => {
            const cesiumCartesian = fromUTMToCesiumCartesian3WithOffset(
                parseFloat(point.Easting), 
                parseFloat(point.Northing), 
                parseFloat(point.Elevation)
            );
            return [cesiumCartesian.x, cesiumCartesian.y, cesiumCartesian.z];
        })
    );

    return structuredData;
}

// Function to download the processed data as a JSON file
function downloadAsJSON(processedData) {
    const blob = new Blob([JSON.stringify(processedData, null, 2)], {type: 'application/json'});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "filtered_transforemed_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fetch the JSON data from the file and process it
fetch('filteredData.json')
    .then(response => response.json())
    .then(jsonData => {
        const processedData = processJSONData(jsonData);
        downloadAsJSON(processedData);
    })
    .catch(error => console.error("Error fetching and processing the JSON file:", error));


