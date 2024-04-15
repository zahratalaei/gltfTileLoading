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
let selectedEntity = null;
let isMouseDown = false;
let isEntitySelected = false;

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
///Add model
async function addModelAtPosition(position) {
  try {
    const cartographicPosition = Cesium.Cartographic.fromCartesian(position);
    const cartographicPositions = [cartographicPosition];

    // Use the terrainProvider from viewer
    const terrainProvider = viewer.terrainProvider;

    await Cesium.sampleTerrainMostDetailed(
      terrainProvider,
      cartographicPositions
    );
    const height = cartographicPositions[0].height;

    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(
        Cesium.Math.toDegrees(cartographicPosition.longitude),
        Cesium.Math.toDegrees(cartographicPosition.latitude),
        height+10.185987581610545 )
    );

    let model = await Cesium.Model.fromGltfAsync({
      url: './assets/model/scene.gltf',
      modelMatrix: modelMatrix,
      scale: 10.0,
      maximumScale: 10.0,
      color: Cesium.Color.BLUE,
      silhouetteColor: undefined,
      silhouetteSize: undefined,
      heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND,
      // debugShowBoundingVolume:true,
      debugWireframe:true
    });
    let unique = generateUniqueID(position)
    model.id = unique;
    viewer.scene.primitives.add(model);

    // console.log(modelMatrix);
    // console.log(model._boundingSphere.center);
    console.log(model);
    setTimeout(() => {
      const mesh = model._nodesByName.Mesh4;
      const runtime = mesh.runtimeNode
      console.log("setTimeout  mesh:", runtime);

  }, 1500);
   
// console.log(model);
    return model;

  } catch (error) {
    console.error("Failed to load model:", error);
  }
}



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

function handleRightClick(click) {
  const position = getPosition(click.position);
  if (position) {
    //   addModelAtPosition(position);
    const heightOffset = 10; // Replace this with the actual offset for your model
    addModelAtPosition(position, heightOffset);
  }
}

// Handle full click event for selecting
function handleLeftClick(click) {
  const pickedObject = viewer.scene.pick(click.position);
  
  if (isEntitySelected) {
    isEntitySelected = false;

    if (selectedEntity.model) {
      selectedEntity.model.silhouetteColor = undefined;
      selectedEntity.model.silhouetteSize = undefined;
    }

    
    selectedEntity = null;
  } else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
    isEntitySelected = true;
    selectedEntity = pickedObject.detail;
    if (selectedEntity.model) {
      selectedEntity.model.silhouetteColor = Cesium.Color.YELLOW;
      selectedEntity.model.silhouetteSize = 2;
      console.log(selectedEntity.model.position);
    }
    
  }
}



async function updateModelPosition(model, newPosition) {
  const cartographicPosition = Cesium.Cartographic.fromCartesian(newPosition);
  const height = cartographicPosition.height;
  
  const newModelMatrix = await Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(
          Cesium.Math.toDegrees(cartographicPosition.longitude),
          Cesium.Math.toDegrees(cartographicPosition.latitude),
          height
      )
  );
  const originalScale = model.scale;
  model.modelMatrix = newModelMatrix;
  model.scale = originalScale;
}

async function handleDrag(movement) {
  if (selectedEntity && isEntitySelected) {
      const endPosition = movement.endPosition;
      let newPosition = getPosition(endPosition);

      if (newPosition) {
          // Update position with terrain height
          await updateModelPosition(selectedEntity.model, newPosition);
      }
  }
}

// Existing handleMouseDown function, no changes
function handleMouseDown(click) {
  const pickedObject = viewer.scene.pick(click.position);
  if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
    selectedEntity = pickedObject.id;
  }
}

handler.setInputAction(
  handleRightClick,
  Cesium.ScreenSpaceEventType.RIGHT_CLICK
);
handler.setInputAction(handleLeftClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
handler.setInputAction(handleDrag, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
// Listen for the "Delete" key press to remove selected entity
document.addEventListener("keydown", function (event) {
  if (event.key === "Delete" || event.key === "Backspace") {
    if (selectedEntity && isEntitySelected) {
      deleteObject(selectedEntity);
      selectedEntity = null;
      isEntitySelected = false;
    }
  }
});

function deleteObject(entity) {
  // Your existing logic to remove the entity
  viewer.entities.remove(entity);

  
}
