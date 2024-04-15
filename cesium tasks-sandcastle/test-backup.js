const viewer = new Cesium.Viewer("cesiumContainer",{
  terrain: Cesium.Terrain.fromWorldTerrain(), camera: {
  destination: Cesium.Cartesian3.fromDegrees(147.3272, -42.8819, 10000), // longitude, latitude, height
}});
viewer.extend(Cesium.viewerCesiumInspectorMixin);

// Define the UTM zone (replace with your UTM zone)
const utmProjection = "+proj=utm +zone=55 +south +ellps=GRS80 +datum=GDA94 +units=m +no_defs";
const fetchedTiles = new Set();
let allEntities = [];
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(147.3272, -42.8819, 100000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45), // looking down
    roll: 0.0,
  },
});

async function fetchDataForTile(tile) {
  console.log("fetchData");
  const url = `${tile.level}/${tile.x}-${tile.y}.json`; // construct the URL for your JSON data
  
  try {
    const response = await fetch(url);

    if (!response.ok) { // if the response status is not 2xx, it enters this condition
      if (response.status === 404) {
        console.log(`No data available for tile: ${tile.x}-${tile.y}`);
      } else {
        console.error(`Failed to fetch data for tile: ${tile.x}-${tile.y} - Status: ${response.status}`);
      }
      return;
    }

    const data = await response.json();
    processData(data);
  } catch (error) {
    console.error("Error fetching or processing the JSON data:", error);
  }
}

// Moved data processing to its own function since it's now used in multiple places
function processData(data) {
  // console.log(data);
  // Process each set of points in the data
  data.forEach((pointsSet) => {
    // Convert UTM to Longitude/Latitude and then to Cartesian3
    const positions = pointsSet.map((item) => {
              const elevation = parseFloat(item.Elevation);
              const easting = parseFloat(item.Easting)
              const northing = parseFloat(item.Northing)

      const [longitude, latitude] = proj4(utmProjection).inverse([
        easting,
        northing
      ]);
      const point= Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        elevation
      );
      // const cartographic = Cesium.Cartographic.fromCartesian(point);
      // console.log(cartographic);
      return point
    });

    // Create a CatmullRomSpline using the positions
    const spline = new Cesium.CatmullRomSpline({
      times: [...Array(positions.length).keys()],
      points: positions,
    });

    // Sample the spline at various intervals to get positions along the curve
    const sampledPositions = [];
    for (let i = 0; i <= positions.length - 1; i += 0.1) {
      sampledPositions.push(spline.evaluate(i));
    }

    // Add the sampled positions as a polyline in Cesium
    const entity = viewer.entities.add({
      polyline: {
        positions: sampledPositions,
        width: 2,
        material: Cesium.Color.RED,
      },
    });
    allEntities.push(entity);
  });
}


function updateCatenariesVisibility() {
  var currentZoomLevel = calculateZoomLevel(viewer);

  allEntities.forEach((entity) => {
      entity.show = currentZoomLevel >= 14;
  });

  console.log("Catenaries visibility updated. Current Zoom Level:", currentZoomLevel);
}



function calculateZoomLevel(viewer) {
  var scene = viewer.scene;
  var ellipsoid = scene.globe.ellipsoid;
  var cameraHeight = ellipsoid.cartesianToCartographic(scene.camera.position).height;
  var maxCameraHeight = ellipsoid.maximumRadius * Math.PI; // Approximation
  var zoomLevel = Math.round(Math.log(maxCameraHeight / cameraHeight) / Math.log(2));
  return zoomLevel;
}

function getVisibleTiles(viewer, zoomLevel) {
  var viewRectangle = viewer.camera.computeViewRectangle();
  // console.log("View Rectangle:", viewRectangle); // Log the view rectangle for debugging

  var tilingScheme = new Cesium.WebMercatorTilingScheme();

  // Ensure that the view rectangle is valid. If not, it might be because the camera is looking at the sky or space.
  if (!viewRectangle) {
      console.warn("The camera view does not intersect with the Earth's surface.");
      return [];
  }

  var nwTile = tilingScheme.positionToTileXY(Cesium.Rectangle.northwest(viewRectangle), zoomLevel);
  var seTile = tilingScheme.positionToTileXY(Cesium.Rectangle.southeast(viewRectangle), zoomLevel);

  // console.log("NW Tile:", nwTile, "SE Tile:", seTile); // Check the NW and SE tiles

  var tiles = [];
  if (nwTile && seTile) { // Check if nwTile and seTile are valid
      for (var x = nwTile.x; x <= seTile.x; x++) {
          for (var y = seTile.y; y <= nwTile.y; y++) { // Note: tile Y coordinates are inverted
              tiles.push({
                  x: x,
                  y: y,
                  level: zoomLevel
              });
          }
      }
  } else {
      console.warn("NW Tile or SE Tile is not calculated, possibly due to the camera's position.");
  }
  return tiles;
}

viewer.camera.changed.addEventListener(async function() {
  var zoomLevel = calculateZoomLevel(viewer);
  // console.log("Current Zoom Level:", zoomLevel); // Log the current zoom level for debugging

  updateCatenariesVisibility();

  if (zoomLevel >= 14) {
      var visibleTiles = getVisibleTiles(viewer, zoomLevel);
      // console.log("Visible Tiles:", visibleTiles); // Log the visible tiles for debugging

      for (const tile of visibleTiles) {
          // Check if this tile has already been fetched, if not, fetch it
          if (!fetchedTiles.has(`${tile.x}-${tile.y}`)) {
              fetchedTiles.add(`${tile.x}-${tile.y}`); // mark this tile as fetched
              await fetchDataForTile(tile); // fetch and process the data for this tile
          }
      }
  }
})
