import proj4 from "proj4"
import {tileSystem} from "./tiles-convenience.mjs";


proj4.defs([
    [
        // LonLat - WGS 84 -- WGS84 - World Geodetic System 1984, used in GPS
        'EPSG:4326',
        '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
    ],
    [
        // Mercator - WGS 84 / Pseudo-Mercator -- Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI
        'EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs'
    ],
    [
        // Mercator - WGS 84 / World Mercator
        'EPSG:3395',
        '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs'
    ],
    [
        // UTM
        'EPSG:28356',
        '+proj=utm +zone=56 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs '
    ],
    [
        // UTM
        'EPSG:28350',
        '+proj=utm +zone=50 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs '
    ],
    [
        // UTM - Tas
        "EPSG:28355",
        "+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
    ],
    [
        // ECEF
        "EPSG:4978",
        "+proj=geocent +datum=WGS84 +units=m +no_defs +type=crs"
    ]

]);


// 6283 <-- geodic datum of gda94

/**
 * @typedef {Array.<Number, Number>} CoordinatePair
 */

/**
 * @typedef {Array.<CoordinatePair>} CoordinateArray
 */


export function tileSystemProperties(tileSystemName) {
    if (tileSystemName === "cesium") {
        return {
            tileYDirection: 1
        }
    } else if (tileSystemName === "tms") {
        return {
            tileYDirection: 1
        }
    } else {
        return {
            tileYDirection: -1
        }
    }
}

/**
 * @typedef {"google" | "cesium" | "tms"} TileSystemNames
 */

/**
 * convert a lat lon to a mercator tile coordinate
 * @param {Number} zoom - the zoom level 0 -24 typically
 * @param {Number} gridsize - the resolution of the mercator tile system 2^gridsize
 * @param {Number} lat - the latitude
 * @param {Number} lon - the longitude
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {{x: number, y: number}}
 */
export function latlon2Grid(zoom, gridsize, lat, lon, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]

    let xBase = tiler.lon2merc(lon, zoom - gridsize)
    let yBase = tiler.lat2merc(lat, zoom - gridsize)

    return {x: xBase, y: yBase}
}

/**
 *
 * @param {[lon: number, lat: number]} latlon - array of longitude latitude
 * @param {number} zoom - zoom level typically between 0 - 24
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {[x: number, y:number, z: number]}
 */
export function latlon2mercTile(latlon, zoom, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return [Math.floor(tiler.lon2merc(latlon[0], zoom)*2), Math.floor(tiler.lat2merc(latlon[1], zoom)), zoom]
}


/**
 *
 * @param {[lng: Number, lat: Number]} latlng - array of longitude latitude
 * @param {number} zoom - zoom level typically between 0 - 24
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {[x: Number, y: Number]}
 */
export function latlon2merc(latlng, zoom, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return [(tiler.lon2merc(latlng[0], zoom)), (tiler.lat2merc(latlng[1], zoom)), zoom]
}


/**
 * convert a longitude to a mercator x
 * @param lon
 * @param zoom
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {number}
 * @deprecated
 */
export function lng2merc(lon, zoom, tileSystemName) {
    console.log("deprecate lng2merc replace with lon2merc")
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return tiler.lon2merc(lon, zoom)
}


/**
 * convert a longitude to a mercator x
 * @param lon
 * @param zoom
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {number}
 */
export function lon2merc(lon, zoom, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return tiler.lon2merc(lon, zoom)
}


/**
 * convert a latitude to a mercator y
 * @param lat
 * @param zoom
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {number}
 */
export function lat2merc(lat, zoom, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return tiler.lat2merc(lat, zoom)
}


/**
 *
 * @param {[lon: Number, lat: Number]} merc - array of mercator coordinates [x,y]
 * @param {number} zoom - zoom level typically between 0 - 24
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {[x: Number, y: Number]}
 */
export function merc2latlon(merc, zoom, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return [(tiler.merc2lon(merc[0], zoom)), (tiler.merc2lat(merc[1], zoom))]
}


/**
 * convert a mercator x to a longitude
 * @param {Number} x - mercator x value
 * @param {Number} z - zoom level
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {Number}
 */
export function merc2lon(x, z, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return tiler.merc2lon(x, z)
}


