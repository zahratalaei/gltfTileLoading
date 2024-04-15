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
let cylinder = null;
let pickedObject;
(async function () {
  try {
    const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(16421);
    viewer.scene.primitives.add(tileset);
    tileset.style = new Cesium.Cesium3DTileStyle();
    tileset.style.pointSize = "5";
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
  const entity = viewer.entities.add({
    position: position,
    point: {
      pixelSize: 5,
      color: Cesium.Color.YELLOW,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-20, -20),
    },
  });
  return entity;
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

function createCylinder(start, end, radius) {
  const direction = Cesium.Cartesian3.subtract(
    end,
    start,
    new Cesium.Cartesian3()
  );
  const length = Cesium.Cartesian3.magnitude(direction);

  // Normalize the direction vector
  Cesium.Cartesian3.normalize(direction, direction);

  // Create a reference up direction (the default cylinder's up direction)
  const up = new Cesium.Cartesian3(0, 0, 1);

  // Compute the cross product to find the rotation axis
  const rotationAxis = new Cesium.Cartesian3();
  Cesium.Cartesian3.cross(up, direction, rotationAxis);
  Cesium.Cartesian3.normalize(rotationAxis, rotationAxis);

  // Compute the angle of rotation
  const dotProduct = Cesium.Cartesian3.dot(up, direction);
  const angle = Math.acos(dotProduct);

  // Create the quaternion from axis and angle
  const orientation = Cesium.Quaternion.fromAxisAngle(rotationAxis, angle);

  const center = Cesium.Cartesian3.midpoint(
    start,
    end,
    new Cesium.Cartesian3()
  );

  return viewer.entities.add({
      position: center,
      orientation: orientation,
      cylinder: {
          length: length,
          topRadius: radius,
          bottomRadius: radius,
          material: Cesium.Color.RED.withAlpha(0.5),
      },
  });
}

// Function to check if a point is inside a disk
function isInsideDisk(point, centerPoint, normalDirection, radius) {
  // Ensure the point is on the disk's plane
  const vectorFromCenterToPoint = Cesium.Cartesian3.subtract(
    point,
    centerPoint,
    new Cesium.Cartesian3()
  );
  const dot = Cesium.Cartesian3.dot(vectorFromCenterToPoint, normalDirection);

  // If the dot product is not close to 0, the point is not on the plane of the disk
  if (Math.abs(dot) > 1e-6) return false;

  // Check if the point is within the radius of the disk
  const distanceFromCenter = Cesium.Cartesian3.magnitude(
    vectorFromCenterToPoint
  );

  return distanceFromCenter <= radius;
}

function findPointsInsideDiskOnCylinder(startPoint, endPoint, radius) {
  const length = Cesium.Cartesian3.distance(startPoint, endPoint);
  const resolution = 0.01; // one disk every 0.01 units for instance
  const segments = Math.ceil(length / resolution);
  const pointsInsideCylinder = [];
  const uniquePoints = new Set(); // Store unique points as string representations

  const direction = Cesium.Cartesian3.subtract(
      endPoint,
      startPoint,
      new Cesium.Cartesian3()
  );
  Cesium.Cartesian3.normalize(direction, direction);

  for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const diskCenter = Cesium.Cartesian3.lerp(
          startPoint,
          endPoint,
          t,
          new Cesium.Cartesian3()
      );

      // Iterate over the radius of the disk
      for (let r = 0; r <= radius; r += 0.01) {
          for (let angle = 0; angle < 360; angle += 30) {
              const a = diskCenter.x + r * Math.cos(Cesium.Math.toRadians(angle));
              const b = diskCenter.y + r * Math.sin(Cesium.Math.toRadians(angle));
              const c = diskCenter.z;
              const point = new Cesium.Cartesian3(a, b, c);

              // Convert point to a unique string representation
              const pointStr = `${point.x},${point.y},${point.z}`;

              // Check if the point is inside the disk and if it's unique
              if (
                  isInsideDisk(point, diskCenter, direction, radius) &&
                  !uniquePoints.has(pointStr)
              ) {
                  const windowPosition =
                      Cesium.SceneTransforms.wgs84ToWindowCoordinates(
                          viewer.scene,
                          point
                      );
                      console.log(windowPosition);
                      if (windowPosition) {
                        const pickedObject = getPosition(windowPosition);
                        if (Cesium.defined(pickedObject)) {
                          pointsInsideCylinder.push(point);
                          // console.log("r: "+r+" angle: "+angle);
                          addMark(point)
                          
                          uniquePoints.add(pointStr); // Add the point string representation to the set
                      }
                  }
              }
          }
      }
  }

  return pointsInsideCylinder;
}



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
  console.log("clicked");

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

      // Create the cylinder with a radius of 100 meters
      // cylinder = createCylinder(startPoint, endPoint, 0.05);

      measurementComplete = true;

      

      const intersectingPoints = findPointsInsideDiskOnCylinder(startPoint, endPoint, 0.5);
      console.log(intersectingPoints);
      // intersectingPoints && intersectingPoints.forEach((point) => addMark(point));

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
    cylinder = null;
  }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
