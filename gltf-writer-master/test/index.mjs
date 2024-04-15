// "use strict";

// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// // Function to get the current directory name when using ES Modules
// function getCurrentDirectoryName(importMetaUrl) {
//     const __filename = fileURLToPath(importMetaUrl);
//     return path.dirname(__filename);
//   }
  
//   // Usage of the function to get the current directory name
//   const __dirname = getCurrentDirectoryName(import.meta.url);
  
// // Read the JSON file containing the file names
// const fileNamesPath = path.resolve(__dirname, 'fileNames.json');
// const fileNamesJSON = fs.readFileSync(fileNamesPath, 'utf-8');
// const fileNames = JSON.parse(fileNamesJSON);
// const zoomLevel = 16;

// fileNames.forEach((fileName) => {
//     const jsonFilePath = path.resolve(__dirname, '..', 'src', 'tilesets','gltf', fileName);
//     const allPointsData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
//     let buffers = [];

 
//     for (const pointsSet of allPointsSets) {
//         const buffer = Buffer.alloc(pointsSet.length * 3 * 4); // 3 floats per point, 4 bytes per float
//         let offset = 0;
//         for (let i = 0; i < pointsSet.length; i++) {
//             for (let j = 0; j < 3; j++) {
//                 buffer.writeFloatLE(pointsSet[i][j], offset);
//                 offset += 4;
//             }
//         }
//         buffers.push(buffer);
//     }
//     const finalBuffer = Buffer.concat(buffers);
//     const binFilePath = path.resolve(__dirname, '..', 'src', 'tilesets','gltf', `${zoomLevel}`,`${path.basename(fileName, '.json')}.bin`);
//     fs.writeFileSync(binFilePath, finalBuffer);
// });



// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


// const allPointsSets = JSON.parse(fs.readFileSync(path.resolve(__dirname,'..','..','src/tilesets' ,'119169-48376-cart.json'), 'utf-8'));

// let buffers = [];


// for (const pointsSet of allPointsSets) {
//     const buffer = Buffer.alloc(pointsSet.length * 3 * 4); // 3 floats per point, 4 bytes per float
//     let offset = 0;
//     for (let i = 0; i < pointsSet.length; i++) {
//         for (let j = 0; j < 3; j++) {
//             buffer.writeFloatLE(pointsSet[i][j], offset);
//             offset += 4;
//         }
//     }
//     buffers.push(buffer);
// }
// const finalBuffer = Buffer.concat(buffers);
// fs.writeFileSync(path.resolve(__dirname, './119169-48376.bin'), finalBuffer);

// npx 3d-tiles-tools glbToB3dm -i 119169-48376.glb -o 119169-48376.b3dm
// npx 3d-tiles-tools glbToI3dm -i 119169-48376-cart.glb -o 119169-48376-cart.i3dm
// npx gltf-pipeline -i 119169-48376.gltf -o 119169-48376.glb
// npx 3d-tiles-tools createTilesetJson -i 119169-48376.b3dm -o tileset-119169-48376.json
            

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

const zoomLevel = '16'; // Make sure this is a string since it will be used in path concatenation

// Base path for the tileset JSON files
const tilesetsInputBasePath = path.join(__dirname, '..', 'src', 'tilesets','data', zoomLevel,'low');
const tilesetsBinBasePath = path.join(__dirname, '..', 'src', 'tilesets','data', zoomLevel,'low');

// Read the directories in the zoom level
fs.readdir(tilesetsInputBasePath, { withFileTypes: true }, (err, xDirs) => {
  if (err) {
    console.error('Error reading the zoom level directory:', err);
    return;
  }

  // Filter for directories only
  const xDirNames = xDirs.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

  // Process each x directory
  xDirNames.forEach(xDirName => {
    const xDirPath = path.join(tilesetsInputBasePath, xDirName);
    // console.log("🚀 ~ file: index.mjs:119 ~ fs.readdir ~ xDirPath:", xDirPath)
    
    // Read the y.json files in the x directory
    fs.readdir(xDirPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${xDirPath}:`, err);
        return;
      }

      // Filter for .json files only and exclude any '-info.json' files
      const jsonFileNames = files
        .filter(dirent => dirent.isFile() && path.extname(dirent.name) === '.json')
        .map(dirent => dirent.name);

      // Process each json file
      jsonFileNames.forEach(jsonFileName => {
        const jsonFilePath = path.join(xDirPath, jsonFileName);
        
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
          
          // Convert the points to a buffer and concatenate all buffers
          const buffer = pointsData.reduce((acc, pointsSet) => {
            if (!Array.isArray(pointsSet) || pointsSet.some(point => !Array.isArray(point) || point.length !== 3)) {
              console.error('Invalid points set', pointsSet);
              return acc;
            }
          
            const pointsBuffer = pointsToBuffer(pointsSet);
            return Buffer.concat([acc, pointsBuffer]);
          }, Buffer.alloc(0));
          
          // Write the buffer to a .bin file in the same directory
          // const binFilePath = jsonFilePath.replace('.json', '.bin');

          // Create the directory for this xDirName if it doesn't exist
      const binFileDir = path.join(tilesetsBinBasePath, xDirName);
      fs.mkdirSync(binFileDir, { recursive: true });

         // Write the buffer to a .bin file in the new directory
        const binFileName = path.basename(jsonFilePath).replace('.json', '.bin');
        const binFilePath = path.join(tilesetsBinBasePath, xDirName, binFileName);

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
  });
});
