const UTM_PROJECTION = "+proj=utm +zone=55 +south +ellps=GRS80 +datum=GDA94 +units=m +no_defs";

// Define the projections


function fromUTMToLonLat(easting, northing) {
    return proj4(UTM_PROJECTION).inverse([easting, northing]);
}

// Fetch the JSON data from the file
fetch('extracted_data.json')
    .then(response => response.json())
    .then(jsonData => {
        // Convert UTM to Longitude/Latitude and add tile value
        const convertedData = jsonData.map((pointsArray, index) => {
            return pointsArray.map(point => {
                const [longitude, latitude] = fromUTMToLonLat(parseFloat(point.Easting), parseFloat(point.Northing));
            //    return fromUTMToLonLat(parseFloat(point.Easting), parseFloat(point.Northing));

                // Return the new object with Longitude and Latitude, and keep original properties
                const data = {
                    ...point,
                    Longitude: longitude,
                    Latitude: latitude,
                    
                };
                return data
            });
        });

        console.log(convertedData);

        // Convert the transformed data to blob
        const blob = new Blob([JSON.stringify(convertedData, null, 2)], {type : 'application/json'});

        // Create a download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "longlat_coordinates.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    .catch(error => console.error("Error fetching and processing the JSON file:", error));