/**
 * convert a mercator x to a longitude
 * @param {Number} x - mercator x value
 * @param {Number} z - zoom level
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {Number}
 * @deprecated - use merc2lon
 */
export function merc2lng(x, z, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return tiler.merc2lon(x, z)
}


/**
 * convert a mercator y to a latitude
 * @param {Number} y - mercator y value
 * @param {Number} z - zoom level
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {Number}
 */
export function merc2lat(y, z, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return tiler.merc2lat(y, z)
}


export function crsTransform(fromCRS, toCRS, coord) {
    return proj4(fromCRS, toCRS, coord)
}




/**
 * @typedef {Object} TileBounds
 * @property {CoordinateArray} utm
 * @property {CoordinateArray}  latlon
 */


/**
 * Given a mercator tile, find the UTM and latlon coordinates that fully bound the tile
 * also find each of the corners of the utm tile
 * @param {IndexComponents | {x:Number, y:Number, z:Number}} indexComponents
 * @param {String} utmProjection
 * @param {String} [mercatorProjection = "EPSG:4326"]
 * @param {String} [tileSystemName]
 * @returns {TileBounds}
 */
export function tileOuterExtent(indexComponents, utmProjection, mercatorProjection, tileSystemName) {
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    mercatorProjection = mercatorProjection || "EPSG:4326"
    let tile = {}

    let tileYDirection
    let tileVertices

    if (tileSystemName === "cesium") {
        //vertex 0,0 is the bottom left corner of the tile,
        tileYDirection = 1
        tileVertices = [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0]
        ]
    } else {
        //vertex 0,0 is the top left corner of the tile,
        tileYDirection = -1
        tileVertices = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0]
        ]
    }


    tile.latlon = {}
    tile.latlon.vertices = tileVertices.map(offset => merc2latlon([indexComponents.x + offset[0], indexComponents.y + offset[1]], indexComponents.z, tileSystemName))
    tile.latlon.extents = boundingBoxExtents(tile.latlon.vertices)


    tile.utm = {}
    tile.utm.vertices = tile.latlon.vertices.map(coord => crsTransform(mercatorProjection, utmProjection, coord))
    tile.utm.extents = boundingBoxExtents(tile.utm.vertices)

    return tile
}

/**
 * takes an array of vertices and return the max and min
 * @param vertices
 * @returns {*[][]}
 */
function boundingBoxExtents(vertices) {
    return [
        [
            vertices.map(coord => coord[0]).sort()[0],
            vertices.map(coord => coord[1]).sort()[0]
        ],
        [
            vertices.map(coord => coord[0]).sort()[vertices.length - 1],
            vertices.map(coord => coord[1]).sort()[vertices.length - 1]
        ]
    ]
}


/**
 * the scheme may change the zoom level, the tiling scheme or the projection
 * @param {{tileSystemName?: string, projection?: string, level?: number}} inputScheme
 * @param {{tileSystemName?: string, projection?: string, level?: number}} outputScheme
 * @param {[number, number, number?]} coord
 * @returns {[number, number, number?]}
 */
export function schemeTransform(inputScheme, outputScheme, coord) {

    let {tileSystemName: inputTileSystemName, projection: inputProjection} = inputScheme
    let {tileSystemName: outputTileSystemName, projection: outputProjection} = outputScheme

    let newCoord = coord


    if (outputTileSystemName === undefined && inputTileSystemName === undefined) {
        //no tiling system is involved, so it is a straight projection transformation
        newCoord = crsTransform(inputProjection, outputProjection, newCoord)
    } else if (inputTileSystemName === outputTileSystemName && inputProjection === outputProjection) {
        //the zoom level of the tiling system is being changed or this is a null transformation
        let inputZoomLevel = newCoord[2] || inputScheme.level
        let outputZoomLevel = outputScheme.level

        let scale = 2 ** (outputZoomLevel - inputZoomLevel)

        newCoord = [
            newCoord[0]*scale,
            newCoord[1]*scale,
            outputZoomLevel
        ]


    } else {
        //at least one of the schemes using a tiling scheme, so need to transform to/from a tiling scheme to a projection capable coordinate

        if (inputTileSystemName) {
            //give each imageJob a tile coordinate at a pyramid zoom level of boundingZoom
            let level = newCoord[2] || inputScheme.level
            //if input coord is in tileSystem format convert to latlon
            newCoord = merc2latlon(newCoord, level, inputScheme.tileSystemName)
        }

        if (inputProjection !== outputProjection) {
            //if input projection is not the same as output projection then transform

            newCoord = [...newCoord, 0]
            newCoord = crsTransform(inputProjection, outputProjection, newCoord)
        }

        if (outputTileSystemName) {
            //give each imageJob a tile coordinate at a pyramid zoom level of boundingZoom
            let level = outputScheme.level
            //if output is required to be in tileSystem format then convert
            newCoord = latlon2merc(newCoord, level, outputScheme.tileSystemName)
        }

    }

    return newCoord
}


