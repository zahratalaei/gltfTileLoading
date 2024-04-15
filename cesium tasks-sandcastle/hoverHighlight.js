const nameOverlay = document.createElement("div");
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
let movingPoint = null;
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
    if (Cesium.defined(point)) {
      const cartographic = Cesium.Cartographic.fromCartesian(point);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const height = cartographic.height;
      const pointToCartesian = Cesium.Cartesian3.fromDegrees(lng, lat, height);
      return pointToCartesian;
    }
  }
  return null;
}
// Create the highlight div
const highlightDiv = document.createElement("div");
highlightDiv.style.position = "absolute";
highlightDiv.style.width = "6px";
highlightDiv.style.height = "6px";
highlightDiv.style.background = "red";
highlightDiv.style.left = "0";
highlightDiv.style.top = "0";
highlightDiv.style.pointerEvents = "none";
//highlightDiv.style.borderRadius = '50%';
highlightDiv.style.display = "none";
viewer.container.appendChild(highlightDiv);

const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
console.log(mouseMoveHandler);
function handleMouseMove(movement) {
  if (!endPoint) {
    middlePoint = getPosition(movement.endPosition);
  }
  // Add hover highlighting
  const pickedObject = scene.pick(movement.endPosition);
  if (Cesium.defined(pickedObject)) {
    movingPoint = getPosition(movement.endPosition);
    const canvasPosition = new Cesium.Cartesian2(
        movement.endPosition.x,
        movement.endPosition.y
    );
    const ellipsoidPosition = viewer.scene.globe.pick(
        viewer.camera.getPickRay(canvasPosition),
        viewer.scene
    );
    const windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        ellipsoidPosition
    );
    if (movingPoint) {
      
      // Position the highlight div over the point and show it
      highlightDiv.style.left = `${movement.endPosition.x-4}px`;
      highlightDiv.style.top = `${movement.endPosition.y-4}px`;
      highlightDiv.style.display = "block";
        //  console.log(windowPosition)

    }
  } else {
    // Hide the highlight div
    highlightDiv.style.display = "none";
  }
  if (polyline) {
    polyline.positions = new Cesium.CallbackProperty(function () {
      return [startPoint, middlePoint].filter((position) => position !== null);
    }, false);
  }

  // Perform distance calculation if both start and middle points are defined
  if (startPoint && middlePoint) {
    distance = Cesium.Cartesian3.distance(startPoint, middlePoint);

    // Calculate the midpoint between start and middle points
    const midpoint = Cesium.Cartesian3.lerp(
      startPoint,
      middlePoint,
      0.5,
      new Cesium.Cartesian3()
    );

    // Remove the previous label entity if exists
    if (labelEntity) {
      viewer.entities.remove(labelEntity);
    }

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
    viewer.entities.add(labelEntity);
  }
}
moveHandler.setInputAction(
  handleMouseMove,
  Cesium.ScreenSpaceEventType.MOUSE_MOVE
);
//        handler.setInputAction(handleMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//handler.setInputAction(handleMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

function handleClick(click) {
      console.log("clicked");

  if (!measurementComplete) {
    if (!startPoint) {
      startPoint = getPosition(click.position);
      polyline = new Cesium.PolylineGraphics();
      polyline.material = Cesium.Color.RED;
      polyline.width = 3;
      polyline.positions = new Cesium.CallbackProperty(function () {
        return [startPoint, middlePoint].filter(
          (position) => position !== null
        );
      }, false);
      viewer.entities.add({
        polyline: polyline,
      });

      addMark(startPoint);
      if (mouseMoveHandler) {
        mouseMoveHandler.setInputAction(
          handleMouseMove,
          Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

        // mouseMoveHandler = handler.setInputAction(handleMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    } else if (!endPoint) {
      endPoint = getPosition(click.position);
  console.log(endPoint);
      polyline.positions = new Cesium.CallbackProperty(function () {
        return [startPoint, endPoint].filter((position) => position !== null);
      }, false);
      distance = Cesium.Cartesian3.distance(startPoint, endPoint);

      // Create a highlighted polyline entity
      highlightedPolyline = viewer.entities.add({
        polyline: {
          positions: [startPoint, endPoint].filter(
            (position) => position !== null
          ),
          material: Cesium.Color.YELLOW,
          width: 5,
        },
      });

      addMark(endPoint);
      movingPoint = null;
      // Calculate the midpoint between start and end points
      const midpoint = Cesium.Cartesian3.lerp(
        startPoint,
        endPoint,
        0.5,
        new Cesium.Cartesian3()
      );

      // Add a label entity to the polyline
      const label = new Cesium.Entity({
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
      viewer.entities.add(label);

      // Mark the measurement as complete
      measurementComplete = true;

      // Remove the mouse move handler after setting measurementComplete to true
      //mouseMoveHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE, mouseMoveHandler);
      mouseMoveHandler = handler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
        mouseMoveHandler
      );
    }
  } else {
    // Remove the polyline entities and cleanup
    viewer.entities.removeAll();
    startPoint = null;
    endPoint = null;
    polyline = null;
    mouseMoveHandler = null;
    middlePoint = null;
    highlightedPolyline = null;
    movingPoint = null;
    //        overlay.style.display = "none";
    measurementComplete = false; // Reset the flag to allow new measurements
    highlightDiv.style.display = "none";
  }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
