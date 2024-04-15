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
  console.log(click.position);

  if (!measurementComplete) {
    if (!startPoint) {
      startPoint = getPosition(click.position);
      // polyline = new Cesium.PolylineGraphics();
      // polyline.material = Cesium.Color.RED;
      // polyline.width = 3;
      // polyline.positions = new Cesium.CallbackProperty(function () {
      //   return [startPoint, middlePoint].filter(
      //     (position) => position !== null
      //   );
      // }, false);
      // viewer.entities.add({
      //   polyline: polyline,
      // });
      //  console.log("startPoint"+startPoint);
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
      // console.log("endPoint"+endPoint);
      // polyline.positions = new Cesium.CallbackProperty(function () {
      //   return [startPoint, endPoint].filter((position) => position !== null);
      // }, false);
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

      if ((startPoint, endPoint)) {
        getIntersectingPoints(startPoint, endPoint, 0.2);
      }
      // console.log(intersectingPoints);
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
    measurementComplete = false; // Reset the flag to allow new measurements
    highlightDiv.style.display = "none";
  }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);



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

function millimetersToDegrees(millimeters, latitude) {
  const metersToDegrees = 1 / 111000; // Approximate value for latitude close to 45 degrees
  const latBuffer = millimeters * 0.001 * metersToDegrees;
  const lngBuffer = (millimeters * 0.001 * metersToDegrees) / Math.cos(Cesium.Math.toRadians(latitude));
  return { lat: latBuffer, lng: lngBuffer };
}

function getPolylineBoundingBox(start, end, d) {
  const startCartographic = Cesium.Cartographic.fromCartesian(start);
  const endCartographic = Cesium.Cartographic.fromCartesian(end);
  const millimeters = d * 1000;
  const buffer = millimetersToDegrees(d, startCartographic.latitude); // Added latitude here
  const boundingBox = {
    minLongitude: Math.min(startCartographic.longitude, endCartographic.longitude) - buffer.lng,
    maxLongitude: Math.max(startCartographic.longitude, endCartographic.longitude) + buffer.lng,
    minLatitude: Math.min(startCartographic.latitude, endCartographic.latitude) - buffer.lat,
    maxLatitude: Math.max(startCartographic.latitude, endCartographic.latitude) + buffer.lat,
    minHeight: Math.min(startCartographic.height, endCartographic.height),
    maxHeight: Math.max(startCartographic.height, endCartographic.height),
  };
  // Add a rectangle entity to represent the bounding box
  viewer.entities.add({
    rectangle: {
      coordinates: new Cesium.Rectangle(
        boundingBox.minLongitude,
        boundingBox.minLatitude,
        boundingBox.maxLongitude,
        boundingBox.maxLatitude
      ),
      material: Cesium.Color.RED.withAlpha(0.5) // Semi-transparent red color
    }
  });

  return boundingBox;
}





// function getPolylineBoundingBox(start, end, d) {
//   const startCartographic = Cesium.Cartographic.fromCartesian(start);
//   const endCartographic = Cesium.Cartographic.fromCartesian(end);
//   const millimeters = d * 1000;
//   const buffer = millimetersToDegrees(d, startCartographic.latitude); // Assuming millimetersToDegrees returns a buffer in radians

//   const boundingBox = {
//       minX: Cesium.Math.toDegrees(Math.min(startCartographic.longitude, endCartographic.longitude) - buffer.lng),
//       maxX: Cesium.Math.toDegrees(Math.max(startCartographic.longitude, endCartographic.longitude) + buffer.lng),
//       minY: Cesium.Math.toDegrees(Math.min(startCartographic.latitude, endCartographic.latitude) - buffer.lat),
//       maxY: Cesium.Math.toDegrees(Math.max(startCartographic.latitude, endCartographic.latitude) + buffer.lat),
//       // minHeight: Math.min(startCartographic.height, endCartographic.height),
//       // maxHeight: Math.max(startCartographic.height, endCartographic.height),
//   };

  
//   return boundingBox;
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
      return Cesium.Cartesian3.distance(point, closestPointOnSegment);
    }
  }

//   function cartesianToLonLat(cartesian) {
//     const ellipsoid = viewer.scene.globe.ellipsoid;
//     const cartographic = ellipsoid.cartesianToCartographic(cartesian);
//     return [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)];
// }
// function lonLatToWindowPosition(lon, lat) {
 
//   // Convert lon/lat to Cartesian3
//   const position = Cesium.Cartesian3.fromDegrees(lon, lat);

//   // Convert world Cartesian3 to camera coordinates
//   const cameraPosition = scene.camera.worldToCameraCoordinatesPoint(position);

//   // Convert camera coordinates to window (canvas) coordinates
//   const windowPosition = scene.cartesianToCanvasCoordinates(cameraPosition);

