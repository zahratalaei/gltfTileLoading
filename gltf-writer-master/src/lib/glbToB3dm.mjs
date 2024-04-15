// import { exec } from 'child_process';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { promisify } from 'util';

// const execAsync = promisify(exec);
// const zoomLevel = '16';
// const voltageCategory = 'high';
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const tilesetsPath = path.resolve(__dirname, '..', 'tilesets', 'data', zoomLevel, voltageCategory);
// const batchSize = 10; // Number of files to process in each batch

// async function convertGlbToB3dm(glbFilePath) {
//     const b3dmFilePath = glbFilePath.replace('.glb', '.b3dm');
//     const command = `npx 3d-tiles-tools glbToB3dm -i "${glbFilePath}" -o "${b3dmFilePath}"`;

//     try {
//         const { stdout, stderr } = await execAsync(command);
//         if (stderr) {
//             console.error(`Error converting GLB to B3DM for ${glbFilePath}:`, stderr);
//             return;
//         }
//         console.log(`Converted GLB to B3DM: ${b3dmFilePath}`);
//     } catch (error) {
//         console.error(`Error converting GLB to B3DM for ${glbFilePath}:`, error);
//     }
// }

// function getBatches(files, batchSize) {
//     let batches = [];
//     for (let i = 0; i < files.length; i += batchSize) {
//         let batch = files.slice(i, i + batchSize);
//         batches.push(batch);
//     }
//     return batches;
// }

// async function processBatch(batch) {
//     for (const file of batch) {
//         await convertGlbToB3dm(file);
//     }
// }

// async function convertAllGlbsToB3dms(directoryPath) {
//     const dirs = fs.readdirSync(directoryPath, { withFileTypes: true })
//                     .filter(dirent => dirent.isDirectory())
//                     .map(dirent => dirent.name);

//     for (const dir of dirs) {
//         const dirPath = path.join(directoryPath, dir);
//         const files = fs.readdirSync(dirPath).filter(file => path.extname(file) === '.glb');
//         const batches = getBatches(files.map(file => path.join(dirPath, file)), batchSize);

//         for (const batch of batches) {
//             console.log(`Processing batch with ${batch.length} files...`);
//             await processBatch(batch);
//         }
//     }
// }

// convertAllGlbsToB3dms(tilesetsPath)
//     .then(() => console.log('All conversions complete.'))
//     .catch(error => console.error('An error occurred during conversion:', error));

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const zoomLevel = '16';
const voltageCategory = 'high';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tilesetsPath = path.resolve(__dirname, '..', 'tilesets', zoomLevel, voltageCategory);

function convertGlbToB3dm(glbFilePath, callback) {
    const b3dmFilePath = glbFilePath.replace('.glb', '.b3dm');
    const command = `npx 3d-tiles-tools glbToB3dm -i ${glbFilePath} -o ${b3dmFilePath}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error converting GLB to B3DM for ${glbFilePath}:`, error);
            return callback(error);
        }
        if (stderr) {
            console.error(`Error converting GLB to B3DM for ${glbFilePath}:`, stderr);
            return callback(new Error(stderr));
        }
        console.log(`Converted GLB to B3DM: ${b3dmFilePath}`);
        callback(null);
    });
}

function convertAllGlbsToB3dms(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    const glbFiles = files.filter(file => path.extname(file) === '.glb');

    function processNext(index) {
        if (index < glbFiles.length) {
            const glbFilePath = path.join(directoryPath, glbFiles[index]);
            convertGlbToB3dm(glbFilePath, (err) => {
                if (err) {
                    console.error(`Error processing file: ${glbFiles[index]}`, err);
                } else {
                    processNext(index + 1);
                }
            });
        } else {
            console.log("All files have been processed.");
        }
    }

    processNext(0);
}

convertAllGlbsToB3dms(tilesetsPath);
