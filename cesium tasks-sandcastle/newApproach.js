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
    tileset.style.pointSize = "3";
    //   tileset.style = new Cesium.Cesium3DTileStyle({
    //     color: 'color("white")'
    // });
    console.log(tileset);
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
  // console.log("Adding mark at position:", position);
  viewer.entities.add({
    position: position,
    point: {
      pixelSize: 5,
      color: Cesium.Color.YELLOW,
    },
  });
}
function getPosition(position) {
  const pickedObject = scene.pick(position,1,1);
  
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
function convertToCartesianFromCartographic(cartographic){
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
  // if (polyline) {
  //   polyline.positions = new Cesium.CallbackProperty(function () {
  //     return [startPoint, middlePoint].filter((position) => position !== null);
  //   }, false);
  // }

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
     
      addMark(startPoint);
      if (mouseMoveHandler) {
        mouseMoveHandler.setInputAction(
          handleMouseMove,
          Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

      
      }
    } else if (!endPoint) {
      endPoint = getPosition(click.position);
   
      endPoint && (distance = Cesium.Cartesian3.distance(startPoint, endPoint));
     
      addMark(endPoint);
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
      measurementComplete = true;
const startTime = performance.now()
      if ((startPoint, endPoint)) {
        getIntersectingPoints(startPoint, endPoint, 0.1);
      }
      const endTime = performance.now()
      console.log(endTime-startTime);
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

// Calculate the angle between two points
function calculateAngle(point1, point2) {
  const deltaY = point2.y - point1.y;
  const deltaX = point2.x - point1.x;
  return Math.atan2(deltaY, deltaX);
}

// Get the rotated bounding box
function getRotatedBoundingBox(start, end, buffer) {
  // Convert Cartesian3 to window coordinates
  const startWindowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, start);
  const endWindowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, end);

  const angle = calculateAngle(startWindowPos, endWindowPos);
  const centerX = (startWindowPos.x + endWindowPos.x) / 2;
  const centerY = (startWindowPos.y + endWindowPos.y) / 2;
  const halfLength = Math.sqrt((endWindowPos.x - startWindowPos.x) ** 2 + (endWindowPos.y - startWindowPos.y) ** 2) / 2 + buffer;  // Add buffer to halfLength
  const halfWidth = buffer;

  const corner1 = { x: centerX - halfLength, y: centerY - halfWidth };
  const corner2 = { x: centerX + halfLength, y: centerY + halfWidth };

  // Rotate the corners around the center by the angle
  const rotatedCorner1 = rotatePoint(corner1, { x: centerX, y: centerY }, angle);
  const rotatedCorner2 = rotatePoint(corner2, { x: centerX, y: centerY }, angle);

  return {
      minX: Math.min(rotatedCorner1.x, rotatedCorner2.x),
      maxX: Math.max(rotatedCorner1.x, rotatedCorner2.x),
      minY: Math.min(rotatedCorner1.y, rotatedCorner2.y),
      maxY: Math.max(rotatedCorner1.y, rotatedCorner2.y)
  };
;
}


// Rotate a point around another point by a certain angle
function rotatePoint(point, origin, angle) {
  const rotatedX = Math.cos(angle) * (point.x - origin.x) - Math.sin(angle) * (point.y - origin.y) + origin.x;
  const rotatedY = Math.sin(angle) * (point.x - origin.x) + Math.cos(angle) * (point.y - origin.y) + origin.y;
  return { x: rotatedX, y: rotatedY };
}

function getIntersectingPoints(start, end, distance) {
  const boundingBox = getRotatedBoundingBox(start, end, distance);  


  // Convert window coordinates back to Cartesian3 for visualization
  const lowerLeftCartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(boundingBox.minX, boundingBox.minY));
  const upperRightCartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(boundingBox.maxX, boundingBox.maxY));

  // Convert Cartesian3 to Cartographic
  const lowerLeftCartographic = Cesium.Cartographic.fromCartesian(lowerLeftCartesian);
  const upperRightCartographic = Cesium.Cartographic.fromCartesian(upperRightCartesian);

  // Add a rectangle entity to visualize the bounding box
  viewer.entities.add({
    rectangle: {
      coordinates: Cesium.Rectangle.fromCartographicArray([lowerLeftCartographic, upperRightCartographic]),
      material: Cesium.Color.RED.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.RED
    }
  });
  const intersectingPoints = [];
  const entitiesToAdd = []; // Array to store entities for batching
  const stepSizeX = Math.max(3);
  const stepSizeY = Math.max(3);
  // const stepSizeX = Math.max(2, (boundingBox.maxX - boundingBox.minX) / 100);
  // const stepSizeY = Math.max(2, (boundingBox.maxY - boundingBox.minY) / 100);

  for (let x = boundingBox.minX; x <= boundingBox.maxX; x += stepSizeX) {
      for (let y = boundingBox.minY; y <= boundingBox.maxY; y += stepSizeY) {
          const windowPosition = new Cesium.Cartesian2(x, y)

            const pickedPoint = getPosition(windowPosition);
            if(pickedPoint)
            {const dist = distancePointToSegment(pickedPoint, start, end);
            if (pickedPoint && dist <= distance) {
              // console.log(dist);
              intersectingPoints.push(pickedPoint);
              entitiesToAdd.push({
                position: pickedPoint,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.YELLOW,
                },
            });
            }
          }
      }
  }
  console.log(entitiesToAdd);
  console.log(viewer.entities.values.length);
entitiesToAdd.map(entity => {

  viewer.entities.add(entity);
})
  return intersectingPoints;
}

function distancePointToSegment(point, start, end) {
  const startToEnd = Cesium.Cartesian3.subtract(
    end,
    start,
    new Cesium.Cartesian3()
  );
  const startToPoint = Cesium.Cartesian3.subtract(
    point,
    start,
    new Cesium.Cartesian3()
  );

  const dotProduct = Cesium.Cartesian3.dot(startToEnd, startToPoint);
  const lengthSquared = Cesium.Cartesian3.magnitudeSquared(startToEnd);

  if (dotProduct <= 0 || lengthSquared === 0) {
    // The point is closer to the start point
    return Cesium.Cartesian3.distance(point, start);
  } else if (dotProduct >= lengthSquared) {
    // The point is closer to the end point
    return Cesium.Cartesian3.distance(point, end);
  } else {
    // The point is inside the line segment, calculate the perpendicular distance
    const t = dotProduct / lengthSquared;
    const projection = Cesium.Cartesian3.multiplyByScalar(
      startToEnd,
      t,
      new Cesium.Cartesian3()
    );
    const closestPointOnSegment = Cesium.Cartesian3.add(
      start,
      projection,
      new Cesium.Cartesian3()
    );
    return Cesium.Cartesian3.distance(point, closestPointOnSegment).toFixed(2);
  }
}
