const latbounds = 90

export function lat2merc(lat, zoom) {
    return (1 - ((latbounds - lat) / (latbounds * 2))) * Math.pow(2, zoom)
}

export function merc2lat(y, z) {
    return latbounds + ((y / Math.pow(2, z)-1) * (latbounds * 2))
}

export function lon2merc(lon, zoom) {
    return ((lon + 180) / 360) * Math.pow(2, zoom)
}

export function merc2lon(x, z) {
    return (x / Math.pow(2, z) * 360) - 180
}
