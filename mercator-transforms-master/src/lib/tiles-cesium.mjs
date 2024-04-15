const latbounds = 90

export function lat2merc(lat, zoom) {
    return ((latbounds - lat) / (latbounds * 2)) * Math.pow(2, zoom)
}

export function merc2lat(y, z) {
    return latbounds - (y / Math.pow(2, z) * (latbounds * 2))
}

export function lon2merc(lon, zoom) {

    return ((lon + 180) / 360) * Math.pow(2, zoom)
}

export function merc2lon(x, zoom) {
    //the +1 to zoom results from one additional subdivision at level 0
    return (x / Math.pow(2, zoom) * 360)/2 - 180
}

