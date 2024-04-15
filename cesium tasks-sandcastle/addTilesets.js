const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: await Cesium.createWorldTerrainAsync(),
});
viewer.extend(Cesium.viewerCesiumInspectorMixin);
// viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(147.293701171875, -42.857666015625, 10000),
  orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45), // looking down
      roll: 0.0,
  },
});

// async function getTransformMatrix(viewer, longitude, latitude, height) {
//   if (!viewer || !viewer.scene || !viewer.scene.globe) {
//     throw new Error("Viewer, scene, or globe is not available.");
//   }

//   // Convert to Cartographic
//   const carto = Cesium.Cartographic.fromDegrees(longitude, latitude, height);
//   console.log("file: addTilesets.js:22 , getTransformMatrix , carto:", carto);

//   // If height is undefined, log a warning and use the centerPosition with fallback height
//   if (typeof height === "undefined") {
//     console.warn("Height is undefined. Using default height.");
//   }
//   const heading = Cesium.Math.toRadians(-46.7); // Z axis
//   const pitch = Cesium.Math.toRadians(-141.9); // Y axis
//   const roll = Cesium.Math.toRadians(-30.2); // X axis
//   const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
//   const modelMatrixPosition = Cesium.Transforms.headingPitchRollToFixedFrame(
//     Cesium.Cartesian3.fromRadians(
//       carto.longitude,
//       carto.latitude,
//       carto.height
//     ),
//     hpr
//   );

//   //convert modelMatrixPosition to array
//   const modelMatrixPositionArray = [];
//   for (let i = 0; i < 16; i++) {
//     modelMatrixPositionArray.push(modelMatrixPosition[i]);
//   }

//   return modelMatrixPositionArray;
// }

async function getTransformMatrix(viewer, longitude, latitude, height) {
  if (!viewer || !viewer.scene || !viewer.scene.globe) {
    throw new Error("Viewer, scene, or globe is not available.");
  }

  // Convert to Cartographic
  const carto = Cesium.Cartographic.fromDegrees(longitude, latitude, height);

  // Rotate the model based on cartographic coordinates
  const heading = -carto.latitude; // Z axis
  const pitch = 0; // Y axis, set to 0 as per your requirement
  const roll = carto.longitude + Math.PI / 2; // X axis

  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const modelMatrixPosition = Cesium.Transforms.headingPitchRollToFixedFrame(
    Cesium.Cartesian3.fromRadians(
      carto.longitude,
      carto.latitude,
      carto.height
    ),
    hpr
  );

  // Convert modelMatrixPosition to array
  const modelMatrixPositionArray = [];
  for (let i = 0; i < 16; i++) {
    modelMatrixPositionArray.push(modelMatrixPosition[i]);
  }

  return modelMatrixPositionArray;
}
async function loadTileset(tilesetUrl, transformMatrix) {
    try {
      const tileset = await Cesium.Cesium3DTileset.fromUrl(tilesetUrl, {
        debugShowBoundingVolume: false,
        debugShowContentBoundingVolume: false,
        debugColorizeTiles: false,
        debugShowGeometricError: false,
        skipLevelOfDetail: false,
      });
  
      tileset.modelMatrix = Cesium.Matrix4.fromArray(transformMatrix);
      tileset.tileFailed.addEventListener(function(event){
        console.log("tile failed" , event);
      })
      tileset.tileLoad.addEventListener(function(tile){
        console.log("A tile was loaded" , tile);
      })
      tileset.tileUnload.addEventListener(function(tile){
        console.log("tile unloaded" , tile);
      })
      viewer.scene.primitives.add(tileset);
      // await viewer.zoomTo(tileset);
    } catch (error) {
      console.error("Failed to load tileset:", error);
    }
  }
  async function loadTilesetsFromCenterTiles() {
    try {
      const response = await fetch('centerTiles.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const centerTiles = await response.json();
      for (const { fileName, center } of centerTiles) {
        const tilesetUrl = `http://127.0.0.1:5501/tilesets/${fileName}`;
        const transformMatrix = await getTransformMatrix(
          viewer,
          center.longitude,
          center.latitude,
          0 // Assuming height is 0, adjust if needed
        );
        await loadTileset(tilesetUrl, transformMatrix).catch(e => {
            console.error(`Error loading tileset ${tilesetUrl}:`, e);
          });
      }
    } catch (error) {
      console.error("Failed to fetch or process centerTiles.json:", error);
    }
  }
  // Call the function to load all tilesets and catch any unhandled errors
 loadTilesetsFromCenterTiles().catch((error) => {
    console.error("Error in loadTilesetsFromCenterTiles:", error);
  });

// (async function () {
//   try {
//     const transformMatrix = await getTransformMatrix(
//       viewer,
//       centerLongitude,
//       centerLatitude,
//       0
//     );
//     const tileset = await Cesium.Cesium3DTileset.fromUrl(
//       "http://127.0.0.1:5501/tileset-119169-48376.json",
//       {
//         debugShowBoundingVolume: false,
//         debugShowContentBoundingVolume: true,
//         debugColorizeTiles: true,
//         debugShowGeometricError: true,
//         skipLevelOfDetail: false,
//         // outlineColor:Cesium.Color.RED
//       }
//     );
//     // Set the transform matrix to your tileset
//     // tileset.modelMatrix = finalTransformMatrix;
//     tileset.modelMatrix = transformMatrix;

//     viewer.scene.primitives.add(tileset);

//     // Calculate the center of the tileset's bounding volume
//     let boundingVolume = tileset.boundingSphere; // Assuming the tileset has a bounding sphere
//     console.log("file: addCatenaries.js:134 , boundingVolume:", boundingVolume);
//     let center = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(
//       boundingVolume.center
//     );

    
//     viewer.zoomTo(tileset);
//     viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
//     viewer.extend(Cesium.viewerCesiumInspectorMixin);
//   } catch (error) {
//     console.error("Failed to set the transform matrix:", error);
//   }
// })();
