import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Function to validate if a point is a valid array of three numbers

// Helper function to convert the points to a binary buffer
function pointsToBuffer(pointsSet) {
  const buffer = Buffer.alloc(pointsSet.length * 3 * 4);
  let offset = 0;
  for (let i = 0; i < pointsSet.length; i++) {
    for (let j = 0; j < 3; j++) {
      buffer.writeFloatLE(pointsSet[i][j], offset);
      offset += 4;
    }
  }
  return buffer;
}

// Function to get the current directory name when using ES Modules
function getCurrentDirectoryName(importMetaUrl) {
  const __filename = fileURLToPath(importMetaUrl);
  return path.dirname(__filename);
}

const __dirname = getCurrentDirectoryName(import.meta.url);

const zoomLevel = "16"; // Make sure this is a string since it will be used in path concatenation
const voltageCategory = "high";
// Base path for the tileset JSON files
const basePath = path.join(__dirname, '..', 'src', 'tilesets', zoomLevel, voltageCategory);


// Read the .json files in the basePath
fs.readdir(basePath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading the base directory:', err);
      return;
    }
  
    // Filter for .json files only
    const jsonFileNames = files.filter(dirent => dirent.isFile() && path.extname(dirent.name) === '.json').map(dirent => dirent.name);
  
    // Process each json file
    jsonFileNames.forEach(jsonFileName => {
      const jsonFilePath = path.join(basePath, jsonFileName);
  
      // Read the json file
      fs.readFile(jsonFilePath, (err, data) => {
        if (err) {
          console.error(`Error reading file ${jsonFilePath}:`, err);
          return;
        }
  
        let pointsData;
        try {
          pointsData = JSON.parse(data);
        } catch (parseErr) {
          console.error(`Error parsing JSON from file ${jsonFilePath}:`, parseErr);
          return;
        }
  
        // Convert the points to a buffer
        const buffer = pointsData.reduce((acc, pointsSet) => {
          if (!Array.isArray(pointsSet) || pointsSet.some(point => !Array.isArray(point) || point.length !== 3)) {
            console.error('Invalid points set', pointsSet);
            return acc;
          }
        
          const pointsBuffer = pointsToBuffer(pointsSet);

          return Buffer.concat([acc, pointsBuffer]);
        }, Buffer.alloc(0));
  
        // Write the buffer to a .bin file in the same directory
        const binFileName = path.basename(jsonFilePath).replace('.json', '.bin');
        const binFilePath = path.join(basePath, binFileName);
  
        fs.writeFile(binFilePath, buffer, (err) => {
          if (err) {
            console.error(`Error writing file ${binFilePath}:`, err);
            return;
          }
          console.log(`Successfully wrote ${binFilePath}`);
        });
      });
    });
  });