//   return windowPosition;
// }
//   function getIntersectingPoints(start, end, distance) {
//     const boundingBox = getPolylineBoundingBox(start, end, distance);
//     const startLonLat = cartesianToLonLat(start);
//     const endLonLat = cartesianToLonLat(end);
//     var line = turf.lineString([startLonLat,endLonLat]);

//   console.log(boundingBox);
//   const bbox =  turf.bbox(line);
  

//   console.log(bbox);
//   const randomPoints = turf.randomPoint(500,{bbox:[boundingBox.maxX,boundingBox.minY,boundingBox.minX,boundingBox.maxY]})
//     // const turfStart = turf.point(startPoint);
//   // console.log(turfStart);
//   const intersectingPoints = [];
//   console.log(randomPoints);
//   // console.log(line);
//   randomPoints.features.forEach(p => {
//     const [lon, lat] = p.geometry.coordinates; // Extracting lon and lat from the GeoJSON point's geometry
//     const windowPosition = lonLatToWindowPosition(lon, lat);
//     // const pickedPoint = get
//  // Add point to Cesium viewer for visualization
 
//   //  console.log(windowPosition);
// });
// randomPoints.features.map(p => {
//   // console.log("Point:", p.geometry);
//   // console.log("Line:", line.geometry);
//   var dist = turf.pointToLineDistance(p, line, {units: 'kilometers'});
//   if(dist*1000 < distance){
//   console.log(dist*1000);
//   intersectingPoints.push(p)
// }
// })
    // const rectangle = new Cesium.Rectangle(
    //   boundingBox.minLongitude,
    //   boundingBox.minLatitude,
    //   boundingBox.maxLongitude,
    //   boundingBox.maxLatitude
    // );
  
    // const stepSizeLng = (boundingBox.maxLongitude - boundingBox.minLongitude) / 0.1;
    // const stepSizeLat = (boundingBox.maxLatitude - boundingBox.minLatitude) / 0.2;
    // const stepSizeHeight = (boundingBox.maxHeight - boundingBox.minHeight) / 100;
  
    // for (let lng = boundingBox.minLongitude; lng <= boundingBox.maxLongitude; lng += stepSizeLng) {
    //   for (let lat = boundingBox.minLatitude; lat <= boundingBox.maxLatitude; lat += stepSizeLat) {
    //     for (let height = boundingBox.minHeight; height <= boundingBox.maxHeight; height += stepSizeHeight) {
    //       const positionCartographic = new Cesium.Cartographic(lng, lat, height);
  
    //       // Check if the point is inside the rectangle
    //       if (Cesium.Rectangle.contains(rectangle, positionCartographic)) {
    //         const positionCartesian = convertToCartesianFromCartographic(positionCartographic);
    //         const dist = distancePointToSegment(positionCartesian, start, end);
    //         if (dist <= distance) {
    //           intersectingPoints.push(positionCartesian);
    //           addMark(positionCartesian);
    //         }
    //       }
    //     }
    //   }
    // }
  //   console.log(intersectingPoints);
  //   return intersectingPoints;
  // }
  

function getIntersectingPoints(start, end, distance) {
  const boundingBox = getPolylineBoundingBox(start, end, distance);
  console.log(boundingBox);
  const intersectingPoints = [];
  const stepSizeLng = (boundingBox.maxLongitude - boundingBox.minLongitude) / 0.1; // Adjusted step size
  const stepSizeLat = (boundingBox.maxLatitude - boundingBox.minLatitude) /0.2 ; // Adjusted step size
  const stepSizeHeight = (boundingBox.maxHeight - boundingBox.minHeight) / 100; // Adjusted step size
let pickedFeature;
  for (let lng = boundingBox.minLongitude; lng <= boundingBox.maxLongitude; lng += stepSizeLng) {
    for (let lat = boundingBox.minLatitude; lat <= boundingBox.maxLatitude; lat += stepSizeLat) {
      for (let height = boundingBox.minHeight; height <= boundingBox.maxHeight; height += stepSizeHeight) {
        const positionCartographic = new Cesium.Cartographic(lng, lat, height);
        const positionCartesian = convertToCartesianFromCartographic(positionCartographic);
        const windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, positionCartesian);
        pickedFeature = getPosition(windowPosition)
        // pickedFeature=scene.pick(windowPosition,1,1)
        // if (scene.pickPositionSupported && Cesium.defined(pickedFeature)) {
          if(start & end){
          const dist = distancePointToSegment(pickedFeature, start, end);
          if (dist <= distance) {
            intersectingPoints.push(positionCartesian);
            console.log(intersectingPoints);
            addMark(positionCartesian);
          }
        // }
          }
      }
    }
  }
  return intersectingPoints;
}


