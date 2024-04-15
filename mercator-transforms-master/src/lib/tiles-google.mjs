
/**
 * convert a longitude to a mercator x
 * @param lon
 * @param zoom
 * @returns {number}
 */
export function lon2merc(lon, zoom) {
    return (((lon + 180) / 360 * Math.pow(2, zoom)));
}

/**
 * convert a latitude to a mercator y
 * @param lat
 * @param zoom
 * @returns {number}
 */
export function lat2merc(lat, zoom) {
    return (((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}

function lat2MercMethod2(lat, zoom){
    return (0.5 - (Math.log((1 + Math.sin(lat * 4 * Math.atan(1) / 180)) / (1 - Math.sin(lat * 4 * Math.atan(1) / 180))) / (16 * Math.atan(1)))) * Math.pow(2, zoom);
}

/**
 * convert a mercator x to a longitude
 * @param {Number} x - mercator x value
 * @param {Number} z - zoom level
 * @returns {Number}
 */
export function merc2lon(x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
}

/**
 * convert a mercator y to a latitude
 * @param {Number} y - mercator y value
 * @param {Number} z - zoom level
 * @returns {Number}
 */
export function merc2lat(y, z) {
    let n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}




