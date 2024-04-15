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
let distance=null;
let points = []; // Array to hold all points
let polylines = []; // Array to hold all polylines
let labels = []; // Array to hold all labels
let point = null;
let tempPolyline = null; // Temporary polyline for dynamic display
let selectedPoints = []; // Array to store selected points
let selectedPointIDs = []; // Array to store unique IDs of selected points

(async function () {
    try {
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(16421);
        viewer.scene.primitives.add(tileset);
        tileset.style = new Cesium.Cesium3DTileStyle();
        tileset.style.pointSize = '5';
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

function addMark(position) {
    const uniqueID = generateUniqueID(position);
    selectedPointIDs.push(uniqueID);
    const markerEntity = viewer.entities.add({
        id: uniqueID,
        position: position,
        point: {
            pixelSize: 10,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
    });
    selectedPoints.push({
        id: uniqueID,
        position: position,
        markerEntity: markerEntity,
    });
}

function getPosition(position) {
    const pickedObject = scene.pick(position);
    if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
        if (pickedObject.id && selectedPointIDs.includes(pickedObject.id.id)) { 
            return pickedObject.id.position._value;  // Return the position of the selected point
        }
        const point = scene.pickPosition(position);
        if (Cesium.defined(point)) {
            const cartographic = Cesium.Cartographic.fromCartesian(point);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const height = cartographic.height;
            const pointToCartesian = Cesium.Cartesian3.fromDegrees(
                lng,
                lat,
                height
            );
            return pointToCartesian;
        }
    }
    return null;
}

function handleMouseMove(movement) {
    middlePoint = getPosition(movement.endPosition);
    if (tempPolyline) {
        viewer.entities.remove(tempPolyline);
    }
    tempPolyline = viewer.entities.add({
        polyline: {
            positions: [startPoint, middlePoint].filter(position => position !== null),
            material: Cesium.Color.RED,
            width: 3,
            depthFailMaterial: Cesium.Color.RED,
        },
    });
}

function handleClick(click) {
    const clickedPoint = getPosition(click.position);
  
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

            // Update polyline positions
            if (polyline) {
                const polylinePositions = selectedPoints.map(point => point.position);
                polyline.polyline.positions = polylinePositions;
            }

            // Update labels
            labels.forEach(label => viewer.entities.remove(label));
            labels = [];
            for (let i = 0; i < selectedPoints.length - 1; i++) {
                const startPoint = selectedPoints[i].position;
                const endPoint = selectedPoints[i + 1].position;
                const distance = Cesium.Cartesian3.distance(startPoint, endPoint);
                const midpoint = Cesium.Cartesian3.lerp(startPoint, endPoint, 0.5, new Cesium.Cartesian3());
                const label = viewer.entities.add({
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
                labels.push(label);
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

        // Initialize polyline if it's not already
        if (!polyline) {
            polyline = viewer.entities.add({
                polyline: {
                    positions: [],
                    material: Cesium.Color.RED,
                    width: 3,
                    depthFailMaterial: Cesium.Color.RED,
                },
            });
        }

        // Update polyline positions
        const polylinePositions = selectedPoints.map(point => point.position);
        polyline.polyline.positions = polylinePositions;

        // Update labels
        labels.forEach(label => viewer.entities.remove(label));
        labels = [];
        for (let i = 0; i < selectedPoints.length - 1; i++) {
            const startPoint = selectedPoints[i].position;
            const endPoint = selectedPoints[i + 1].position;
            const distance = Cesium.Cartesian3.distance(startPoint, endPoint);
            const midpoint = Cesium.Cartesian3.lerp(startPoint, endPoint, 0.5, new Cesium.Cartesian3());
            const label = viewer.entities.add({
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
            labels.push(label);
        }
    }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
