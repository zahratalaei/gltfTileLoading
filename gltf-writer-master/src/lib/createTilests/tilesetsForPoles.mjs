import fs from 'fs';
import path from 'path';
import * as Cesium from 'cesium';
import { readFileSync } from 'fs';
const { Cartesian3, Matrix4, Transforms } = Cesium;
function findVerticesAndNormals(height, radius, numSegments) {
  let localVertices = [];
  let localNormals = [];
  let vertexOffset = 0;
  let indices = [];
  let vertices = [];
  let normals = [];

  for (let i = 0; i < numSegments; i++) {
    let angleRad = (2 * Math.PI * i) / numSegments;
    let x = radius * Math.cos(angleRad);
    let y = radius * Math.sin(angleRad);
    localVertices.push([x, y, 0], [x, y, height]);
    let normal = [Math.cos(angleRad), Math.sin(angleRad), 0];
    localNormals.push(normal, normal);
  }
  localVertices.push([0, 0, 0], [0, 0, height]);
  localNormals.push([0, 0, -1], [0, 0, 1]);

  let bottomCenterIndex = vertexOffset + localVertices.length - 2;
  let topCenterIndex = vertexOffset + localVertices.length - 1;
  for (let i = 0; i < numSegments; i++) {
    let next = (i + 1) % numSegments;
    indices.push(vertexOffset + i * 2, vertexOffset + next * 2, vertexOffset + i * 2 + 1, vertexOffset + next * 2, vertexOffset + next * 2 + 1, vertexOffset + i * 2 + 1);
    indices.push(vertexOffset + i * 2, vertexOffset + next * 2, bottomCenterIndex);
    indices.push(vertexOffset + i * 2 + 1, topCenterIndex, vertexOffset + next * 2 + 1);
  }

  vertices.push(...localVertices);
  normals.push(...localNormals);
  vertexOffset += localVertices.length;
  return { vertices: vertices, normals: normals };
}
// Transform vertices using Cesium Matrix4
function transformVertices(vertices, matrix) {
  return vertices.map(vertex => {
    let point = new Cartesian3(vertex[0], vertex[1], vertex[2]);
    return Matrix4.multiplyByPoint(matrix, point, new Cartesian3());
  });
}

// Compute bounding box from vertices
function computeBoundingBox(vertices) {
  let globalMin = [Infinity, Infinity, Infinity];
  let globalMax = [-Infinity, -Infinity, -Infinity];

  vertices.forEach(vertex => {
    globalMin[0] = Math.min(globalMin[0], vertex.x);
    globalMin[1] = Math.min(globalMin[1], vertex.y);
    globalMin[2] = Math.min(globalMin[2], vertex.z);

    globalMax[0] = Math.max(globalMax[0], vertex.x);
    globalMax[1] = Math.max(globalMax[1], vertex.y);
    globalMax[2] = Math.max(globalMax[2], vertex.z);
  });

  return { globalMin, globalMax };
}

// Function to create the bounding volume box from global min and max
function createBoundingVolumeBox(globalMin, globalMax) {
  const center = globalMin.map((min, index) => (min + globalMax[index]) / 2);
  const dimensions = globalMin.map((min, index) => globalMax[index] - min);
  return [
    center[0],
    center[1],
    center[2],
    dimensions[0] / 2,
    0,
    0, // x dimension half-length
    0,
    -dimensions[1] / 2,
    0, // y dimension half-length
    0,
    0,
    dimensions[2] / 2 // z dimension half-length
  ];
}

function createTilesetJson(gltfPath) {
  const allTransformedVertices = [];

  const gltfContent = JSON.parse(fs.readFileSync(gltfPath, 'utf-8'));
  const { vertices } = findVerticesAndNormals(1, 0.2, 32);
  // Transform vertices for each node and aggregate them
  gltfContent.nodes.forEach(node => {
    if (node.matrix && !node.children) {
      const matrix = Matrix4.fromArray(node.matrix);
      const transformedVertices = transformVertices(vertices, matrix);
      allTransformedVertices.push(...transformedVertices);
    }
  });

  // const transformedVertices = transformVertices(vertices, matrix);
  // const { globalMin, globalMax } = computeBoundingBoxFromAccessors(gltfContent.accessors, gltfContent.nodes, gltfContent.meshes);
  const { globalMin, globalMax } = computeBoundingBox(allTransformedVertices);
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

  const tilesetJsonPath = gltfPath.replace('.gltf', '.json');
  fs.writeFileSync(tilesetJsonPath, JSON.stringify(tilesetJson, null, 2));
  console.log(`Tileset JSON created at: ${tilesetJsonPath}`);
}

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
const baseDirectory = '../../../../data/pole/18';
walkDirectory(baseDirectory);
