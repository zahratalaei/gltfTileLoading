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
let terrainHeight = null;
let heightAboveTerrain = null;
let height = null;
let pointToCartesian = null;

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
  return viewer.entities.add({
    position: position,
    point: {
      pixelSize: 6,
      color: Cesium.Color.YELLOW,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}
function getPosition(position) {
  const pickedObject = scene.pick(position);
  if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
    const point = scene.pickPosition(position);
    //console.log("point "+ point);

    if (Cesium.defined(point)) {
      const cartographic = Cesium.Cartographic.fromCartesian(point);
      let lng = Cesium.Math.toDegrees(cartographic.longitude);
      let lat = Cesium.Math.toDegrees(cartographic.latitude);
      let height = cartographic.height;
      const cartoghraphicPoint = { lng, lat, height };

      return { cartographic, cartoghraphicPoint };
    }
  }
  return null;
}
function cartoghraphicToCartesian(lng, lat, height) {
  return Cesium.Cartesian3.fromDegrees(lng, lat, height);
}
function handleClick(click) {
  if (!measurementComplete) {
    const result = getPosition(click.position);
    if (result) {
      const tempPoint = result.cartoghraphicPoint;
      const carto = result.cartographic;

      terrainHeight = scene.globe.getHeight(carto);
      startPoint = cartoghraphicToCartesian(
        tempPoint.lng,
        tempPoint.lat,
        terrainHeight
      );
      endPoint = cartoghraphicToCartesian(
        tempPoint.lng,
        tempPoint.lat,
        tempPoint.height
      );
      console.log(endPoint);
      distance = tempPoint.height - terrainHeight;

      console.log(distance);
      addMark(endPoint);

      // Calculate the midpoint between start and end points
      const midpoint = Cesium.Cartesian3.lerp(
        startPoint,
        endPoint,
        0.5,
        new Cesium.Cartesian3()
      );
      // Add a label entity to the polyline
      labelEntity = new Cesium.Entity({
        position: midpoint,
        label: {
          text: distance.toFixed(2) + " meters",
          font: "10px sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(-50, 0),
          disableDepthTestDistance: 10000000,
          fillColor: Cesium.Color.BLACK,
          showBackground: true,
          backgroundColor: Cesium.Color.WHITE,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.0),
          verticalOrigin: Cesium.VerticalOrigin.LEFT,
        },
      });
      // console.log(midpoint);
      viewer.entities.add(labelEntity);

      // Create a polyline entity
      polyline = viewer.entities.add({
        polyline: {
          positions: [startPoint, endPoint],
          material: Cesium.Color.YELLOW,
          width: 3,
          depthFailMaterial: Cesium.Color.YELLOW,
        },
      });

      // Mark the measurement as complete
      measurementComplete = true;
    }
  } else {
    // Remove the polyline entities and cleanup
    viewer.entities.removeAll();
    startPoint = null;
    endPoint = null;
    polyline = null;

    measurementComplete = false; // Reset the flag to allow new measurements
  }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
