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
let selectedPoints = []; // Array to store selected points
let selectedPointIDs = []; // Array to store unique IDs of selected points

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
function generateUniqueID(position) {
  // Function to generate a unique ID based on the Cartesian3 position
  const positionString = position.toString();
  let hash = 0;
  for (let i = 0; i < positionString.length; i++) {
    const char = positionString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "ID_" + Math.abs(hash).toString(36);
}
// Function to deselect all points and remove the polyline
function deselectAllPoints() {
  selectedPoints.forEach((point) => {
    viewer.entities.remove(point.markerEntity);
  });
  selectedPoints.length = 0;
  viewer.entities.remove(polyline);
}
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
    if (pickedObject.id && selectedPointIDs.includes(pickedObject.id.id)) { 
      return pickedObject.id.position._value;  // Notice the change here
    }
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

function isPointSelected(clickedPoint) {
  const epsilon = Cesium.Math.EPSILON6;  // tolerance for coordinate comparison
  return selectedPoints.some((point) => {
    return Cesium.Cartesian3.distance(clickedPoint, point.position) < epsilon;
  });
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
highlightDiv.style.display = "none";
viewer.container.appendChild(highlightDiv);


function handleClick(click) {
  const clickedPoint = getPosition(click.position);
  
  console.log(clickedPoint);
  if (!clickedPoint) {
    return; // Ignore clicks on empty space
  }

  let uniqueID = generateUniqueID(clickedPoint);
  
  if (selectedPointIDs.includes(uniqueID)) {
    
    // If the point is already selected, de-select it
    const deselectedPointIndex = selectedPoints.findIndex(
      (point) => point.id === uniqueID
    );

    if (deselectedPointIndex !== -1) {
      viewer.entities.remove(selectedPoints[deselectedPointIndex].markerEntity);
      selectedPoints.splice(deselectedPointIndex, 1);

      // Remove the point's unique ID from the selectedPointIDs array
      selectedPointIDs = selectedPointIDs.filter((id) => id !== uniqueID);
      const deselectedPoint = viewer.entities.getById(uniqueID);
    if (deselectedPoint) {
      viewer.entities.remove(deselectedPoint);
    }
      
    }
  } else {
    // If the point is not selected, add it to the selectedPointIDs array
    selectedPointIDs.push(uniqueID);

    // Add marker to the selected point
    const markerEntity = viewer.entities.add({
      id: uniqueID,
      position: clickedPoint,
      point: {
        pixelSize: 10,
        color: Cesium.Color.GREEN,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    selectedPoints.push({
      id: uniqueID,
      position: clickedPoint,
      markerEntity: markerEntity,
    });
  }
}
// Add event listener for LEFT_CLICK to handle point selection/deselection
handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);