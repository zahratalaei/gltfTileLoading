// // Assuming proj4 is loaded on the page

// const UTM_PROJECTION = "+proj=utm +zone=55 +south +ellps=GRS80 +datum=GDA94 +units=m +no_defs";
// const CARTESIAN_PROJECTION = "+proj=geocent +ellps=GRS80 +datum=GDA94";

// function fromUTMToCartesian(easting, northing, elevation) {
//     const [x, y, z] = proj4(UTM_PROJECTION, CARTESIAN_PROJECTION, [easting, northing, elevation]);
//     return { x, y, z };
// }

// // Fetch the JSON data from the file
// fetch('extracted_data.json')
// .then(response => response.json())
// .then(jsonData => {
//     const cartesianData = jsonData.map(pointsArray => {
//         return pointsArray.map(point => {
//             const { x, y, z } = fromUTMToCartesian(parseFloat(point.Easting), parseFloat(point.Northing), parseFloat(point.Elevation));
//             return { x, y, z };
//         });
//     });

//     // Convert the converted data to blob
//     const blob = new Blob([JSON.stringify(cartesianData, null, 2)], {type : 'application/json'});

//     // Create a download link
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "converted_coordinates.json";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// })
// .catch(error => console.error("Error fetching the JSON file:", error));
// Ensure Cesium and proj4 are loaded on the page

const UTM_PROJECTION = "+proj=utm +zone=55 +south +ellps=GRS80 +datum=GDA94 +units=m +no_defs";

function fromUTMToCesiumCartesian3(easting, northing, elevation) {
    // Convert UTM to Longitude/Latitude
    const [longitude, latitude] = proj4(UTM_PROJECTION).inverse([easting, northing]);
    
    // Convert Longitude/Latitude to Cesium's Cartesian3
    const point = Cesium.Cartesian3.fromDegrees(longitude, latitude, elevation);
    return point;
}

// Fetch the JSON data from the file
fetch('filteredData.json')
.then(response => response.json())
.then(jsonData => {
    const cartesianData = jsonData.map(pointsArray => {
        return pointsArray.map(point => {
            return fromUTMToCesiumCartesian3(parseFloat(point.Easting), parseFloat(point.Northing), parseFloat(point.Elevation));
        });
    });

    // Convert the converted data to blob
    const blob = new Blob([JSON.stringify(cartesianData, null, 2)], {type : 'application/json'});

    // Create a download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "filtered_converted_coordinates.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
})
.catch(error => console.error("Error fetching the JSON file:", error));
