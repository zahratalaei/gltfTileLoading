const minLongitude =  147.30743408203125;  // Westernmost edge
  const maxLongitude =   147.3101806640625;    // Easternmost edge
  const maxLatitude = -42.86865234375;     // Northernmost edge (less negative)
  const minLatitude = -42.87139892578125;   // Southernmost edge (more negative)

  // Calculate the center of the bounding box
  const centerLongitude = (minLongitude + maxLongitude) / 2;
  const centerLatitude = (minLatitude + maxLatitude) / 2;

  const viewer = new Cesium.Viewer("cesiumContainer",{
    terrainProvider: await Cesium.createWorldTerrainAsync()

  });
  // This function gets called within your async IIFE
async function getYUpToZUpMatrix() {
  // This is the rotation matrix for a 90-degree rotation about the X-axis
  // to convert from Y-up to Z-up.
  const yUpToZUpMatrix = Cesium.Matrix4.fromRotationTranslation(
    Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90))
  );
  return yUpToZUpMatrix;
}
async function getTransformMatrix(viewer, longitude, latitude,height) {
  if (!viewer || !viewer.scene || !viewer.scene.globe) {
    throw new Error("Viewer, scene, or globe is not available.");
  }

  // Convert to Cartographic
  const carto = Cesium.Cartographic.fromDegrees(longitude, latitude,height);

  // // Sample the terrain height at the given location
  // const sampledPositions = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [carto]);
  // const height = sampledPositions[0].height;

  // Define a center position with the sampled height
  const centerPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
 
  // Add a point entity at the center position
  viewer.entities.add({
    position: centerPosition,
    point: {
      pixelSize: 40,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,

    }
  });
  
  // If height is undefined, log a warning and use the centerPosition with fallback height
  if (typeof height === 'undefined') {
    console.warn('Height is undefined. Using default height.');
  }
  const heading = Cesium.Math.toRadians(-46.7); // Z axis
  const pitch = Cesium.Math.toRadians(-141.9); // Y axis
  const roll = Cesium.Math.toRadians(-30.2); // X axis
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const modelMatrixPosition = Cesium.Transforms.headingPitchRollToFixedFrame(
    Cesium.Cartesian3.fromRadians(
        carto.longitude,
        carto.latitude,
        carto.height
    ),
    hpr
);
 //eastNorthUpToFixedFrame
 const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
  Cesium.Cartesian3.fromRadians(
      carto.longitude,
      carto.latitude,
      carto.height
  )
);


//convert modelMatrixPosition to array
const modelMatrixPositionArray = [];
for (let i = 0; i < 16; i++) {
    modelMatrixPositionArray.push(modelMatrixPosition[i]);
}

return modelMatrixPositionArray;

}




// Immediately Invoked Function Expression (IIFE) to use async/await at the top level

(async function() {
  // const viewer = new Cesium.Viewer("cesiumContainer",{
  //   terrainProvider: await Cesium.createWorldTerrainAsync()

  // });
  

  try {
    const yUpToZUpMatrix = await getYUpToZUpMatrix();
      const transformMatrix = await getTransformMatrix(viewer, centerLongitude, centerLatitude,0);
      // Combine the matrices by multiplying them
const finalTransformMatrix = Cesium.Matrix4.multiply(transformMatrix, yUpToZUpMatrix, new Cesium.Matrix4());
      console.log("file: addCatenaries.js:71 , finalTransformMatrix:", finalTransformMatrix);
      
const tileset = await Cesium.Cesium3DTileset.fromUrl(
  "http://127.0.0.1:5501/tileset-119169-48376.json",{
    debugShowBoundingVolume:false,
    debugShowContentBoundingVolume:false,
    debugColorizeTiles:false,
    debugShowGeometricError:false,
    skipLevelOfDetail:false, 
   
  });
      // Set the transform matrix to your tileset
      // tileset.modelMatrix = finalTransformMatrix;
      // tileset.modelMatrix = transformMatrix;2023-11-22 14:36:51
    
      viewer.scene.primitives.add(tileset);
      
    // Calculate the center of the tileset's bounding volume
    let boundingVolume = tileset.boundingSphere; // Assuming the tileset has a bounding sphere
    console.log("file: addCatenaries.js:134 , boundingVolume:", boundingVolume);
    let center = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(boundingVolume.center);

    // Add a point entity at the center
    viewer.entities.add({
      position: center,
      point: {
        pixelSize:40,
        color: Cesium.Color.YELLOW, // Change color as needed
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,

      }
    });
      viewer.zoomTo(tileset)
      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
      viewer.extend(Cesium.viewerCesiumInspectorMixin);
  } catch (error) {
      console.error('Failed to set the transform matrix:', error);
  }
})();

// "transform":[
//   -0.680128119179664, 0.3958439868914727,
//  0.6170358818926147,                  0,
//  0.7330931880649552, 0.3668484173948344,
//  0.5727098883969666,                  0,
// 0.0003451288070939196, 0.8418609010381519,
// -0.5396944544733973,                  0,
//                   0,                  0,
//                   0,                  1
// ]