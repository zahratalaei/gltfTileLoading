// import { exec } from 'child_process';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { promisify } from 'util';

// const execAsync = promisify(exec);
// const zoomLevel = '16';
// const voltageCategory = 'high';
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const tilesetsBasePath = path.resolve(__dirname, '..', 'tilesets', 'data', zoomLevel, voltageCategory);
// const batchSize = 10; // Adjust this based on your system's capabilities

// async function createTilesetFromB3dm(b3dmFilePath) {
//     const outputJsonPath = b3dmFilePath.replace('.b3dm', '-tileset.json');
//     const command = `npx 3d-tiles-tools createTilesetJson -i "${b3dmFilePath}" -o "${outputJsonPath}"`;

//     try {
//         await execAsync(command);
//         console.log(`Created tileset JSON: ${outputJsonPath}`);
//     } catch (error) {
//         console.error(`Error creating tileset JSON from ${b3dmFilePath}:`, error);
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
//         await createTilesetFromB3dm(file);
//     }
// }

// async function createTilesetsFromB3dms(directoryPath) {
//     const dirs = fs.readdirSync(directoryPath, { withFileTypes: true })
//                     .filter(dirent => dirent.isDirectory())
//                     .map(dirent => dirent.name);

//     for (const dir of dirs) {
//         const dirPath = path.join(directoryPath, dir);
//         const files = fs.readdirSync(dirPath).filter(file => path.extname(file) === '.b3dm');
//         const batches = getBatches(files.map(file => path.join(dirPath, file)), batchSize);

//         for (const batch of batches) {
//             console.log(`Processing batch with ${batch.length} files...`);
//             await processBatch(batch);
//         }
//     }
// }

// createTilesetsFromB3dms(tilesetsBasePath)
//     .then(() => console.log('All tileset JSON creations complete.'))
//     .catch(error => console.error('An error occurred during creation:', error));


import { exec } from 'child_process';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = util.promisify(exec);
const zoomLevel = '16';
const voltageCategory = 'high';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tilesetsPath = path.resolve(__dirname, '..', 'tilesets', zoomLevel, voltageCategory);

async function createTilesetFromB3dm(b3dmFilePath) {
    const outputJsonPath = b3dmFilePath.replace('.b3dm', 'tileset.json');
    const command = `npx 3d-tiles-tools createTilesetJson -i ${b3dmFilePath} -o ${outputJsonPath}`;

    try {
        const { stdout, stderr } = await execAsync(command);
        console.log(stdout);
        if (stderr) {
            console.error(`Error creating tileset JSON from ${b3dmFilePath}:`, stderr);
        }
        console.log(`Created tileset JSON: ${outputJsonPath}`);
    } catch (error) {
        console.error(`Error creating tileset JSON from ${b3dmFilePath}:`, error);
    }
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

async function createTilesetsFromB3dms(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    const b3dmFiles = files.filter(file => path.extname(file) === '.b3dm');
    const fileChunks = chunkArray(b3dmFiles, 10);

    for (const chunk of fileChunks) {
        const promises = chunk.map(file => {
            const b3dmFilePath = path.join(directoryPath, file);
            return createTilesetFromB3dm(b3dmFilePath);
        });
        await Promise.all(promises);
    }
}

createTilesetsFromB3dms(tilesetsPath).then(() => {
    console.log('All tilesets created successfully');
}).catch(error => {
    console.error('An error occurred:', error);
});
