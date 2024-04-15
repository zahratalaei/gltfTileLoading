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
        const desiredPoints = getIntersectingPoints(startPoint, endPoint, 0.05);
        desiredPoints.map(point =>{
          addMark(point)
        })

      }
      const endTime = performance.now()
      console.log("time:" , endTime-startTime);
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
function getPolylineBoundingBox(start, end, buffer = 2) {
  const startWindowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, start);
  const endWindowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, end);

  return {
      minX: Math.min(startWindowPos.x, endWindowPos.x) - buffer,
      maxX: Math.max(startWindowPos.x, endWindowPos.x) + buffer,
      minY: Math.min(startWindowPos.y, endWindowPos.y) - buffer,
      maxY: Math.max(startWindowPos.y, endWindowPos.y) + buffer
  };
}
// function getPolylineBoundingBox3D(start, end, buffer) {
//   // A buffer in 3D. For simplicity, we're using the same buffer value for all x, y, z directions.
//   const bufferVector = new Cesium.Cartesian3(buffer, buffer, buffer);
  
//   return {
//       min: Cesium.Cartesian3.subtract(start, bufferVector, new Cesium.Cartesian3()),
//       max: Cesium.Cartesian3.add(end, bufferVector, new Cesium.Cartesian3())
//   };
// }

// function getIntersectingPoints(start, end, distance) {
//   const boundingBox3D = getPolylineBoundingBox3D(start, end, distance);
//   console.log(boundingBox3D);
//   const intersectingPoints = [];

//   // Define the steps for x, y, and z. Adjust as needed.
//   const stepSize = 0.002; 

//   for (let x = boundingBox3D.min.x; x <= boundingBox3D.max.x; x += stepSize) {
//     console.log(x);
//       for (let y = boundingBox3D.min.y; y <= boundingBox3D.max.y; y += stepSize) {
//           for (let z = boundingBox3D.min.z; z <= boundingBox3D.max.z; z += stepSize) {
//               const potentialPoint = new Cesium.Cartesian3(x, y, z);
              
//               const dist = distancePointToSegment(potentialPoint, start, end);
//               if (dist <= distance) {
//                   intersectingPoints.push(potentialPoint);
//                   addMark(potentialPoint);
//               }
//           }
//       }
//   }
//   console.log("done");
//   return intersectingPoints;
// }

function getIntersectingPoints(start, end, distance) {
   const boundingBox = getPolylineBoundingBox(start, end, distance);
   const intersectingPoints = [];
   let filteredP = [];

  const stepSizeX = Math.max(2, (boundingBox.maxX - boundingBox.minX) / 150);
  const stepSizeY = Math.max(2, (boundingBox.maxY - boundingBox.minY) / 150);

  for (let x = boundingBox.minX; x <= boundingBox.maxX; x += stepSizeX) {
      for (let y = boundingBox.minY; y <= boundingBox.maxY; y += stepSizeY) {
          const windowPosition = new Cesium.Cartesian2(x, y);

          //const pickedFeature = scene.pick(windowPosition);

         // if (scene.pickPositionSupported && Cesium.defined(pickedFeature)) {

            const pickedPoint = getPosition(windowPosition);
            // console.log(pickedPoint);
            if(Cesium.defined(pickedPoint))
            {const dist = distancePointToSegment(pickedPoint, start, end);

            // console.log(`Window Position: ${windowPosition}, Picked Point: ${pickedPoint}, Distance: ${dist}`);
            if (dist <= distance) {
              // console.log(dist);
              intersectingPoints.push(pickedPoint);

              // addMark(pickedPoint)

            }

         //     }
          }
      }
  }
// console.log("done");
filteredP = filterClosePoints(intersectingPoints, 0.01);
  return filteredP;
}

function filterClosePoints(points, threshold) {
  // console.log("🚀points:", points)

  const filteredPoints = [];
  for (let i = 0; i < points.length; i++) {
    let isClose = false;
    for (let j = 0; j < filteredPoints.length; j++) {
      const distance = Cesium.Cartesian3.distance(points[i], filteredPoints[j]);
      if (distance < threshold) {
        isClose = true;
        break;
      }
    }
    if (!isClose) {
      filteredPoints.push(points[i]);
    }
  }

  console.log("🚀filteredPoints:", filteredPoints)
  return filteredPoints;
}


// function distancePointToSegment(point, start, end) {
//   const startToEnd = Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3());
//   const startToPoint = Cesium.Cartesian3.subtract(point, start, new Cesium.Cartesian3());
 
