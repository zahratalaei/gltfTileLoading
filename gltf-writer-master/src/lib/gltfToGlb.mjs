import pkg from 'gltf-pipeline';
const { gltfToGlb } = pkg;
import fsExtra from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
const zoomLevel = '16';
const voltageCategory = 'low';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tilesetsPath = path.resolve(__dirname, 'createGltf');
// const tilesetsPath = path.resolve(__dirname, '..', 'tilesets', zoomLevel, "test01");

function convertGltfToGlb(gltfFilePath, glbFilePath) {
    const gltf = fsExtra.readJsonSync(gltfFilePath);
    const options = {
        resourceDirectory: path.dirname(gltfFilePath)
    };

    gltfToGlb(gltf, options).then(function (results) {
        fsExtra.writeFileSync(glbFilePath, results.glb);
        console.log(`Converted GLTF to GLB: ${glbFilePath}`);
    }).catch(function (error) {
        console.error(`Error converting GLTF to GLB for ${gltfFilePath}:`, error);
    });
}
// function convertAllGltfToGlb(directoryPath) {
//     // Iterate over 'x' directories
//     const xDirs = fsExtra.readdirSync(directoryPath, { withFileTypes: true })
//                         .filter(dirent => dirent.isDirectory())
//                         .map(dirent => dirent.name);

//     xDirs.forEach(xDir => {
//         const xDirPath = path.join(directoryPath, xDir);
//         // Iterate over files in each 'x' directory
//         const files = fsExtra.readdirSync(xDirPath);

//         files.filter(file => path.extname(file) === '.gltf').forEach(file => {
//             const gltfFilePath = path.join(xDirPath, file);
//             console.log(`Processing GLTF file: ${gltfFilePath}`);

//             // GLB file path in the same directory
//             const glbFilePath = path.join(xDirPath, `${path.basename(file, '.gltf')}.glb`);
//             convertGltfToGlb(gltfFilePath, glbFilePath);
//         });
//     });
// }

// convertAllGltfToGlb(tilesetsPath);
function convertAllGltfToGlb(directoryPath) {
    const files = fsExtra.readdirSync(directoryPath);

    const gltfFiles = files.filter(file => path.extname(file) === '.gltf');
    gltfFiles.forEach(file => {
        const gltfFilePath = path.join(directoryPath, file);

        // Specify the GLB file path in the 'tilesets' subdirectory
        const glbFilePath = path.join(tilesetsPath, `${path.basename(file, '.gltf')}.glb`);
        convertGltfToGlb(gltfFilePath, glbFilePath);
    });
}

convertAllGltfToGlb(tilesetsPath);
