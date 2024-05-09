const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: await Cesium.createWorldTerrainAsync()
});
viewer.extend(Cesium.viewerCesiumInspectorMixin);
viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(147.293701171875, -42.857666015625, 1000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45), // looking down
    roll: 0.0
  }
});


const voltageColorMapping = {
  "LV ABC": "#000100",
  "Service": "#800000",
  "22kV": "#000002",
  "12.7kVSWER": "#000008",
  "415V": "#001000",
  "33kV": "#002000",
  "Stay": "#400000",
  "0V": "#000080",
  "110kV": "#000040",
  "240V": "#008000",
  "220kV": "#000004",
  "44kV": "#000800",
  "22kVABC": "#000001",
  "11kV": "#000020",
  "6.6kV": "#000400",
  "11kVABC": "#000010",
  "88kV": "#000200",
  "2.2kV": "#004000"
};
// Convert to conditions array for Cesium3DTileStyle
const colorConditions = Object.entries(voltageColorMapping).map(([voltage, color]) => {
  return [`\${Voltage} === '${voltage}'`, `color('${color}')`];
});
colorConditions.push(['true', "color('#FFFFFF')"]); // Default color if no conditions met

const zoomLevel = 18;
function getTilesToRender() {
  const tiles = viewer.scene.globe._surface._tilesToRender;
  return tiles;
}

function generateTileId(x, y, zoomLevel) {
  return `${zoomLevel}-${x}-${y}`;
}

function computeTileAtZoomLevel(tile) {
  if (!tile) return null;
  if (tile._level === zoomLevel) return tile; // If the tile is already at zoomLevel, return it

  let levelsToTraverse = tile._level - zoomLevel;
  while (tile && levelsToTraverse > 0) {
    tile = tile._parent;
    levelsToTraverse--;
  }

  return tile;
}


const loadedTilesets = new Map();

async function loadTileset(tile) {
  const tileId = generateTileId(tile._x, tile._y, tile._level);
  if (!tile) return;
  if (loadedTilesets.has(tileId)) {
    console.log(`Tileset ${tileId} is already loaded.`);
    return; // Tileset is already loaded
  }
  if (tile._level > 17) {
    try {
      const url = `http://localhost:3000/getTilesets/poles/${zoomLevel}/${tile._x}/${tile._y}.json`;
      const centerPoint = getCenterPointByTiles(tile._x, tile._y, zoomLevel);
      const modelMatrix = await getTransformMatrix(centerPoint);
      console.log("🚀 ~ loadTileset ~ modelMatrix:", modelMatrix)
      const tileset = await Cesium.Cesium3DTileset.fromUrl(url);

      tileset.modelMatrix = modelMatrix; // Reset model matrix
      
    

      viewer.scene.primitives.add(tileset);
      loadedTilesets.set(tileId, tileset);


      tileset.tileLoad.addEventListener(function (tile) {
        console.log(`Tile loaded: ${tile}`);
      });


      console.log(`Loaded and added to map: ${tileId}`);
    } catch (error) {
      console.error(`Error loading tileset: ${error}`);
    }
  }
}
function unloadTilesets() {
  console.log(`Attempting to unload, current map size: ${loadedTilesets.size}`);
  loadedTilesets.forEach((tileset, tileId) => {
    const success = viewer.scene.primitives.remove(tileset);
    if (success) {
      console.log(`Successfully unloaded tileset: ${tileId}`);
      loadedTilesets.delete(tileId);
    } else {
      console.log(`Failed to unload tileset: ${tileId}`);
    }
  });
}

async function onCameraChange() {
  const tiles = getTilesToRender();
  // If the camera is zoomed out to a level below 18, don't add any polylines
  const currentCameraLevel = tiles[0]?._level;

  // console.log(tiles)
  if (!tiles || tiles.length === 0) {
    console.log('No tiles to render.');
    return;
  }
  if (currentCameraLevel < 18) {
    console.log("unloading");
    unloadTilesets();
  } else {
    const tilesAtZoomLevel = tiles.map(tile => {
      return computeTileAtZoomLevel(tile);
    });

    tilesAtZoomLevel.forEach(tile => {
       loadTileset(tile);
       console.log("line130");
    });
  }
  console.log('loadTileset  loadedTilesets:', loadedTilesets);
}
viewer.camera.moveEnd.addEventListener(onCameraChange);

export const getCenterPointByTiles = (x, y, level) => {
  const tilingScheme = new Cesium.GeographicTilingScheme();
  const rectangle = tilingScheme.tileXYToRectangle(x, y, level);
  const centerPoint = Cesium.Rectangle.center(rectangle);
  return centerPoint;
};



async function getTransformMatrix(centerPoint) {
  // Convert the geographic coordinates (longitude, latitude, height) directly to a Cartesian3 position
  const position = Cesium.Cartesian3.fromRadians(centerPoint.longitude, centerPoint.latitude, centerPoint.height);

  // Create a translation matrix from the position
  const modelMatrix = Cesium.Matrix4.fromTranslation(position);

  // Convert modelMatrix to array
  const modelMatrixPositionArray = new Cesium.Matrix4.toArray(modelMatrix);

  return modelMatrixPositionArray;
}



// try {
//   const tileset = await Cesium.Cesium3DTileset.fromUrl('http://localhost:3000/getTilesets/poles/18/472775/190800.json');
//   // const tileset = await Cesium.Cesium3DTileset.fromUrl('http://127.0.0.1:5500/src/lib/createGltf/all_poles3new.json');
//   tileset.debugShowBoundingVolume = true;
//   tileset.debugShowContentBoundingVolume = true;
//   const center = getCenterPointByTiles(472761, 190794, 18);
//   const modelMatrix = await getTransformMatrix(center);
  
//   tileset.modelMatrix = modelMatrix;
//   console.log("🚀 ~ tileset:", tileset)

//   viewer.scene.primitives.add(tileset);
//   // // const axes = new Cesium.DebugModelMatrixPrimitive({
//   // //   modelMatrix: Cesium.Matrix4.fromArray(modelMatrix), // use the matrix you want to test
//   // //   length: 100.0,
//   // //   width: 2.0
//   // // });
//   // // viewer.scene.primitives.add(axes);
//   // const point1 = Cesium.Cartesian3.fromDegrees(144.61868540576725, -41.008482793412135, 6.801814204179589);
//   // const point2 = Cesium.Cartesian3.fromDegrees(144.61868429514539, -41.00848126843706, 14.266444676203603);

//   // const lineEntity = viewer.entities.add({
//   //   polyline: {
//   //     positions: [point1, point2],
//   //     width: 5,
//   //     material: new Cesium.ColorMaterialProperty(Cesium.Color.RED)
//   //   },
//   //   label: {
//   //     text: 'Sample Point',
//   //     font: '14pt monospace',
//   //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//   //     outlineWidth: 2,
//   //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//   //     pixelOffset: new Cesium.Cartesian2(0, -9)
//   //   }
//   // });

//   viewer.zoomTo(tileset);
// } catch (error) {
//   console.error(`Error creating tileset: ${error}`);
// } 

