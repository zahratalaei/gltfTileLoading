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
let points = [];
let movingPoint = null;  // This variable will keep track of the point we're moving
let unique=null;
let selectedPoints = [];
let selectedPointIDs = [];
let selectedPoint=null;
let selectedEntity=null;

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
function addMark(position,id) {
  const entity = viewer.entities.add({
    id:id,
    position: position,
    point: {
      pixelSize: 10,
      color: Cesium.Color.YELLOW,
      outlineColor: null,
      outlineWidth: null,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
  return entity;
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

// Converts a 3D point to a local 2D coordinate system defined by a base and a direction
function toLocal2D(base, direction, point) {
  const u = Cesium.Cartesian3.normalize(direction, new Cesium.Cartesian3());
  const v = Cesium.Cartesian3.cross(u, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3());
  
  const diff = Cesium.Cartesian3.subtract(point, base, new Cesium.Cartesian3());
  
  return {
    x: Cesium.Cartesian3.dot(u, diff),
    y: Cesium.Cartesian3.dot(v, diff)
  };
}
function to3D(start, normalizedDirection, localPoint) {
  const right = Cesium.Cartesian3.cross(normalizedDirection, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3());
  const up = Cesium.Cartesian3.cross(right, normalizedDirection, new Cesium.Cartesian3());

  const xComp = Cesium.Cartesian3.multiplyByScalar(normalizedDirection, localPoint.x, new Cesium.Cartesian3());
  const yComp = Cesium.Cartesian3.multiplyByScalar(up, localPoint.y, new Cesium.Cartesian3());
  
  const offset = Cesium.Cartesian3.add(xComp, yComp, new Cesium.Cartesian3());
  return Cesium.Cartesian3.add(start, offset, new Cesium.Cartesian3());
}

function computeCatenaryPointsWithTwoPoints(start, end, sag, segments = 100) {
  points = [];
  const direction = Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3());
  const length = Cesium.Cartesian3.magnitude(direction);
  const normalizedDirection = Cesium.Cartesian3.normalize(direction, new Cesium.Cartesian3());

  const a = sag / 2;

  for (let i = 0; i <= segments; i++) {
      const alpha = i / segments;
      const xi = alpha * length; // adjust this to make xi go from 0 to length
      const yi = a * (Math.cosh((xi - length / 2) / a) - Math.cosh(-length / (2 * a)));

      const localPoint = {
          x: xi,
          y: yi
      };

      const point3D = to3D(start, normalizedDirection, localPoint);
      points.push(point3D);
  }

  return points;
}
handler.setInputAction(function (click) {
  
    
  const clickedPoint = getPosition(click.position);
  if (!clickedPoint) {
    return; // Ignore clicks on empty space
  }
  let uniqueID = generateUniqueID(clickedPoint);
  if (startPoint && endPoint) {
    if (selectedPointIDs.includes(uniqueID)) {
      selectedEntity = viewer.entities.getById(uniqueID);
      selectedEntity.point.outlineColor = Cesium.Color.RED;
      selectedEntity.point.outlineWidth = 2;
   
      if (startPoint && Cesium.Cartesian3.equals(startPoint, clickedPoint)) {
         selectedPoint = 'startPoint';
      } else if (endPoint && Cesium.Cartesian3.equals(endPoint, clickedPoint)) {
         selectedPoint = 'endPoint';
      }
   }
  }else if (!startPoint) {
      // const position = getPosition(click.position);
      if (clickedPoint) {
          startPoint = clickedPoint;
          console.log(startPoint);
          selectedPointIDs.push(uniqueID);
          const markEntity=addMark(startPoint, uniqueID);
          selectedPoints.push({id:uniqueID,position:clickedPoint,markEntity:markEntity});
          return;
      }
  }else if (!endPoint) {
      if (clickedPoint) {
          endPoint = clickedPoint;
          selectedPointIDs.push(uniqueID);
          const markEntity=addMark(endPoint, uniqueID);
          selectedPoints.push({id:uniqueID,position:clickedPoint,markEntity:markEntity});

          const sag = Cesium.Cartesian3.distance(startPoint, endPoint) * 2;
          const catenaryPoints = computeCatenaryPointsWithTwoPoints(startPoint, endPoint, sag);

          polyline = viewer.entities.add({
              polyline: {
                  positions: catenaryPoints,
                  width: 2,
                  material: Cesium.Color.RED
              }
          });
      }
      
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);


handler.setInputAction(function (movement) {
  if (selectedPoint) {
    console.log('Moving:', selectedPoint);
      const newPosition = getPosition(movement.endPosition);
      if (newPosition) {
          if (selectedPoint === 'startPoint') {
              startPoint = newPosition;
          } else {
              endPoint = newPosition;
          }

          viewer.entities.removeAll();

          addMark(startPoint, 'startPoint');
          addMark(endPoint, 'endPoint');

          const sag = Cesium.Cartesian3.distance(startPoint, endPoint) * 2;
          computeCatenaryPointsWithTwoPoints(startPoint, endPoint, sag);

          polyline = viewer.entities.add({
              polyline: {
                  positions: points,
                  width: 2,
                  material: Cesium.Color.RED
              }
          });
      }
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

handler.setInputAction(function () {
  selectedPoint = null;
}, Cesium.ScreenSpaceEventType.LEFT_UP);

handler.setInputAction(function () {
  viewer.entities.removeAll(); // Removes all entities. If you have other entities, be cautious!
  points = []; // Reset points for next catenary
  startPoint = null;
    endPoint = null;
    polyline = null;
    selectedPointIDs=[];
    selectedPoints=[];
    selectedPoint=null;
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

handler.setInputAction(function (movement) {
  if (selectedPoint) {
    const newPosition = getPosition(movement.endPosition);

    if (newPosition) {
      if (selectedPoint === 'startPoint') {
        startPoint = newPosition;
      } else if (selectedPoint === 'endPoint') {
        endPoint = newPosition;
      }

      viewer.entities.removeAll(); // You may want to be careful with this if you have other entities

      // Add the marks again after removing all entities
      addMark(startPoint, generateUniqueID(startPoint));
      addMark(endPoint, generateUniqueID(endPoint));

      const sag = Cesium.Cartesian3.distance(startPoint, endPoint) * 2;
      computeCatenaryPointsWithTwoPoints(startPoint, endPoint, sag);

      polyline = viewer.entities.add({
        polyline: {
          positions: points,
          width: 2,
          material: Cesium.Color.RED
        }
      });
    }
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);