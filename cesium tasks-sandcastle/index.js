const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    selectionIndicator: false
});
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

let startPoint = null;
let endPoint = null;
let polyline = null;
let mouseMoveHandler = null;
let middlePoint = null;
let highlightedPolyline = null;
let measurementComplete = false; // Flag to track measurement completion
let labelEntity = null; // Variable to hold the label entity


// Create a HTML overlay for the distance display
/*const overlay = document.createElement("div");
overlay.className = "distance-overlay";
viewer.container.appendChild(overlay);*/

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

function handleMouseMove(movement) {
    const ray = viewer.camera.getPickRay(movement.endPosition);
    middlePoint = viewer.scene.globe.pick(ray, viewer.scene);
    polyline.positions = new Cesium.CallbackProperty(function () {
        return [startPoint, middlePoint].filter(position => position !== null);
    }, false);

    // Perform distance calculation if both start and middle points are defined
    if (startPoint && middlePoint) {
        var distance = Cesium.Cartesian3.distance(startPoint, middlePoint);
        //showDistanceOverlay(movement.endPosition, distance.toFixed(2) + " meters");

        // Calculate the midpoint between start and middle points
        const midpoint = Cesium.Cartesian3.lerp(startPoint, middlePoint, 0.5, new Cesium.Cartesian3());

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
function handleClick(click) {
    if (!measurementComplete) {
        if (!startPoint) {
            const ray = viewer.camera.getPickRay(click.position);
            startPoint = viewer.scene.globe.pick(ray, viewer.scene);

            polyline = new Cesium.PolylineGraphics();
            polyline.material = Cesium.Color.RED;
            polyline.width = 3;
            polyline.positions = new Cesium.CallbackProperty(function () {
                return [startPoint, middlePoint].filter(position => position !== null);
            }, false);
            viewer.entities.add({
                polyline: polyline,
            });

            addMark(startPoint);

            mouseMoveHandler = handler.setInputAction(handleMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        } else if (!endPoint) {
            const ray = viewer.camera.getPickRay(click.position);
            endPoint = viewer.scene.globe.pick(ray, viewer.scene);
            polyline.positions = new Cesium.CallbackProperty(function () {
                return [startPoint, endPoint].filter(position => position !== null);
            }, false);
            var distance = Cesium.Cartesian3.distance(startPoint, endPoint);
           // showDistanceOverlay(click.position, distance.toFixed(2) + " meters");

          
         
            // Create a highlighted polyline entity
            highlightedPolyline = viewer.entities.add({
                polyline: {
                    positions: [startPoint, endPoint].filter(position => position !== null),
                    material: Cesium.Color.YELLOW,
                    width: 5,
                }
            });

            addMark(endPoint);

            // Calculate the midpoint between start and end points
            const midpoint = Cesium.Cartesian3.lerp(startPoint, endPoint, 0.5, new Cesium.Cartesian3());

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

            // Remove the info box and pickable square
            viewer.scene.primitives.remove(viewer.scene.primitives._primitives[1]);
            // Mark the measurement as complete
            measurementComplete = true;

            // Remove the mouse move handler after setting measurementComplete to true
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE, mouseMoveHandler);
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
//        overlay.style.display = "none";
        measurementComplete = false; // Reset the flag to allow new measurements
    }
}

handler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);


// Function to show the distance overlay at the given position
/*function showDistanceOverlay(position, text) {
    overlay.style.top = position.y + "px";
    overlay.style.left = position.x + "px";
    overlay.textContent = text;
    overlay.style.display = "block";
}*/

// CSS styling for the distance overlay
/*const overlayStyle = document.createElement("style");
overlayStyle.textContent = `
.distance-overlay {
    position: absolute;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    padding: 4px;
    font-size: 14px;
    border-radius: 4px;
    white-space: nowrap;
}
`;*/
//document.head.appendChild(overlayStyle);