//   const dotProduct = Cesium.Cartesian3.dot(startToEnd, startToPoint);
//   const lengthSquared = Cesium.Cartesian3.magnitudeSquared(startToEnd);

//   if (dotProduct <= 0 || lengthSquared === 0) {
//     return Cesium.Cartesian3.distance(point, start);
//   } else if (dotProduct >= lengthSquared) {
//     return Cesium.Cartesian3.distance(point, end);
//   } else {
//     const t = dotProduct / lengthSquared;
//     const projection = Cesium.Cartesian3.multiplyByScalar(startToEnd, t, new Cesium.Cartesian3());
//     const closestPointOnSegment = Cesium.Cartesian3.add(start, projection, new Cesium.Cartesian3());
//     return Cesium.Cartesian3.distance(point, closestPointOnSegment);
//   }
// }

// function millimetersToDegrees(millimeters, latitude) {
//   const metersToDegrees = 1 / 111000; // Approximate value for latitude close to 45 degrees
//   const latBuffer = millimeters * 0.001 * metersToDegrees;
//   const lngBuffer = (millimeters * 0.001 * metersToDegrees) / Math.cos(Cesium.Math.toRadians(latitude));
//   return { lat: latBuffer, lng: lngBuffer };
// }

// function getPolylineBoundingBox(start, end, d) {
//   const startCartographic = Cesium.Cartographic.fromCartesian(start);
//   const endCartographic = Cesium.Cartographic.fromCartesian(end);
//   const millimeters = d * 1000;
//   const buffer = millimetersToDegrees(millimeters, startCartographic.latitude); // Added latitude here
//   const boundingBox = {
//     minLongitude: Math.min(startCartographic.longitude, endCartographic.longitude) - buffer.lng,
//     maxLongitude: Math.max(startCartographic.longitude, endCartographic.longitude) + buffer.lng,
//     minLatitude: Math.min(startCartographic.latitude, endCartographic.latitude) - buffer.lat,
//     maxLatitude: Math.max(startCartographic.latitude, endCartographic.latitude) + buffer.lat,
//     minHeight: Math.min(startCartographic.height, endCartographic.height) ,
//     maxHeight: Math.max(startCartographic.height, endCartographic.height) ,
//   };

//   // Add a rectangle entity to represent the bounding box
//   viewer.entities.add({
//     rectangle: {
//       coordinates: Cesium.Rectangle.fromDegrees(
//         Cesium.Math.toDegrees(boundingBox.minLongitude),
//         Cesium.Math.toDegrees(boundingBox.minLatitude),
//         Cesium.Math.toDegrees(boundingBox.maxLongitude),
//         Cesium.Math.toDegrees(boundingBox.maxLatitude)
//       ),
//       material: Cesium.Color.RED.withAlpha(0.5), // Semi-transparent red color
//     },
//   });

//   return boundingBox;
// }


// function getIntersectingPoints(start, end, distance) {
//   const boundingBox = getPolylineBoundingBox(start, end, distance);
//   console.log(boundingBox);
//   const intersectingPoints = [];
//   const stepSizeLng = (boundingBox.maxLongitude - boundingBox.minLongitude) / 360; // Adjusted step size
//   const stepSizeLat = (boundingBox.maxLatitude - boundingBox.minLatitude) / 180; // Adjusted step size
//   const stepSizeHeight = (boundingBox.maxHeight - boundingBox.minHeight) / 200; // Adjusted step size
// let pickedFeature;
//   for (let lng = boundingBox.minLongitude; lng <= boundingBox.maxLongitude; lng += stepSizeLng) {
//     for (let lat = boundingBox.minLatitude; lat <= boundingBox.maxLatitude; lat += stepSizeLat) {
//       for (let height = boundingBox.minHeight; height <= boundingBox.maxHeight; height += stepSizeHeight) {
//         const positionCartographic = new Cesium.Cartographic(lng, lat, height);
//         const positionCartesian = convertToCartesianFromCartographic(positionCartographic);
//         //const windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, positionCartesian);
        
//         if (scene.pickPositionSupported && Cesium.defined(pickedFeature)) {
//           const dist = distancePointToSegment(positionCartesian, start, end);
          
//           if (dist <= distance) {
//             intersectingPoints.push(positionCartesian);
//             addMark(positionCartesian);
//           }
//         }
//       }
//     }
//   }
//   return intersectingPoints;
// }

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
