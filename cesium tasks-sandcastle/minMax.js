// Function to fetch data from a server
async function fetchData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }
  
  // Function to find the min and max latitudes and longitudes and convert them to radians
  function findMinMaxLatLon(data) {
    let minLat = data[0][0].Latitude;
    let maxLat = data[0][0].Latitude;
    let minLon = data[0][0].Longitude;
    let maxLon = data[0][0].Longitude;
  
    data.forEach(sublist => {
      sublist.forEach(point => {
        minLat = Math.min(minLat, point.Latitude);
        maxLat = Math.max(maxLat, point.Latitude);
        minLon = Math.min(minLon, point.Longitude);
        maxLon = Math.max(maxLon, point.Longitude);
      });
    });
  
    // Convert degrees to radians
    const minLatRad = minLat * (Math.PI / 180);
    const maxLatRad = maxLat * (Math.PI / 180);
    const minLonRad = minLon * (Math.PI / 180);
    const maxLonRad = maxLon * (Math.PI / 180);
  
    return { minLatRad, maxLatRad, minLonRad, maxLonRad };
  }
  
  // URL of your JSON file
  const dataUrl = 'filteredData.json';
  
  // Fetch, process the data and find min/max
  fetchData(dataUrl).then(data => {
    if (data) {
      const { minLatRad, maxLatRad, minLonRad, maxLonRad } = findMinMaxLatLon(data);
      console.log(`Min Latitude in radians: ${minLatRad}, Max Latitude in radians: ${maxLatRad}`);
      console.log(`Min Longitude in radians: ${minLonRad}, Max Longitude in radians: ${maxLonRad}`);
    }
  });
  