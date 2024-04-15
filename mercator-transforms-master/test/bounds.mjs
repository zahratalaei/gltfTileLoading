import { tileOuterExtent } from "../src/index.mjs"


let indexComponents = {
    z:16,
    x:119171,
    y:48377
}
let utmProjection = "EPSG:28355";
let mercatorProjection = 'EPSG:3857';
let tileSystemName = 'cesium'
let bounds = tileOuterExtent(indexComponents, utmProjection, mercatorProjection, tileSystemName)

console.log(JSON.stringify(bounds, null, " "))
