"use strict";

import assert from "assert";
import {lat2merc, lon2merc, merc2lat, merc2lon, schemeTransform,tileOuterExtent,latlon2mercTile} from "../src/index.mjs";
import proj4 from "proj4";


describe("test conversions", () => {


    before(async () => {
        console.log("before executes once before all tests");
    });

    after(() => {
        console.log("after executes once after all tests");
    });

    describe("conversions", () => {
        beforeEach(() => {
            console.log("beforeEach executes before every test");
        });

        it("latlon to tile", async()=>{
            //-42.8266609,147.3469988

            let inputScheme = {projection: "EPSG:4326"}
            let outputScheme = {tileSystemName: "cesium", projection: "EPSG:4326", level:14}

            let converted = schemeTransform(inputScheme, outputScheme, [ 147.3494948, -42.8249332 ])
            console.log(converted)


        })

        it("test ECEF", async () => {
            let inputScheme = {tileSystemName: "cesium", projection: "EPSG:4326"}
            let outputScheme = {projection: "EPSG:4978"}
            let RTC = schemeTransform(inputScheme, outputScheme, [ 59580, 48376, 16 ])
            console.log(RTC)

        })

        it("get utm tile bounding a coordinate", async () => {
            // let utmGrid = getUTMTile(-42.953884,147.470419, 500, "EPSG:28355")

            let zoom = 16
            let latlon = [147.3494948, -42.8249332 ]

            let coords = {
                google: [lon2merc(latlon[0], zoom, "google"), lat2merc(latlon[1], zoom, "google")],
                cesium: [lon2merc(latlon[0], zoom, "cesium"), lat2merc(latlon[1], zoom, "cesium")],
                tms: [lon2merc(latlon[0], zoom, "tms"), lat2merc(latlon[1], zoom, "tms")]
            }

            let reversed = {
                google: [merc2lon(coords["google"][0], zoom, "google"), merc2lat(coords["google"][1], zoom, "google")],
                cesium: [merc2lon(coords["cesium"][0], zoom, "cesium"), merc2lat(coords["cesium"][1], zoom, "cesium")],
                tms: [merc2lon(coords["tms"][0], zoom, "tms"), merc2lat(coords["tms"][1], zoom, "tms")]
            }

            console.log(JSON.stringify(coords, null, " "))
            console.log(JSON.stringify(reversed, null, " "))
            assert.ok(true);
        });


it("should test a tile can be converted to utm bounds", async()=>{
    let indexComponents = {
        z: 19,
        x: 476635,
        y:331302
    }

    let utmProjection = "EPSG:28355"
    let mercatorProjection ="EPSG:3857"
    let tileSystemName ="google"

    let bounds = tileOuterExtent(indexComponents, utmProjection, mercatorProjection, tileSystemName)

    console.log(JSON.stringify(bounds, null, " "))


})
it("should test latlon to merctile ",async()=>{
    let latlon = [
        
        147.31383415098364,-42.87353097806364
    ]
    let zoom = 12;
    // let tileSystemName = "google"
    let tile = latlon2mercTile(latlon, zoom)
    console.log(tile);
})


        it.skip("get merc from lat lng", async () => {
            //let [x,y] = [147.470419, -42.953884]
            let [x,y] = [90, -45]
            console.log([x,y])

            let scale = 279541132.014

            let scale2 = 20037508.34

            let merc = latlng2merc([x, y], 0)

            let firstProjection = "EPSG:4326"
            let secondProjection = "EPSG:3857"

            let projMerc = proj4(firstProjection, secondProjection, [x, y]);


            // console.log(merc, projMerc[0]/scale, projMerc[1]/scale )

            console.log("----------- own method - tiles - top left 0 bottom right 1 ")
            console.log("x", merc[0]  )
            console.log("y", merc[1]  )
            console.log()

            let X = (x ) / 360
            let Y = (1 - Math.log(Math.tan(y * Math.PI / 180) + 1 / Math.cos(y * Math.PI / 180)) / Math.PI) / 2
                //(1 - Math.log(Math.tan(y * Math.PI / 180) + 1 / Math.cos(y * Math.PI / 180)) / Math.PI) / 2

            console.log("----------- own method - Pseudo Mercator ")
            console.log("x", X  )
            console.log("y", (1 - Y*2)  )
            console.log()

            console.log("-----------proj4 method - Pseudo Mercator")
            let proj4MinExtents = proj4(firstProjection, secondProjection, [-180, 85.06])
            let proj4MaxExtents = proj4(firstProjection, secondProjection, [180, -85.06])
            console.log("x:", projMerc[0], "180 -> 180",  proj4MinExtents[0] , proj4MaxExtents[0])
            console.log("y:", projMerc[1], " 90 -> -90",  proj4MinExtents[1] , proj4MaxExtents[1]  )
            console.log()

            console.log("-----------proj4 Pseudo Mercator scaled by ", scale2)
            console.log("x", projMerc[0] / scale2 )
            console.log("y", projMerc[1] / scale2 )
            console.log()


            console.log("----------- JS Simple / Spherical Pseudo-Mercator projection --- ")
            console.log("x", lon2x(x))
            console.log("y", lat2y(y))
            console.log()


            console.log("-----------proj4 method - true Mercator")
            secondProjection = "EPSG:3395"
            let proj4MinExtentsa = proj4(firstProjection, secondProjection, [-180, 85.06])
            let proj4MaxExtentsa = proj4(firstProjection, secondProjection, [180, -85.06])
            console.log("x:", projMerc[0], "180 -> 180",  proj4MinExtentsa[0] , proj4MaxExtentsa[0])
            console.log("y:", projMerc[1], " 90 -> -90",  proj4MinExtentsa[1] , proj4MaxExtentsa[1]  )
            console.log()


            console.log("----------- JS Elliptical (true) Mercator Projection --- ")
            console.log("x", merc_x(x), "-180 -> 180",  merc_x(-180) , merc_x(180))
            console.log("y", merc_y(y), " 90 ->  -90",  merc_y(85.05)   , merc_y(-85.05))
            console.log()

            assert.ok(merc);
        });

    });

});

//********************

let RAD2DEG = 180 / Math.PI;
let PI_4 = Math.PI / 4;

function lat2y(lat) { return Math.log(Math.tan((lat / 90 + 1) * PI_4 )) * RAD2DEG; }
function lon2x(lon) { return lon; }


//8888888888
function deg_rad(ang) {
    return ang * (Math.PI/180.0)
}
function merc_x(lon) {
    let r_major = 6378137.000;
    return r_major * deg_rad(lon);
}
function merc_y(lat) {
    if (lat > 89.5)
        lat = 89.5;
    if (lat < -89.5)
        lat = -89.5;
    let r_major = 6378137.000;
    let r_minor = 6356752.3142;
    let temp = r_minor / r_major;
    let es = 1.0 - (temp * temp);
    let eccent = Math.sqrt(es);
    let phi = deg_rad(lat);
    let sinphi = Math.sin(phi);
    let con = eccent * sinphi;
    let com = .5 * eccent;
    con = Math.pow((1.0-con)/(1.0+con), com);
    let ts = Math.tan(.5 * (Math.PI*0.5 - phi))/con;
    let y = 0 - r_major * Math.log(ts);
    return y;
}
function merc(x,y) {
    return [merc_x(x),merc_y(y)];
}