/*
=========================================================================================
 Deprecated
=========================================================================================
 */
/**
 * Given lat lng coordinates, return a utm tile fully containing it eg. 150.8822349, -34.434629, with 500m grid spacing
 * @param lat
 * @param lon
 * @param gridSpacing
 * @param utmProjection
 * @param fromProjection
 * @deprecated
 */
export function getUTMTile(lat, lon, gridSpacing, utmProjection, fromProjection) {
    let firstProjection = "EPSG:4326";

    utmProjection = utmProjection || "EPSG:28356"

    let utm = crsTransform(firstProjection, utmProjection, [lon, lat])

    return [Math.floor(utm[0] / gridSpacing) * gridSpacing, Math.floor(utm[1] / gridSpacing) * gridSpacing]

}


/**
 *
 * @param {[lng: Number, lat: Number]} latlng - array of longitude latitude
 * @param zoom - zoom level typically between 0 - 24
 * @param {TileSystemNames} [tileSystemName="google"] - google or cesium strategy for mercator
 * @returns {[x: Number, y: Number]}
 * @deprecated
 */
export function latlng2merc(latlng, zoom, tileSystemName) {
    console.log("deprecate latlng2merc replace with latlon2merc")
    let tiler = tileSystem[tileSystemName] || tileSystem["google"]
    return [(tiler.lon2merc(latlng[0], zoom)), (tiler.lat2merc(latlng[1], zoom))]
}


/**
 * provided with a destination projection, transform from WGS 84
 * @param secondProjection  - in the form of a proj4 definition such as EPSG:3857
 * @param x
 * @param y
 * @returns {(*|number)[]|*[]|[*,*]|{}|{x: number, y: number, z: (*|number)}|*|{inverse: (function(*, *): (*|number)[] | *[] | [*,*] | {} | {x: number, y: number, z: (*|number)}), forward: (function(*, *): (*|number)[] | *[] | [*,*] | {} | {x: number, y: number, z: (*|number)})}}
 * @deprecated
 */
export function projectionTransform(secondProjection, x, y) {
    let firstProjection = "EPSG:4326";
    return proj4(firstProjection, secondProjection, [x, y]);
}

/**
 * transform to WGS 84 from a provided projection
 * @param {string} firstProjection - in the form of a proj4 definition such as EPSG:3857
 * @param {Number} x
 * @param {Number} y
 * @deprecated
 */
export function projectionUnTransform(firstProjection, x, y) {
    let secondProjection = "EPSG:4326";
    return proj4(firstProjection, secondProjection, [x, y]);
}


/* https://asciiflow.com/
-
-             mercator
-          x,y          (x+1),y
-            ┌────────────┐
-            │            │
-            │   Mxy      │
-            │            │
-            │            │
-            │            │
-            └────────────┘
-         x,(y+1)       x,(y+1)
-
-
-
-                a11           maxCoord
-         ┌─────────────────┐◄───────
-         │      /~         │
-         │     /   ~       │
-         │    /      ~     │
-         │   /         ~   │
-         │  /            ~ │a12
-    a22  │ /            /  │
-         │ ~           /   │
-         │   ~        /    │
-         │     ~     /     │
-         │       ~  /      │
-minCoord │         ~       │
-   ────► └─────────────────┘
-                  a21
-
 */


/**
 * @typedef {Object} CartesianBounds
 * @property {Array.<{x: Number, y: Number}>} vertices
 * @property {Array.<{x: Number, y: Number}>} extents
 */


