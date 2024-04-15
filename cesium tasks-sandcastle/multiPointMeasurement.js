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
        },
    });
}

function handleClick(click) {
    const point = getPosition(click.position);
    if (point) {
        points.push(point);
        addMark(point);

        if (points.length > 1) {
            startPoint = points[points.length - 2];
            endPoint = points[points.length - 1];

            polyline = viewer.entities.add({
                polyline: {
                    positions: [startPoint, endPoint].filter(position => position !== null),
                    material: Cesium.Color.RED,
                    width: 3,
                },
            });
            polylines.push(polyline);

            distance = Cesium.Cartesian3.distance(startPoint, endPoint);

            // Calculate the midpoint between start and end points
            const midpoint = Cesium.Cartesian3.lerp(startPoint, endPoint, 0.5, new Cesium.Cartesian3());

            // Add a label entity to the polyline
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

        // Update the start point for the next segment
        startPoint = points[points.length - 1];

        // Remove the temporary polyline
        if (tempPolyline) {
            viewer.entities.remove(tempPolyline);
            tempPolyline = null;
        }

        // Add mouse move handler
        mouseMoveHandler = handler.setInputAction(handleMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

