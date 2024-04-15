import fs from 'fs';
import { Buffer } from 'buffer';


// create cylinder gltf
function createCylinderGLTF(height, position) {
  const numSegments = 32;
  const radius = 1.0;

  // Generate vertices
  let vertices = [];
  for (let i = 0; i < numSegments; i++) {
    let angleRad = (2 * Math.PI * i) / numSegments;
    let x = radius * Math.cos(angleRad);
    let y = radius * Math.sin(angleRad);
    // Bottom circle
    vertices.push([x, y, 0]);
    // Top circle
    vertices.push([x, y, height]);
  }
  // Center points for the top and bottom circles
  vertices.push([0, 0, 0]); // Bottom center
  vertices.push([0, 0, height]); // Top center

  // Generate indices
  let indices = [];
  // Side faces
  for (let i = 0; i < numSegments; i++) {
    let next = (i + 1) % numSegments;
    // Two triangles per side face
    indices.push(i * 2, next * 2, i * 2 + 1);
    indices.push(next * 2, next * 2 + 1, i * 2 + 1);
  }
  // Bottom and top faces
  let bottomCenterIndex = vertices.length - 2;
  let topCenterIndex = vertices.length - 1;
  for (let i = 0; i < numSegments; i++) {
    let next = (i + 1) % numSegments;
    // Bottom face
    indices.push(i * 2, next * 2, bottomCenterIndex);
    // Top face
    indices.push(i * 2 + 1, topCenterIndex, next * 2 + 1);
  }

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
    nodes: [{ mesh: 0, translation: position }],
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
      { bufferView: 0, componentType: 5126, count: vertices.length, type: 'VEC3', max: [radius, radius, height], min: [-radius, -radius, 0] },
      { bufferView: 1, componentType: 5125, count: indices.length, type: 'SCALAR' }
    ]
  };

  // Save GLTF file
  fs.writeFile('cylinder.gltf', JSON.stringify(gltf, null, 2), 'utf8', err => {
    if (err) {
      console.error('An error occurred:', err);
    } else {
      console.log('GLTF file for the cylinder has been created.');
    }
  });
}

createCylinderGLTF(2,[1,2,3])
