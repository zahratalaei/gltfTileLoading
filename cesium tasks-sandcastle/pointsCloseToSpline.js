const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    selectionIndicator: false,
    terrain: Cesium.Terrain.fromWorldTerrain(),
});
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

const scene = viewer.scene;
let points = []; // Array to store the picked points
let polyline = null;
let mouseMoveHandler = null;
let highlightedPolyline = null;
let measurementComplete = false; // Flag to track measurement completion
let labelEntity = null; // Variable to hold the label entity
let distance = null;
let middlePoint = null;
let startPoint=null;
let endPoint=null;

// Add this line to import the CatmullRomSpline class
const CatmullRomSpline = Cesium.CatmullRomSpline;
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
            pixelSize: 5,
            color: Cesium.Color.RED,
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

function drawCurve() {
    if (points.length === 3) {
        startPoint = points[0];
        middlePoint = points[1];
        endPoint = points[2];

        const curve = new CatmullRomSpline({
            times: [0, 0.5, 1],
            points: [startPoint, middlePoint, endPoint],
        });

        const curvePositions = [];
        const curveScreenPositions = []; // Array to store the screen coordinates

        const numSamples = 10;
        for (let i = 0; i <= numSamples; i++) {
            const time = i / numSamples;
            const worldPosition = curve.evaluate(time);
            curvePositions.push(worldPosition);

            // Convert world position to screen position
            const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, worldPosition);
            curveScreenPositions.push(screenPosition);
        }

       

        // Clear the points array for the next measurement
        points = [];
        measurementComplete = true;

        // Find points near the curve
        const d = 5;  // Define your desired distance here
        const nearbyPoints = getPointsNearSpline(curveScreenPositions, d);
        console.log(nearbyPoints);  // Log or process the nearby points as needed
        nearbyPoints.map(point => {
            addMark(point);
        })

         // Create a polyline with the curve positions
         viewer.entities.add({
            polyline: {
                positions: curvePositions,
                material: Cesium.Color.BLUE,
                width: 3,
            },
        });
    }
}

function handleMouseMove(movement) {
    
    middlePoint = getPosition(movement.endPosition);
    polyline.positions = new Cesium.CallbackProperty(function () {
        return [startPoint, middlePoint].filter(position => position !== null);
    }, false);

    // Perform distance calculation if both start and middle points are defined
    if (startPoint && middlePoint) {
         distance = Cesium.Cartesian3.distance(startPoint, middlePoint);
        //showDistanceOverlay(movement.endPosition, distance.toFixed(2) + " meters");

        // Calculate the midpoint between start and middle points
        const midpoint = Cesium.Cartesian3.lerp(startPoint, middlePoint, 0.5, new Cesium.Cartesian3());

        // Remove the previous label entity if exists
        if (labelEntity) {
            viewer.entities.remove(labelEntity);
        }

        // Add a label entity to the polyline
        labelEntity = new Cesium.Entity({
            position: midpoint,// mouseMoveHandler = handler.setInputAction((movement) => {
                //     handleMouseMove(movement, startPoint, middlePoint, polyline, distance);
                //   }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
function handleClick(click) {
    if (!measurementComplete) {
        const point = getPosition(click.position);

        if (point) {
            points.push(point);

            addMark(point);

            if (points.length === 3) {
                // Draw the curve after picking three points
                const startTime = performance.now()

                drawCurve();
                const endTime = performance.now()
                console.log(endTime-startTime);
            }
        }
    } else {
        // Remove the polyline entities and cleanup
        viewer.entities.removeAll();
        polyline = null;
        mouseMoveHandler = null;
        highlightedPolyline = null;
        measurementComplete = false; // Reset the flag to allow new measurements
    }
}
handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);



function splitSplineIntoSegments(spline) {
    const segments = [];
    const numSamples = spline.length - 1;

    for (let i = 0; i < numSamples; i++) {
        segments.push({
            start: spline[i],
            end: spline[i + 1]
        });
    }

    return segments;
}

function createBoundingBox(segment, d) {
    
    return {
        minX: Math.min(segment.start.x, segment.end.x) - d,
        maxX: Math.max(segment.start.x, segment.end.x) + d,
        minY: Math.min(segment.start.y, segment.end.y) - d,
        maxY: Math.max(segment.start.y, segment.end.y) + d
    };
}

function getPointsNearSpline(spline, d) {
    const segments = splitSplineIntoSegments(spline);
    // console.log(segments);
    const pointsWithinDistance = [];

    const isPointCloseToOthers = (point, pointsArray, threshold) => {
        for (let existingPoint of pointsArray) {
            if (Cesium.Cartesian3.distance(existingPoint, point) < threshold) {
                return true;
            }
        }
        return false;
    };

    segments.forEach(segment => {
        const boundingBox = createBoundingBox(segment, d);
        // console.log(boundingBox);
        for (let x = boundingBox.minX; x <= boundingBox.maxX; x+=3) {
            // console.log(x);
            for (let y = boundingBox.minY; y <= boundingBox.maxY; y+=3) {

                const winPosition = new Cesium.Cartesian2(x, y)
                // console.log(winPosition);
                const pickedObject = viewer.scene.pick(winPosition);
                
                if (Cesium.defined(pickedObject)) {
                    const pickedPoint = getPosition(winPosition);
                    if (pickedPoint && !isPointCloseToOthers(pickedPoint, pointsWithinDistance, 0.01))  {
                        pointsWithinDistance.push(pickedPoint);
                    }
                }
            }
        }
    });
    return pointsWithinDistance;
}