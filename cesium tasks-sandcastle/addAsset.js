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
let globalCenter = new Cesium.Cartesian3();
let isRotating = false;
let initialMousePosition = null;
let isResizing = false;
let isMoving = false;
// let isShiftDown = false;
let lastMouseY = null;
let centerOfBounding = null;

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
async function addModelAtPosition(position,heightOffset) {
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
        // height + 10.185987581610545
        height + heightOffset
      )
    );

    let model = await Cesium.Model.fromGltfAsync({
      url: "./assets/model/scene.gltf",
      modelMatrix: modelMatrix,
      scale: 10.0,
      maximumScale: 10.0,
      color: Cesium.Color.BLUE,
      silhouetteColor: undefined,
      silhouetteSize: undefined,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      // debugShowBoundingVolume:true,
      // debugWireframe:true
    });
    let unique = generateUniqueID(position);
    model.id = unique;
    viewer.scene.primitives.add(model);
    
    setTimeout(function() {
      if (model.boundingSphere) {
          centerOfBounding = model.boundingSphere.center
      } else {
          console.error("Model's boundingSphere is undefined after delay");
      }
  }, 200);  // 2-second delay



console.log(model);
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
    addModelAtPosition(position,heightOffset);
  }
}

// Handle full click event for selecting
function handleLeftClick(click) {
  const pickedObject = viewer.scene.pick(click.position);

  if (isEntitySelected) {
    if(isResizing){
isResizing =false;
resizeButton.style.background='';
    }else if(isMoving){
      moveButton.style.background='';
isMoving=false;
    }else{
    isEntitySelected = false;
    popup.style.display = "none";

    if (selectedEntity.model) {
      selectedEntity.model.silhouetteColor = undefined;
      selectedEntity.model.silhouetteSize = undefined;
    }

    selectedEntity = null;
  }
    // enableDefaultCameraBehavior(); // Re-enable the camera behavior when deselected
  } else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
    isEntitySelected = true;
    selectedEntity = pickedObject.detail;
    if (selectedEntity.model) {
      selectedEntity.model.silhouetteColor = Cesium.Color.YELLOW;
      selectedEntity.model.silhouetteSize = 2;
    }
    // Assuming you can get the screen position of the model. If not, you can fix the popup at a location on the screen.
    showPopupForModel(click.position);
    // disableDefaultCameraBehavior(); // Disable the camera behavior when selected
  }

 
}

const popup = document.createElement("div");
function showPopupForModel(screenPosition) {
  
  popup.innerHTML = `
    <button id="resizeButton">Resize</button>
    <button id="moveButton">Move</button>
  `;
  popup.style.position = "absolute";
  popup.style.top = `${screenPosition.y}px`;
  popup.style.left = `${screenPosition.x}px`;
  popup.style.display = "block";  
  // Set popup.style.top and popup.style.left based on the modelPosition or fix it somewhere on the screen
  document.body.appendChild(popup);
  
  const resizeButton = document.getElementById("resizeButton");
  const moveButton = document.getElementById("moveButton");

  document.getElementById("resizeButton").addEventListener("click", function() {
    if(!isResizing){
      isMoving= false;
      isResizing = true;
      resizeButton.style.background = "#5A5A5A";
    }else{
      isMoving= false;
      isResizing = false;
      resizeButton.style.background = "";
    }
  });
  document.getElementById("moveButton").addEventListener("click", function() {
    if(!isMoving){
      isMoving=true;
      isResizing=false
      moveButton.style.background = "#5A5A5A";
    }else{
      isMoving= false;
      isResizing = false;
      moveButton.style.background = "";
    }
  });
}

async function handleDrag(movement) {
  if ( selectedEntity && isEntitySelected) {
    if (isResizing) {
      // Handle resizing when the shift key is pressed
      if (lastMouseY === null) {
        lastMouseY = movement.startPosition.y;
      }

      
      // Calculate the movement distance
      const deltaY = movement.endPosition.y - lastMouseY;

      // Determine the scaling factor based on the actual distance the mouse moved
      const scalingFactor = 1 + (deltaY * 0.01); // Here, 0.01 can be adjusted to control the sensitivity
      const currentPosition = selectedEntity.model.boundingSphere.center;
      centerOfBounding=selectedEntity.model.boundingSphere.radius;
      updateModelPosition(selectedEntity.model,currentPosition,centerOfBounding)
      

      // Change the scale of the model
      selectedEntity.model.scale *= scalingFactor;

      lastMouseY = movement.endPosition.y;

      
    } else if(isMoving) {
      const endPosition = movement.endPosition;
      let newPosition = getPosition(endPosition);
      if (newPosition) {
        const cartographic = Cesium.Cartographic.fromCartesian(newPosition);
        const [sampledPoint] = await Cesium.sampleTerrainMostDetailed(
          viewer.terrainProvider,
          [cartographic]
        );

        // Use the height from the sampled point
        const heightWithOffset = sampledPoint.height + 10; // +10 or other appropriate offset for your model
        const updatedPosition = Cesium.Cartesian3.fromDegrees(
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
          heightWithOffset
        );
        await updateModelPosition(selectedEntity.model, updatedPosition);
      }
    }
  }
}

async function updateModelPosition(model, newPosition,offset) {
  const cartographicPosition = Cesium.Cartographic.fromCartesian(newPosition);
  const height = cartographicPosition.height;
  // const offset = model._boundingSphere.center;
  const newModelMatrix = await Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(
      Cesium.Math.toDegrees(cartographicPosition.longitude),
      Cesium.Math.toDegrees(cartographicPosition.latitude),
      height+offset
    )
  );
  const originalScale = model.scale;
  model.modelMatrix = newModelMatrix;
  model.scale = originalScale;
}

// Existing handleMouseDown function, no changes
function handleMouseDown(click) {
  const pickedObject = viewer.scene.pick(click.position);
  if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
    selectedEntity = pickedObject.detail;
    isMouseDown = true;
  }
}

function handleMouseUp(click) {
  isMouseDown = false;
}
handler.setInputAction(handleMouseDown, Cesium.ScreenSpaceEventType.LEFT_DOWN);
handler.setInputAction(handleDrag, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
handler.setInputAction(handleMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP);
handler.setInputAction(handleLeftClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
handler.setInputAction(
  handleRightClick,
  Cesium.ScreenSpaceEventType.RIGHT_CLICK
);
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
  if (entity && entity.model) {
    // Remove the model primitive if it exists on the entity
    viewer.scene.primitives.remove(entity.model);
  } else {
    // If for some reason there's no model on the entity, but it is still an entity, try removing it
    viewer.entities.remove(entity);
  }
}
function disableDefaultCameraBehavior() {
  viewer.scene.screenSpaceCameraController.enableRotate = false;
  viewer.scene.screenSpaceCameraController.enableZoom = false;
  viewer.scene.screenSpaceCameraController.enableLook = false;
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  viewer.scene.screenSpaceCameraController.enableTranslate = false;
}
function enableDefaultCameraBehavior() {
  viewer.scene.screenSpaceCameraController.enableRotate = true;
  viewer.scene.screenSpaceCameraController.enableZoom = true;
  viewer.scene.screenSpaceCameraController.enableLook = true;
  viewer.scene.screenSpaceCameraController.enableTilt = true;
  viewer.scene.screenSpaceCameraController.enableTranslate = true;
}
