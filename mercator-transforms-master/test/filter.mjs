import fs from 'fs';

// // Function to filter points by a specific tile and extract only Easting, Northing, and Elevation
// function filterAndFormatPoints(data, specificTile) {
//   let formattedData = [];

//   // Traverse each array of points
//   for (let pointsArray of data) {
//       let filteredPointsArray = pointsArray
//           .filter(point => JSON.stringify(point.Tile) === JSON.stringify(specificTile))
//           .map(({ Easting, Northing, Elevation }) => ({ Easting, Northing, Elevation }));

//       // If there are any points in the filtered array, add them to the formatted data
//       if (filteredPointsArray.length > 0) {
//           formattedData.push(filteredPointsArray);
//       }
//   }

//   return formattedData;
// }

// // Read data from a file
// fs.readFile('latlontile.json', (err, data) => {
//   if (err) throw err;

//   let jsonData = JSON.parse(data);

//   // Specify the tile you're looking for
//   const specificTile = [3724, 2588, 12];

//   // Get points that match the specific tile and format them
//   const formattedPoints = filterAndFormatPoints(jsonData, specificTile);

//   // Save the filtered and formatted data to a new file
//   fs.writeFile('filteredData.json', JSON.stringify(formattedPoints, null, 2), (err) => {
//       if (err) throw err;
//       console.log('Data written to file');
//   });
// });


// Define the specific tile you are looking for
const specificTile = [3723, 2588, 12];

// Function to check if the tile matches the specific tile
function isSpecificTile(point) {
  const { Tile } = point;
  return JSON.stringify(Tile) === JSON.stringify(specificTile);
}

// Read data from the file
fs.readFile('../test/16/119163-48372.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Parse the JSON data
  const jsonData = JSON.parse(data);

  // Filter out the arrays based on the specific tile in the first point
  const filteredData = jsonData.filter(array => array.length > 0 && isSpecificTile(array[0]));

  // Convert the result back to a JSON string
  const resultString = JSON.stringify(filteredData, null, 2);

  // Save the filtered data back to a new file
  fs.writeFile('filteredData.json', resultString, (err) => {
    if (err) {
      console.error('Error writing the file:', err);
    } else {
      console.log('Filtered data has been written to the file.');
    }
  });
});
