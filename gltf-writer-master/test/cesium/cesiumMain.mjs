const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: await Cesium.createWorldTerrainAsync(),
  });
  viewer.extend(Cesium.viewerCesiumInspectorMixin);
  // viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
  // viewer.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(147.293701171875, -42.857666015625, 10000),
  //   orientation: {
  //       heading: Cesium.Math.toRadians(0),
  //       pitch: Cesium.Math.toRadians(-45), // looking down
  //       roll: 0.0,
  //   },
  // });

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
  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl('http://127.0.0.1:5500/gltf-writer-master/data/conductors/18/472762/190794.tileset.json');   
  //  tileset.debugShowBoundingVolume = true;
  //  tileset.debugShowContentBoundingVolume = true;
  tileset.modelMatrix = [
    0.9985255603727304, -0.04684920378922694, -0.02742001799124605, 0, 0.047341199799585426, 0.9987241115209584, 0.017577254285255473, 0, 0.026561552738130934, -0.0188494342352305, 0.9994694506312594,
    0, -3929831.0467378525, 2790837.7199141025, -4163109.2839744235, 1
  ];
  tileset.style = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [
        
        ['true', "color('yellow')"]
      ]
    }
  });
  tileset.customShader = customShader;
    viewer.scene.primitives.add(tileset);

    viewer.zoomTo(tileset);
    console.log("🚀 ~ file: cesiumMain.mjs:18 ~ tileset:", tileset)
  
  } catch (error) {
    console.error(`Error creating tileset: ${error}`);
  }
  
  
  // async function getTransformMatrix(viewer, longitude, latitude, height) {
  //   if (!viewer || !viewer.scene || !viewer.scene.globe) {
  //     throw new Error("Viewer, scene, or globe is not available.");
  //   }
  
  //   // Convert to Cartographic
  //   const carto = Cesium.Cartographic.fromDegrees(longitude, latitude, height);
  
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
  
  
  // async function loadTileset(tilesetUrl, transformMatrix) {    
  //     try {
  //       const tileset = await Cesium.Cesium3DTileset.fromUrl(tilesetUrl, {
  //         debugShowBoundingVolume: false,
  //         debugShowContentBoundingVolume: true,
  //         debugColorizeTiles: false,
  //         debugShowGeometricError: false,
  //         skipLevelOfDetail: false,
  //       });
    
  //       tileset.modelMatrix = Cesium.Matrix4.fromArray(transformMatrix);
  //       tileset.tileFailed.addEventListener(function(event){
  //         console.log("tile failed" , event);
  //       })
  //       tileset.tileLoad.addEventListener(function(tile){
  //         console.log("A tile was loaded" , tile);
  //       })
  //       tileset.tileUnload.addEventListener(function(tile){
  //         console.log("tile unloaded" , tile);
  //       })
  //       viewer.scene.primitives.add(tileset);
  //       // await viewer.zoomTo(tileset);
  //     } catch (error) {
  //       console.error("Failed to load tileset:", error);
  //     }
  //   }
  //   async function loadTilesetsFromCenterTiles() {
  //     try {
  //       const response = await fetch('centerTiles.json');
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }
  //       const centerTiles = await response.json();
  //       for (const { fileName,modelMatrix } of centerTiles) {
  //         const tilesetUrl = `http://127.0.0.1:5500/src/tilesets/tilesets/${fileName}`;
        
  //         await loadTileset(tilesetUrl, modelMatrix).catch(e => {
  //             console.error(`Error loading tileset ${tilesetUrl}:`, e);
  //           });
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch or process centerTiles.json:", error);
  //     }
  //   }
  //   // Call the function to load all tilesets and catch any unhandled errors
  //  loadTilesetsFromCenterTiles().catch((error) => {
  //     console.error("Error in loadTilesetsFromCenterTiles:", error);
  //   });
  
    