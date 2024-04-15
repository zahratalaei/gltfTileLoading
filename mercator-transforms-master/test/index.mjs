import fs from "fs";
// import fs from "fs/promises"; // Use fs/promises for async/await support

import { latlon2mercTile, tileOuterExtent } from "../src/index.mjs";
import { mkdir } from "fs/promises";

const zoom = 16;
const directoryPath = `${zoom}`;
let utmProjection = "EPSG:28355";
let mercatorProjection = "EPSG:3857";
// Create an array to store the filenames
const fileNamesArray = [];

async function createDirectory(path) {
  try {
    await mkdir(path, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
}

fs.readFile("longlat_coordinates.json", "utf8", async (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    await createDirectory(directoryPath);
  } catch (err) {
    console.error("Error creating directory:", err);
    return;
  }

  const geoData = JSON.parse(data);
  const tileSystemName = "cesium"; // or "google", depending on your tile system
  const tiles = {};

  geoData.forEach((catenary) => {
    const firstPoint = catenary[0];
    const latlon = [firstPoint["Longitude"], firstPoint["Latitude"]];
    const tile = latlon2mercTile(latlon, zoom, tileSystemName);
    const tileKey = `${tile[0]}-${tile[1]}`;
    if (!tiles[tileKey]) {
      tiles[tileKey] = {
        catenaries: [],
        center: null, // Placeholder for the tile center
      };
    }

    tiles[tileKey].catenaries.push(catenary);
    fileNamesArray.push(`${tileKey}.json`); // Push the filename into the array
  });

  // Calculate the center of each tile using the merc2latlon function
  for (const [tileKey, tileData] of Object.entries(tiles)) {
    // Extract tile x, y from the tileKey
    const [tileX, tileY] = tileKey.split("-").map(Number);
    // Use tileOuterExtent to find the bounding extents and center
    const indexComponents = { x: tileX, y: tileY, z: zoom };
    const tile = tileOuterExtent(
      indexComponents,
      utmProjection,
      mercatorProjection,
      tileSystemName
    );
    if (tile && tile.latlon && tile.latlon.extents) {
      const minCorner = tile.latlon.extents[0]; // Assuming this is [minLon, minLat]
      const maxCorner = tile.latlon.extents[1]; // Assuming this is [maxLon, maxLat]

      const latCenter = (minCorner[1] + maxCorner[1]) / 2;
      const lonCenter = (minCorner[0] + maxCorner[0]) / 2;
      tileData.center = { latitude: latCenter, longitude: lonCenter };
    } else {
      console.error("Tile calculation error for tile:", tileKey);
    }

    const filename = `${directoryPath}/${tileKey}.json`;
    fs.writeFile(filename, JSON.stringify(tileData, null, 2), (err) => {
      if (err) {
        console.error(`Error writing file ${filename}:`, err);
        return;
      }
    });
  }
  // After processing all tiles, write the filenames array to a JSON file
  const filenamesJSON = JSON.stringify(fileNamesArray, null, 2);
  fs.writeFile("filenames.json", filenamesJSON, (err) => {
    if (err) {
      console.error("Error writing filenames JSON:", err);
      return;
    }
    console.log("Filenames JSON file saved!");
  });
});


