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
let handEntity;
let handEntityMap = new Map(); // To store the relationship between objects and hand entities

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
// async function addModelAtPosition(position) {
//   try {
//     const cartographicPosition = Cesium.Cartographic.fromCartesian(position);
//     const cartographicPositions = [cartographicPosition];

//     // Use the terrainProvider from viewer
//     const terrainProvider = viewer.terrainProvider;

//     await Cesium.sampleTerrainMostDetailed(
//       terrainProvider,
//       cartographicPositions
//     );
//     const height = cartographicPositions[0].height;

//     let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
//       Cesium.Cartesian3.fromDegrees(
//         Cesium.Math.toDegrees(cartographicPosition.longitude),
//         Cesium.Math.toDegrees(cartographicPosition.latitude),
//         height
//       )
//     );

//     let model = await Cesium.Model.fromGltfAsync({
//       url: './assets/model/scene.gltf',
//       modelMatrix: modelMatrix,
//       scale: 10.0,
//       maximumScale: 10.0,
//       color: Cesium.Color.BLUE
//     });

//     viewer.scene.primitives.add(model);

//     console.log(modelMatrix);
//     // console.log(model);
//     // console.log(model););
//     // console.log(model._nodesByName.upAxis);
// // console.log(model);
//     return model;

//   } catch (error) {
//     console.error("Failed to load model:", error);
//   }
// }


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

    const model = await viewer.entities.add({
      name: "3D Model",
      position: Cesium.Cartesian3.fromDegrees(
        Cesium.Math.toDegrees(cartographicPosition.longitude),
        Cesium.Math.toDegrees(cartographicPosition.latitude),
        height
      ),
      model: {
        uri: "./assets/model/scene.gltf",
        maximumScale: 10.0,
        scale:10,
        // minimumPixelSize: 50,
        silhouetteColor: undefined,
        silhoobjectuetteSize: undefined,
        color:Cesium.Color.YELLOW
      },
    });
    console.log(model.nodes);
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
  console.log(pickedObject);
  if (isEntitySelected) {
    isEntitySelected = false;

    if (selectedEntity.model) {
      selectedEntity.model.silhouetteColor = undefined;
      selectedEntity.model.silhouetteSize = undefined;
    }

    // Remove the associated hand entity
    const handEntity = handEntityMap.get(selectedEntity.id);
    if (handEntity) {
      viewer.entities.remove(handEntity);
    }

    // Remove the entity ID from the map
    handEntityMap.delete(selectedEntity.id);

    selectedEntity = null;
  } else if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
    isEntitySelected = true;
    selectedEntity = pickedObject.id;
    if (selectedEntity.model) {
      selectedEntity.model.silhouetteColor = Cesium.Color.YELLOW;
      selectedEntity.model.silhouetteSize = 2;
      console.log(selectedEntity.position);
    }
    // Add a hand icon near the selected object
    const offset = new Cesium.Cartesian3(0.0, 0.0, 0.0); // Adjust the offset as needed
    const handPosition = Cesium.Cartesian3.add(
      selectedEntity.position.getValue(),
      offset,
      new Cesium.Cartesian3()
    );

    handEntity = viewer.entities.add({
      position: handPosition,
      billboard: {
        image: "./assets/icons-hand.png", // Replace this with the path to your hand image
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(-10, 0),
        scale: 0.5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // Add this line
      },
    });
    handEntityMap.set(selectedEntity.id, handEntity);
  }
}

// Async function to update position and place it on the terrain
async function updatePositionWithTerrainHeight(cartesianPosition) {
  const cartographicPosition =
    Cesium.Cartographic.fromCartesian(cartesianPosition);
  const cartographicPositions = [cartographicPosition];

  const terrainProvider = viewer.terrainProvider;
  await Cesium.sampleTerrainMostDetailed(
    terrainProvider,
    cartographicPositions
  );

  return Cesium.Cartesian3.fromDegrees(
    Cesium.Math.toDegrees(cartographicPosition.longitude),
    Cesium.Math.toDegrees(cartographicPosition.latitude),
    cartographicPosition.height
  );
}

// Updated handleDrag function
async function handleDrag(movement) {
  if (selectedEntity && isEntitySelected) {
    const endPosition = movement.endPosition;
    let newPosition = getPosition(endPosition);

    if (newPosition) {
      // Update position with terrain height
      newPosition = await updatePositionWithTerrainHeight(newPosition);
      selectedEntity.position = newPosition;

      // Update the handEntity's position to stick to the object
      const offset = new Cesium.Cartesian3(0.0, 0.0, 2.0); // Adjust as needed
      const handPosition = Cesium.Cartesian3.add(
        newPosition,
        offset,
        new Cesium.Cartesian3()
      );
      handEntity.position = handPosition;
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

  // Remove the associated hand entity
  const handEntity = handEntityMap.get(entity.id);
  if (handEntity) {
    viewer.entities.remove(handEntity);
  }

  // Remove the entity ID from the map
  handEntityMap.delete(entity.id);
}
