import fs from 'fs';
import path from 'path';

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

  // Return the bounding box in the format required by 3D Tiles
  return [
    centerX,
    centerY,
    centerZ,
    width / 2,
    0,
    0, // x-axis half-length vector
    0,
    height / 2,
    0, // y-axis half-length vector
    0,
    0,
    depth / 2 // z-axis half-length vector
  ];
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

function createTilesetJson(gltfPath) {
 const gltfContent = JSON.parse(fs.readFileSync(gltfPath, 'utf-8'));
  const { globalMin, globalMax } = computeBoundingBoxFromAccessors(gltfContent.accessors);

  const boundingVolumeBox = createBoundingVolumeBox(globalMin, globalMax);
  const tilesetJson = {
    asset: {
      version: '1.1'
    },
    geometricError: 4096,
    root: {
      boundingVolume: {
        box: boundingVolumeBox
      },
      geometricError: 512,
      content: {
        uri: path.basename(gltfPath)
      },
      refine: 'ADD'
    }
  };

  const tilesetJsonPath = gltfPath.replace('.gltf', '.tileset.json');
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
const baseDirectory = '../../../data/conductors/18';
walkDirectory(baseDirectory);
