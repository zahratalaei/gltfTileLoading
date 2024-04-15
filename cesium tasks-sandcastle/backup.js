const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    selectionIndicator: false,
    terrain: Cesium.Terrain.fromWorldTerrain(),
  });
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  const scene = viewer.scene;
  let startPoint = null;
  let endPoint = null;
  let polyline = null;
  let mouseMoveHandler = null;
  let middlePoint = null;
  let highlightedPolyline = null;
  let measurementComplete = false; // Flag to track measurement completion
  let labelEntity = null; // Variable to hold the label entity
  let distance = null;
  let terrainHeight=null;
  let heightAboveTerrain=null;
  let height = null;
  
  (async function () {
    try {
      const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(16421);
      viewer.scene.primitives.add(tileset);
      tileset.style = new Cesium.Cesium3DTileStyle();
      tileset.style.pointSize = "5";
    } catch (error) {
      console.log(`Error loading tileset: ${error}`);
    }
  })();
  viewer.scene.camera.setView({
    destination: new Cesium.Cartesian3(
      4401744.644145314,
      225051.41078911052,
      4595420.374784433
    ),
    orientation: new Cesium.HeadingPitchRoll(
      5.646733805039757,
      -0.276607153839886,
      6.281110875400085
    ),
  });
  
  function addMark(position) {
    viewer.entities.add({
      position: position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  }
  function getPosition(position) {
    const pickedObject = scene.pick(position);
    if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
      const point = scene.pickPosition(position);
      //console.log("point"+point);
  
      if (Cesium.defined(point)) {
        const cartographic = Cesium.Cartographic.fromCartesian(point);
         terrainHeight = scene.globe.getHeight(cartographic);
        //console.log(terrainHeight);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
         height = cartographic.height;
        heightAboveTerrain = cartographic.height - terrainHeight;
        const pointToCartesian = Cesium.Cartesian3.fromDegrees(lng, lat, height);
        //console.log("height"+ height);
  
        return heightAboveTerrain;
      }
    }
    return null;
  }
  
  function handleClick(click) {
    if (!measurementComplete) {
      distance = getPosition(click.position);
  
      console.log(distance);
  
      viewer.entities.add({
      position: click.position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
      // Create a highlighted polyline entity
      polyline = viewer.entities.add({
        polyline: {
         positions: [terrainHeight, height].filter(
           (position) => position !== null
          ),
         material: Cesium.Color.YELLOW,
          width: 5,
        },
      });
      console.log(polyline);
  
      // Calculate the midpoint between start and end points
      const midpoint = distance / 2;
  
      // Add a label entity to the polyline
      labelEntity = new Cesium.Entity({
        position: midpoint,
        label: {
          text: distance.toFixed(2) + " meters",
          font: "14px sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -20),
        },
      });
      console.log(midpoint);
      viewer.entities.add(labelEntity);
      
      // Mark the measurement as complete
      measurementComplete = true;
  
      // Remove the mouse move handler after setting measurementComplete to true
      // handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE, mouseMoveHandler);
    } else {
      // Remove the polyline entities and cleanup
      viewer.entities.removeAll();
      startPoint = null;
      endPoint = null;
      polyline = null;
      mouseMoveHandler = null;
      middlePoint = null;
      // highlightedPolyline = null;
      //        overlay.style.display = "none";
      measurementComplete = false; // Reset the flag to allow new measurements
    }
  }
  
  handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  