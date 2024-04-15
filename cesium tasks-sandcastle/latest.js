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
let d = 0.1;
let tileset;
let midpoint;
(async function () {
  try {
    tileset = await Cesium.Cesium3DTileset.fromIonAssetId(16421);
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

function addMark(position,color) {
  // console.log("Adding mark at position:", position);
  viewer.entities.add({
    position: position,
    point: {
      pixelSize: 5,
      color: color,
    },
  });
}
function getPosition(position) {
  const pickedObject = scene.pick(position, 1, 1);

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
function convertToCartesianFromCartographic(cartographic) {
  const lng = Cesium.Math.toDegrees(cartographic.longitude);
  const lat = Cesium.Math.toDegrees(cartographic.latitude);
  const height = cartographic.height;
  const pointToCartesian = Cesium.Cartesian3.fromDegrees(lng, lat, height);
  return pointToCartesian;
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
// console.log(mouseMoveHandler);
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
  // console.log("clicked");

  if (!measurementComplete) {
    if (!startPoint) {
      startPoint = getPosition(click.position);

      addMark(startPoint,Cesium.Color.RED);
      if (mouseMoveHandler) {
        mouseMoveHandler.setInputAction(
          handleMouseMove,
          Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );
      }
    } else if (!endPoint) {
      endPoint = getPosition(click.position);

      endPoint && (distance = Cesium.Cartesian3.distance(startPoint, endPoint));

      addMark(endPoint,Cesium.Color.RED);
      movingPoint = null;
      // Calculate the midpoint between start and end points
      if (endPoint) {
        midpoint = Cesium.Cartesian3.lerp(
          startPoint,
          endPoint,
          0.5,
          new Cesium.Cartesian3()
        );
      }
      if (labelEntity) {
        viewer.entities.remove(labelEntity);
      }
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

      // Mark the measurement as complete
      const lineLength = distance; // You already have this from your code
      const windowStart = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        startPoint
      );
      const windowEnd = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        endPoint
      );

      const screenDistance = Cesium.Cartesian2.distance(windowStart, windowEnd);
      // console.log("screenDistance:" + screenDistance);
      // console.log("lineLength: " + lineLength);

      // const numberOfSegments = Math.floor(screenDistance/3);
      // console.log("numberOfSegments: "+numberOfSegments);
      const screenBuffer = Math.round((0.01 * screenDistance) / lineLength);
      // const currentAltitude = viewer.camera.positionCartographic.height;

      const cameraAltitude = viewer.camera.positionCartographic.height;
      //console.log("cameraAltitude: " + cameraAltitude);
      const adjustedScreenBuffer = Math.round(
        screenBuffer * (cameraAltitude / 413.88)
      );
      const numberOfSegments = Math.ceil(screenDistance /screenBuffer);
      // const numberOfSegments = Math.ceil(screenDistance / adjustedScreenBuffer);
      // console.log("numberOfSegments: " + numberOfSegments);
      // console.log("screenBuffer: " + screenBuffer);
      // console.log("adjustedScreenBuffer: " + adjustedScreenBuffer);
      const startTime = performance.now();
      if ((startPoint, endPoint)) {
        getIntersectingPointsForSubSegments(
          windowStart,
          windowEnd,
          screenBuffer,
          numberOfSegments
        );
      }
      const endTime = performance.now();
      console.log("time: " , endTime-startTime);
      measurementComplete = true;
      viewer.entities.add(label);

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
    measurementComplete = false; // Reset the flag to allow new measurements
    highlightDiv.style.display = "none";
  }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//this part is to consider points inside a rectangle in screen which is 2d
function getPolylineBoundingBox(start, end, buffer) {
  return {
    minX: Math.min(start.x, end.x) - buffer,
    maxX: Math.max(start.x, end.x) + buffer,
    minY: Math.min(start.y, end.y) - buffer,
    maxY: Math.max(start.y, end.y) + buffer,
  };
}
// New function to break the line segment into smaller segments
function getSubSegments(start, end, numberOfSegments) {
  const segments = [];
  for (let i = 0; i < numberOfSegments; i++) {
    const startPoint = Cesium.Cartesian2.lerp(
      start,
      end,
      i / numberOfSegments,
      new Cesium.Cartesian2()
    );
    const endPoint = Cesium.Cartesian2.lerp(
      start,
      end,
      (i + 1) / numberOfSegments,
      new Cesium.Cartesian2()
    );
    segments.push([startPoint, endPoint]);
  }
  return segments;
}

// Modified getIntersectingPoints function
function getIntersectingPointsForSubSegments(
  start,
  end,
  screenBuffer,
  numberOfSegments
) {
  const subSegments = getSubSegments(start, end, numberOfSegments);

  const allIntersectingPoints = [];
  let filteredP = [];

  for (const [subStart, subEnd] of subSegments) {
    const boundingBox = getPolylineBoundingBox(subStart, subEnd, screenBuffer);
    // console.log(boundingBox);
    const intersectingPoints = [];

    const stepSizeX = screenBuffer / 10;
    // const stepSizeY = screenBuffer/10;

    const stepSize = Math.max(5, screenBuffer / 10);
    // const stepSizeY = Math.max(2, (boundingBox.maxY - boundingBox.minY) / 100);
    // console.log("stepSize: " + stepSize);
    for (let x = boundingBox.minX; x <= boundingBox.maxX; x += stepSize) {
      // console.log("x:",x);
      for (let y = boundingBox.minY; y <= boundingBox.maxY; y += stepSize) {
        const windowPosition = new Cesium.Cartesian2(x, y);

        const pickedPoint = getPosition(windowPosition);
        // console.log(Cesium.defined(pickedPoint));
        if (Cesium.defined(pickedPoint)) {
          const cartesianPosition = getPosition(windowPosition);
          intersectingPoints.push(cartesianPosition);
          // addMark(cartesianPosition);
        }
      }
    }

    allIntersectingPoints.push(...intersectingPoints);
  }
  filteredP = filterClosePoints(allIntersectingPoints, 0.01);
  // Mark only the filtered points
  for (const point of filteredP) {
    addMark(point,Cesium.Color.YELLOW);
  }

  // console.log(allIntersectingPoints);
  // console.log(filteredP);
  return allIntersectingPoints;
}

function filterClosePoints(points, threshold) {
//  console.log("points:", points); 
  const filteredPoints = [];
  for (let i = 0; i < points.length; i++) {
    let isClose = false;
    for (let j = 0; j < filteredPoints.length; j++) {
      const distance = Cesium.Cartesian3.distance(points[i], filteredPoints[j]);
      if (distance < threshold) {
        // console.log("distance:", distance);
        isClose = true;
        break;
      }
    }
    if (!isClose) {
      filteredPoints.push(points[i]);
    }
  }
console.log("filteredPoints" + filteredPoints);
  return filteredPoints;
}