/**
 * @typedef {Object} LatLngBounds
 * @property {Array.<{lng: Number, lat: Number}>} vertices
 * @property {Array.<{lng: Number, lat: Number}>} extents
 */


/**
 * @typedef {Object} getUTMTileExtents#ImageBounds
 * @property {CartesianBounds} utm
 * @property {LatLngBounds} latlng
 * @property {CartesianBounds} mercator
 */


/**
 * given a utm time by origin and resolution, find the utm, latlng and mercator vertices, and extents.
 * The extents will be the min and max cartesian numbers regardless of the orientation of the coordinate system
 * @param utmX
 * @param utmY
 * @param gridSpacing
 * @param imageMargin
 * @param zoom
 * @param projection
 * @returns {ImageBounds}
 * @deprecated
 */
export function getUTMTileExtents(utmX, utmY, gridSpacing, imageMargin, zoom, projection) {

    let tile = {}

    imageMargin = imageMargin || {x: 0, y: 0}

    //get bottom left
    let utm_x1 = utmX - imageMargin.x
    let utm_y1 = utmY - imageMargin.y
    let latlng1 = projectionUnTransform(projection, utm_x1, utm_y1)

    //get upper left
    let utm_x2 = utm_x1 - imageMargin.x
    let utm_y2 = utm_y1 + gridSpacing + imageMargin.y
    let latlng2 = projectionUnTransform(projection, utm_x2, utm_y2)

    //get upper right
    let utm_x3 = utm_x1 + gridSpacing + imageMargin.x
    let utm_y3 = utm_y1 + gridSpacing + imageMargin.y
    let latlng3 = projectionUnTransform(projection, utm_x3, utm_y3)

    //get bottom right
    let utm_x4 = utm_x1 + gridSpacing + imageMargin.x
    let utm_y4 = utm_y1 - imageMargin.y
    let latlng4 = projectionUnTransform(projection, utm_x4, utm_y4)


    tile.utm = {
        vertices: [
            {x: utm_x1, y: utm_y1},
            {x: utm_x2, y: utm_y2},
            {x: utm_x3, y: utm_y3},
            {x: utm_x4, y: utm_y4}
        ]

    }

    tile.utm.extents = [
        {x: utm_x1, y: utm_y1},
        {x: utm_x3, y: utm_y3}
    ]


    tile.latlng = {
        vertices: [
            {lng: latlng1[0], lat: latlng1[1]},
            {lng: latlng2[0], lat: latlng2[1]},
            {lng: latlng3[0], lat: latlng3[1]},
            {lng: latlng4[0], lat: latlng4[1]},
        ]
    }

    tile.latlng.extents = [
        {
            lng: tile.latlng.vertices.map(coord => coord.lng).sort()[0], //find the minimum lng
            lat: tile.latlng.vertices.map(coord => coord.lat).sort()[0]  // find the minimum lat: it's the 0th element when sorted
        },

        {
            lng: tile.latlng.vertices.map(coord => coord.lng).sort()[tile.latlng.vertices.length - 1], //find the maximum lng: it's the 0th element when sorted by negative lng
            lat: tile.latlng.vertices.map(coord => coord.lat).sort()[tile.latlng.vertices.length - 1]  //find the maximum lat
        },
    ]


    tile.mercator = {
        vertices: [
            {x: lng2merc(latlng1[0], zoom), y: lat2merc(latlng1[1], zoom)},
            {x: lng2merc(latlng2[0], zoom), y: lat2merc(latlng2[1], zoom)},
            {x: lng2merc(latlng3[0], zoom), y: lat2merc(latlng3[1], zoom)},
            {x: lng2merc(latlng4[0], zoom), y: lat2merc(latlng4[1], zoom)},
        ]
    }

    tile.mercator.extents = [
        {
            x: tile.mercator.vertices.map(coord => coord.x).sort()[0],
            y: tile.mercator.vertices.map(coord => coord.y).sort()[0]
        },
        {
            x: tile.mercator.vertices.map(coord => coord.x).sort()[tile.mercator.vertices.length - 1],
            y: tile.mercator.vertices.map(coord => coord.y).sort()[tile.mercator.vertices.length - 1]
        }
    ]

    return tile


}
