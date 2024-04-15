 // URL of your JSON data
 var dataUrl = 'longlat_coordinates.json'; // Change this to your file's URL

 // Function to calculate tile coordinates using Cesium's WebMercatorTilingScheme
 function getTileCoordinates(latitude, longitude, level) {
     var tilingScheme = new Cesium.WebMercatorTilingScheme();
     var cartographicPosition = Cesium.Cartographic.fromDegrees(longitude, latitude);
     var tileCoordinates = tilingScheme.positionToTileXY(cartographicPosition, level);
     return [tileCoordinates.x, tileCoordinates.y, level]; // Return as an array
 }

 // Fetch the data, process it, and download the result
 function fetchProcessAndDownload() {
     fetch(dataUrl)
         .then(response => response.json())
         .then(jsonData => {
             // Process each point to add tile coordinates
             const processedData = jsonData.map(pointsArray => {
                 return pointsArray.map(point => {
                     const tile = getTileCoordinates(point.Latitude, point.Longitude, 12); // for example, level 12
                     return {
                         ...point,
                         Tile: tile
                     };
                 });
             });

             // Log the processed data to the console
             console.log(processedData);

             // Here, you would do something with the processed data,
             // like sending it to a server, downloading it, etc.
             // The following lines are an example of how you might trigger a download of the data as a JSON file.

             // Create a blob from the JSON string
             var blob = new Blob([JSON.stringify(processedData, null, 2)], {type: "application/json"});

             // Create a link element, hide it, direct it towards the blob, and then 'click' it programmatically
             var a = document.createElement("a");
             a.style = "display: none";
             document.body.appendChild(a);
             // Create a URL for the blob
             var url = window.URL.createObjectURL(blob);
             a.href = url;
             a.download = 'processed-data.json';
             a.click();
             // Release the URL
             window.URL.revokeObjectURL(url);
         })
         .catch(error => console.error('Error fetching data:', error));
 }

 // Automatically execute the function when the page loads
 window.onload = fetchProcessAndDownload;