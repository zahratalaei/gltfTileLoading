const viewer = new Cesium.Viewer("cesiumContainer",{
  terrain: Cesium.Terrain.fromWorldTerrain(), camera: {
  destination: Cesium.Cartesian3.fromDegrees(147.3272, -42.8819, 10000), // longitude, latitude, height
}});
viewer.extend(Cesium.viewerCesiumInspectorMixin);
const tileEntityCollections = new Map();
const currentlyVisibleTiles = new Set();

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
    processData(data,tile);
  } catch (error) {
    console.error("Error fetching or processing the JSON data:", error);
  }
}

// Moved data processing to its own function since it's now used in multiple places
function processData(data,tile) {
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

    let tileEntities = tileEntityCollections.get(`${tile.x}-${tile.y}`);
  if (!tileEntities) {
    tileEntities = new Cesium.EntityCollection();
    tileEntityCollections.set(`${tile.x}-${tile.y}`, tileEntities);
  }

    // Add the sampled positions as a polyline in Cesium
    const entity = viewer.entities.add({
      polyline: {
        positions: sampledPositions,
        width: 2,
        material: Cesium.Color.RED,
      },
    });
    tileEntities.add(entity);
    allEntities.push(entity);
  });
}

function updateCatenariesVisibility(visibleTileKeys) {
  const currentZoomLevel = calculateZoomLevel(viewer);

  // Remove EntityCollections for tiles that are no longer visible
  fetchedTiles.forEach((tileKey) => {
    if (!visibleTileKeys.has(tileKey)) {
      const entities = tileEntityCollections.get(tileKey);
      if (entities) {
        entities.values.forEach((entity) => {
          viewer.entities.remove(entity); // This removes an entity from the viewer
        });
        tileEntityCollections.delete(tileKey); // Remove the EntityCollection from the map
        fetchedTiles.delete(tileKey); // Remove the tile from the fetchedTiles set, so it can be re-fetched when it comes back into view
        console.log(`Removed entities for tile: ${tileKey}`);
      }
    }
  });

  // Log for debugging
  console.log(`Zoom Level: ${currentZoomLevel}, Visible Tiles: ${visibleTileKeys.size}`);
}


function calculateZoomLevel(viewer) {
  var scene = viewer.scene;
  var ellipsoid = scene.globe.ellipsoid;
  var cameraHeight = ellipsoid.cartesianToCartographic(scene.camera.position).height;
  var maxCameraHeight = ellipsoid.maximumRadius * Math.PI; // Approximation
  var zoomLevel = Math.round(Math.log(maxCameraHeight / cameraHeight) / Math.log(2));
  console.log("test level",viewer.scene.globe._surface.tileProvider);

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
  console.log("file: test.js:169 , viewer.camera.changed.addEventListener , zoomLevel:", zoomLevel);
  var visibleTiles = getVisibleTiles(viewer, zoomLevel);
  var visibleTileKeys = new Set(visibleTiles.map(tile => `${tile.x}-${tile.y}`));

  // Update the visibility of catenaries and remove EntityCollections for tiles that are no longer visible
  // updateCatenariesVisibility(visibleTileKeys);

  if (zoomLevel >= 14) {
    // Fetch data for tiles that are visible but haven't been fetched yet
    for (const tile of visibleTiles) {
      const tileKey = `${tile.x}-${tile.y}`;
      if (!fetchedTiles.has(tileKey)) {
        fetchedTiles.add(tileKey);
        await fetchDataForTile(tile); // fetch and process the data for this tile
      }
    }
  }
});
