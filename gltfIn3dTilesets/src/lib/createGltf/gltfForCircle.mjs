import fs from 'fs';
import { Buffer } from 'buffer';

// create circle gltf
// Parameters
const numSegments = 32;
const radius = 1.0;

// Generate vertices
let vertices = [[0, 0, 0]]; // Center point
for (let i = 0; i < numSegments; i++) {
  let angleRad = (2 * Math.PI * i) / numSegments;
  let x = radius * Math.cos(angleRad);
  let y = radius * Math.sin(angleRad);
  let z = 0; // Circle in the XY plane
  vertices.push([x, y, z]);
}

// Generate indices for the triangle fan
let indices = [];
for (let i = 1; i < numSegments; i++) {
  indices.push(0, i, i + 1);
}
indices.push(0, numSegments, 1); // Close the circle

// Convert to binary data
let vertexData = Float32Array.from(vertices.flat());
let indexData = Uint32Array.from(indices);

// Combine into one buffer
let combinedBuffer = Buffer.concat([Buffer.from(vertexData.buffer), Buffer.from(indexData.buffer)]);

// Base64 encode
let encodedData = combinedBuffer.toString('base64');

// GLTF structure
let gltf = {
  asset: { version: '2.0' },
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0 }],
  meshes: [
    {
      primitives: [
        {
          attributes: { POSITION: 0 },
          indices: 1
        }
      ]
    }
  ],
  buffers: [
    {
      byteLength: combinedBuffer.length,
      uri: `data:application/octet-stream;base64,${encodedData}`
    }
  ],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: vertexData.byteLength, target: 34962 },
    { buffer: 0, byteOffset: vertexData.byteLength, byteLength: indexData.byteLength, target: 34963 }
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, count: vertices.length, type: 'VEC3', max: [1, 1, 0], min: [-1, -1, 0] },
    { bufferView: 1, componentType: 5125, count: indices.length, type: 'SCALAR' }
  ]
};

// Save GLTF file
fs.writeFile('circle.gltf', JSON.stringify(gltf, null, 2), 'utf8', err => {
  if (err) {
    console.error('An error occurred:', err);
  } else {
    console.log('GLTF file for the circle has been created.');
  }
});

