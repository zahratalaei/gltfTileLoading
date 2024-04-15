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
let i;
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

  if (!measurementComplete) {
    if (!startPoint) {

      startPoint = getPosition(click.position);
console.log(startPoint);     

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
      
      distance = Cesium.Cartesian3.distance(startPoint, endPoint);

     

      addMark(endPoint);
      console.log(endPoint);
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
      const arrow = viewer.entities.add({
        polyline: {
          positions: [startPoint,endPoint],
          width: 10,
          arcType: Cesium.ArcType.NONE,
          material: new Cesium.PolylineArrowMaterialProperty(
            Cesium.Color.YELLOW
          ),
        },
      });

      const intersectionMarkers = [];
      const intersectingPoints = []
        const pickedFeatures = [];
        let objectsToExclude = [];
        let fIntersectingPoints=[]
        function reset() {
          objectsToExclude = [startPoint, endPoint, arrow];
          for (i = 0; i < pickedFeatures.length; ++i) {
            pickedFeatures[i].color = Cesium.Color.fromAlpha(
              Cesium.Color.WHITE,
              pickedFeatures[i].color.alpha
            );
          }
          for (i = 0; i < intersectionMarkers.length; ++i) {
            viewer.entities.remove(intersectionMarkers[i]);
            objectsToExclude.push(intersectionMarkers[i]);
          }
          pickedFeatures.length = 0;
          intersectionMarkers.length = 0;
        }

        function showIntersections(results) {
          for (i = 0; i < results.length; ++i) {
            const object = results[i].object;
            if (object instanceof Cesium.Cesium3DTileFeature) {
              pickedFeatures.push(object);
              object.color = Cesium.Color.fromAlpha(
                Cesium.Color.YELLOW,
                object.color.alpha
              );
            }
            intersectionMarkers.push(
              viewer.entities.add({
                position: results[i].position,
                ellipsoid: {
                  radii: new Cesium.Cartesian3(3.0, 3.0, 3.0),
                  material: Cesium.Color.RED,
                },
              })
            );
          }
        }
        function pickFromRay() {
          reset();
          const start = startPoint;
          const end = endPoint;
          const direction = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );
        
          // Number of segments to break the ray into
          const numSegments = 100;
        
          // Iterate over the segments and find the first intersection
          for (let i = 0; i < numSegments; i++) {
            const t = i / numSegments;
            const point = Cesium.Cartesian3.lerp(start, end, t, new Cesium.Cartesian3());
            //console.log(point);
            const windowPosition = scene.cartesianToCanvasCoordinates(point);
            // console.log(windowPosition);
            const results = scene.drillPick(windowPosition,1,2);
            if (results && results.length > 0) {
              // console.log(results[0].primitive._position);
              intersectingPoints.push(results[0].primitive._position)
              }
             
          }
        
          if(intersectingPoints){
            intersectingPoints.map(p =>{
              if (scene.pickPositionSupported && Cesium.defined(p)){
                fIntersectingPoints.push(p)
              }
            } )
          }
        // console.log(fIntersectingPoints);
        }
        
        pickFromRay()
      // Mark the measurement as complete
      measurementComplete = true;
      
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




