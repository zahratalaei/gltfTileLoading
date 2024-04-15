// Fetch the converted coordinates JSON data from the file
fetch('test-converted-coordinate.json')
    .then(response => response.json())
    .then(cartesianData => {
        const arrayOfArraysOfArrays = cartesianData.map(pointsArray => {
            return pointsArray.map(point => [point.x/10000, point.y/10000, point.z/10000]);
        });

        // Convert the transformed data to blob
        const blob = new Blob([JSON.stringify(arrayOfArraysOfArrays, null, 2)], {type : 'application/json'});

        // Create a download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "test_transformed_coordinates.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    .catch(error => console.error("Error fetching the converted coordinates JSON file:", error));
