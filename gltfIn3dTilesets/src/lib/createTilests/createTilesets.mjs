import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import * as Cesium from 'cesium';
import { Matrix, EigenvalueDecomposition } from 'ml-matrix';

// Function to compute the bounding box from accessor min and max values
function computeBoundingBoxFromAccessors(accessors) {
  let globalMin = [Infinity, Infinity, Infinity];
  let globalMax = [-Infinity, -Infinity, -Infinity];

  accessors.forEach(accessor => {
    if (accessor.min && accessor.max) {
      const min = accessor.min;
      const max = accessor.max;
      globalMin = globalMin.map((currentMin, index) => Math.min(currentMin, min[index]));
      globalMax = globalMax.map((currentMax, index) => Math.max(currentMax, max[index]));
    }
  });

  return { globalMin, globalMax };
}


function calculateBoundingBox(cartesianPoints) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;

  cartesianPoints.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
  });
  

  // Calculate center and dimensions
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const width = maxX - minX;
  const height = maxY - minY;
  const depth = maxZ - minZ;
  const center = new Cesium.Cartesian3(centerX, centerY, centerZ);
  const halfAxes = Cesium.Matrix3.fromScale(new Cesium.Cartesian3(width, height, depth), new Cesium.Matrix3());

const obb = new Cesium.OrientedBoundingBox(center, halfAxes)
return obb
 
}

// Function to create the bounding volume box from global min and max
function createBoundingVolumeBox(globalMin, globalMax) {
  const center = globalMin.map((min, index) => (min + globalMax[index]) / 2);
  const dimensions = globalMin.map((min, index) => globalMax[index] - min);
  return [
    center[0], center[1], center[2],
    dimensions[0] / 2, 0, 0, // x dimension half-length
    0, dimensions[1] / 2, 0, // y dimension half-length
    0, 0, dimensions[2] / 2  // z dimension half-length
  ];
}

function decodeDataURI(dataURI) {
  const base64String = dataURI.split(',')[1];
  const binaryString = atob(base64String);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return Buffer.from(bytes.buffer);
}

// Function to extract the flatCartesianArray from the decoded Buffer
function extractCartesianArray(buffer, cartesianBufferLength) {
  // Extract the cartesian data buffer
  const cartesianBuffer = buffer.slice(0, cartesianBufferLength);
  // Convert the Buffer to a Float32Array
  const cartesianArray = new Float32Array(cartesianBuffer.buffer, cartesianBuffer.byteOffset, cartesianBuffer.length / Float32Array.BYTES_PER_ELEMENT);
  // Convert Flat Cartesian Array to structured format
  const cartesianCoordinates = [];
  for (let i = 0; i < cartesianArray.length; i += 3) {
    cartesianCoordinates.push({
      x: cartesianArray[i],
      y: cartesianArray[i + 1],
      z: cartesianArray[i + 2]
    });
  }
  return cartesianCoordinates;
  //   return cartesianArray;
}


function createTilesetJson(gltfPath) {
  const gltfContent = JSON.parse(fs.readFileSync(gltfPath, 'utf-8'));
  // const { globalMin, globalMax } = computeBoundingBoxFromAccessors(gltfContent.accessors);
  const dataURI = gltfContent.buffers[0].uri;
  const decodedBuffer = decodeDataURI(dataURI);
  const cartesianBufferLength = gltfContent.meshes[0].primitives.length * 11 * 4 * 3;
  const flatCartesianArray = extractCartesianArray(decodedBuffer, cartesianBufferLength);
  const obb = Cesium.OrientedBoundingBox.fromPoints(flatCartesianArray);
  const center = obb.center;
  const halfAxes = obb.halfAxes;
// Create an array consisting of the center and halfAxes values
const combinedArray = [
    center.x, center.y, center.z, 
    halfAxes['0'], halfAxes['1'], halfAxes['2'],
    halfAxes['3'], halfAxes['4'], halfAxes['5'],
    halfAxes['6'], halfAxes['7'], halfAxes['8']
];

  // const boundingVolumeBox = createBoundingVolumeBox(globalMin, globalMax);
  
  const tilesetJson = {
    asset: {
      version: '1.1'
    },
    geometricError: 4096,
    root: {
      boundingVolume: {
        box: combinedArray
      },
      geometricError: 512,
      content: {
        uri: path.basename(gltfPath)
      },
      refine: 'ADD'
    }
  };

  const tilesetJsonPath = gltfPath.replace('.gltf', '.json');
  fs.writeFileSync(tilesetJsonPath, JSON.stringify(tilesetJson, null, 2));
  console.log(`Tileset JSON created at: ${tilesetJsonPath}`);
};

  
// Function to recursively walk through directory tree and process GLTF files

// Function to recursively walk through the directory tree and process GLTF files
function walkDirectory(currentPath) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      // Recursively walk into subdirectories
      walkDirectory(fullPath);
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.gltf') {
      // Process GLTF file to create a tileset
      createTilesetJson(fullPath);
    }
  });
}

// Start walking from the base directory of your 'conductors'
// const baseDirectory = '../../tilesets';
const baseDirectory = '../../../../data/conductors/18';
walkDirectory(baseDirectory);
