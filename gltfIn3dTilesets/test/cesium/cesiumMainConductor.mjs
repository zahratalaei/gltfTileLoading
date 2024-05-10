
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: await Cesium.createWorldTerrainAsync()
});
viewer.extend(Cesium.viewerCesiumInspectorMixin);

viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
// viewer.camera.flyTo({
//   destination: Cesium.Cartesian3.fromDegrees(147.293701171875, -42.857666015625, 1000),
//   orientation: {
//     heading: Cesium.Math.toRadians(0),
//     pitch: Cesium.Math.toRadians(-45), // looking down
//     roll: 0.0
//   }
// });


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
      const url = `http://localhost:3000/getTilesets/conductors/${zoomLevel}/${tile._x}/${tile._y}.json`;
      const centerPoint = getCenterPointByTiles(tile._x, tile._y, zoomLevel);
      const modelMatrixNew = await getTransformMatrixNew(centerPoint);

      const tileset = await Cesium.Cesium3DTileset.fromUrl(url);
      tileset.debugShowBoundingVolume = true;
        //  tileset.debugShowContentBoundingVolume = true;
      tileset.modelMatrix = modelMatrixNew; // Reset model matrix
      tileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: colorConditions
        },
        show: 'Number(${Conductor_Length}) > 30'
      });

      // tileset.customShader = customShader;
      viewer.scene.primitives.add(tileset);

      loadedTilesets.set(tileId, tileset);
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
  console.log('onCameraChange  currentCameraLevel:', currentCameraLevel);

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

async function getTransformMatrixNew(centerPoint) {
  const modelMatrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
    Cesium.Cartesian3.fromRadians(centerPoint.longitude, centerPoint.latitude, centerPoint.height), // translation
    Cesium.Quaternion.IDENTITY, // rotation
    new Cesium.Cartesian3(1, 1, 1) // scale
  );
  //convert modelMatrixPosition to array
  const modelMatrixArray = new Cesium.Matrix4.toArray(modelMatrix)
  return modelMatrixArray;
}

// Silhouette setup
if (!Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)) {
  alert("This browser does not support the silhouette post process.");
}
const silhouetteStage = viewer.scene.postProcessStages.add(
  Cesium.PostProcessStageLibrary.createSilhouetteStage()
);
silhouetteStage.uniforms.color = Cesium.Color.YELLOW;
silhouetteStage.enabled = false;

function setSilhouette(selectedTileset) {
  silhouetteStage.selected = [];
  if (selectedTileset) {
    silhouetteStage.selected = [selectedTileset];
    silhouetteStage.enabled = true;
  } else {
    silhouetteStage.enabled = false;
  }
}

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (movement) {
  const pickedFeature = viewer.scene.pick(movement.endPosition);
  console.log("🚀 ~ pickedFeature:", pickedFeature)
  if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
    setSilhouette(pickedFeature);
  } else {
    setSilhouette(null);
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);




async function getTransformMatrix(centerPoint) {
  const heading = Cesium.Math.toRadians(-46.6847); // Z axis
  const pitch = Cesium.Math.toRadians(-141.9155); // Y axis
  const roll = Cesium.Math.toRadians(-30.182); // X axis
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const modelMatrixPosition = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromRadians(centerPoint.longitude, centerPoint.latitude, centerPoint.height), hpr);

  //convert modelMatrixPosition to array
  const modelMatrixPositionArray = [];
  for (let i = 0; i < 16; i++) {
    modelMatrixPositionArray.push(modelMatrixPosition[i]);
  }
  console.log('🚀 ~ getTransformMatrix ~ modelMatrixPositionArray:', modelMatrixPositionArray);
  return modelMatrixPositionArray;
}


try {
  const tileset = await Cesium.Cesium3DTileset.fromUrl('http://127.0.0.1:5500/src/tilesets/472760/190794-tileset.json');
   tileset.debugShowBoundingVolume = true;
   tileset.debugShowContentBoundingVolume = true;
  const center = getCenterPointByTiles(472760, 190794, 18);
  const modelMatrix = await getTransformMatrixNew(center);
  console.log("modelMatrix:", modelMatrix);
  tileset.modelMatrix = modelMatrix;
  // tileset.modelMatrix = [
  //   0.9985255603727304, -0.04684920378922694, -0.02742001799124605, 0, 0.047341199799585426, 0.9987241115209584, 0.017577254285255473, 0, 0.026561552738130934, -0.0188494342352305, 0.9994694506312594,
  //   0, -3929831.0467378525, 2790837.7199141025, -4163109.2839744235, 1
  // ];
  tileset.style = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [['true', "color('yellow')"]]
    }
  });
  // tileset.customShader = customShader;
  console.log("🚀 ~ tileset:", tileset)
  viewer.scene.primitives.add(tileset);

  viewer.zoomTo(tileset);
  console.log('🚀 ~ file: cesiumMain.mjs:18 ~ tileset:', tileset);
} catch (error) {
  console.error(`Error creating tileset: ${error}`);
}



const customShader = new Cesium.CustomShader({
  uniforms: {
    u_time: {
      value: 0, // initial value
      type: Cesium.UniformType.FLOAT
    }
  },
  mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
  lightingModel: Cesium.LightingModel.PBR,
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        // Simulating "thickness" by adding a glow effect
        vec3 glowColor = vec3(1.0, 0.0, 0.0); // Red glow
        float glowStrength = 0.99; // Adjust for stronger/weaker glow

        // Basic implementation, for illustration purposes
        // You would need to implement logic to control how the glow is applied
        // around the lines or edges of your model
        material.emissive += glowColor * glowStrength;

        // Adjust material.alpha if needed to apply transparency
        // material.alpha = 1;
    }
  `
});