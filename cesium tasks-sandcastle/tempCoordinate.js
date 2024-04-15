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
let mouseMoveHandler = null;
let middlePoint = null;
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
      pixelSize: 5,
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
      // console.log( Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, pointToCartesian));
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

function getPolylineBoundingBox(point, buffer) {
  const startWindowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
    viewer.scene,
    start
  );
  const endWindowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
    viewer.scene,
    end
  );

  return {
    minX: Math.min(startWindowPos.x, endWindowPos.x) - buffer,
    maxX: Math.max(startWindowPos.x, endWindowPos.x) + buffer,
    minY: Math.min(startWindowPos.y, endWindowPos.y) - buffer,
    maxY: Math.max(startWindowPos.y, endWindowPos.y) + buffer,
  };
}
function getIntersectingPoints(start, end, buffer) {
  const boundingRectangle = getPolylineBoundingBox(start, end, buffer);
  const intersectingPoints = [];

  for (
    let x = boundingRectangle.x;
    x <= boundingRectangle.x + boundingRectangle.width;
    x += 1
  ) {
    for (
      let y = boundingRectangle.y;
      y <= boundingRectangle.y + boundingRectangle.width;
      y += 1
    ) {
      // const {x,y} = boundingRectangle;

      const positionCartesian = new Cesium.Cartesian3(x, y, 4595420.374784433);
      // console.log(Cesium.defined(positionCartesian));

      const windowPoint = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        scene,
        positionCartesian
      );
      // console.log("Window Point:", windowPoint);

      const pickedPoint = getPosition(windowPoint);
      // console.log(Cesium.defined(pickedPoint));
      if (Cesium.defined(pickedPoint)) {
        console.log("object");
        // console.log(`Window Position: ${windowPosition}, Picked Point: ${pickedPoint}, Distance: ${dist}`);

        intersectingPoints.push(positionCartesian);
        // console.log(intersectingPoints);
        addMark(pickedPoint);
      }
    }
  }
  intersectingPoints.map(point => {
    addMark(point)
  })
  return intersectingPoints;
}

const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
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
      highlightDiv.style.left = `${movement.endPosition.x - 4}px`;
      highlightDiv.style.top = `${movement.endPosition.y - 4}px`;
      highlightDiv.style.display = "block";
      //  console.log(windowPosition)
    }
  } else {
    // Hide the highlight div
    highlightDiv.style.display = "none";
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

function handleClick(click) {
  if (!measurementComplete) {
    if (!startPoint) {
      startPoint = getPosition(click.position);

      addMark(startPoint);
      if (mouseMoveHandler) {
        mouseMoveHandler.setInputAction(
          handleMouseMove,
          Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );
      }
    } else if (!endPoint) {
      endPoint = getPosition(click.position);
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

      
      const winStart = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        scene,
        startPoint
      );
      const winEnd = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        scene,
        endPoint
      );
      const screenDistance = Cesium.Cartesian2.distance(
        winStart,
        winEnd
      );
      const intervalDistance = 3; // Distance interval for each point, e.g., every 10 meters
      const numberOfPoints = Math.floor(
        screenDistance / intervalDistance
      );
      const segmentFraction = 1.0 / numberOfPoints;
      function interpolatedPoint(winStart, winEnd, fraction) {
        return {
            x: winStart.x + fraction * (winEnd.x - winStart.x),
            y: winStart.y + fraction * (winEnd.y - winStart.y)
        };
    }
      for (let i = 0; i <= numberOfPoints; i++) {
        const interpolatedPoint = interpolatedPoint()
        
        const boundingRectangle = createBoundingRectangleAroundPoint(
          interpolatedPoint,
          0.05
        );

        if (interpolatedPoint) {
          const relatedPoints = getIntersectingPoints(boundingRectangle);
          // console.log(relatedPoints);
        }
      }

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
    // polyline = null;
    mouseMoveHandler = null;
    middlePoint = null;
    movingPoint = null;
    //        overlay.style.display = "none";
    measurementComplete = false; // Reset the flag to allow new measurements
    highlightDiv.style.display = "none";
  }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
