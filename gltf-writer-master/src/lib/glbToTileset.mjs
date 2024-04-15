import { exec } from 'child_process';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = util.promisify(exec);
const zoomLevel = '16';
const voltageCategory = 'high';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tilesetsPath = path.resolve(__dirname, 'createGltf');
// const tilesetsPath = path.resolve(__dirname, '..', 'tilesets', zoomLevel, "test01");

async function createTilesetFromB3dm(b3dmFilePath) {
    const outputJsonPath = b3dmFilePath.replace('.glb', '.json');
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
    const b3dmFiles = files.filter(file => path.extname(file) === '.glb');
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