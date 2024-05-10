import fs from 'fs';
import { Buffer } from 'buffer';
import path from 'path';
import util from 'util';
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

import * as Cesium from 'cesium';
import { calculateTileCenter, localizeCoordinates } from './helper.mjs';


// const poleData = [
//   {
//     color: '#000100',
//     coordinates: [
//       {
//         Longitude: 144.61868540576725,
//         Latitude: -41.008482793412135,
//         Elevation: 6.801814204179589
//       },
//       {
//         Longitude: 144.61868429514539,
//         Latitude: -41.00848126843706,
//         Elevation: 14.266444676203603
//       }
//     ],
//     Pole_Id: '167493',
//     Site_Label: '921292',
//     Max_Voltage: 'LV ABC',
//     Pole_Height: 7.5,
//     Pole_Lean: 1.5,
//     Captured_Date: '2022-12-18',
//     Captured_Time: '11:55:46',
//     MaintenanceArea: 'Marrawah South',
//     Depot: 'North West'
//   },
//   {
//     color: '#000100',
//     coordinates: [
//       {
//         Longitude: 144.61916699488626,
//         Latitude: -41.00839934395629,
//         Elevation: 6.174048665595663
//       },
//       {
//         Longitude: 144.61917028428627,
//         Latitude: -41.008399699949834,
//         Elevation: 13.38349549865179
//       }
//     ],
//     Pole_Id: '167492',
//     Site_Label: '212502',
//     Max_Voltage: 'LV ABC',
//     Pole_Height: 7.2,
//     Pole_Lean: 2.2,
//     Captured_Date: '2022-12-18',
//     Captured_Time: '11:31:25',
//     MaintenanceArea: 'Marrawah South',
//     Depot: 'North West'
//   }
// ];



const encoder = new TextEncoder();


const yUpToZupMatrix = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];

const convertCartographicToCartesian = cartographic => {
  return Cesium.Cartesian3.fromDegrees(cartographic.Longitude, cartographic.Latitude, cartographic.Elevation);
};

function getProperPosition(point, x, y, z) {
  const cartesian = convertCartographicToCartesian(point);
  const center = calculateTileCenter(x, y, z);
  const localizedPoint = localizeCoordinates(cartesian, center);
  return localizedPoint;
}

function calculateModelMatrix(coord1, coord2, scale = 1.0) {
  const position = new Cesium.Cartesian3(coord1.x, coord1.y, coord1.z);
  const target = new Cesium.Cartesian3(coord2.x, coord2.y, coord2.z);
  const direction = Cesium.Cartesian3.subtract(target, position, new Cesium.Cartesian3());
  Cesium.Cartesian3.normalize(direction, direction);
  const up = Cesium.Cartesian3.UNIT_Z;
  const axis = Cesium.Cartesian3.cross(up, direction, new Cesium.Cartesian3());
  if (Cesium.Cartesian3.magnitude(axis) === 0) axis = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_X);
  Cesium.Cartesian3.normalize(axis, axis);
  const angle = Math.acos(Cesium.Cartesian3.dot(up, direction));
  const quaternion = Cesium.Quaternion.fromAxisAngle(axis, angle);
  const rotationMatrix = Cesium.Matrix3.fromQuaternion(quaternion);
  const scaleVector = new Cesium.Cartesian3(scale, scale, Cesium.Cartesian3.distance(coord1, coord2));
  const scaledRotationMatrix = Cesium.Matrix3.multiplyByScale(rotationMatrix, scaleVector, new Cesium.Matrix3());
  const modelMatrix = Cesium.Matrix4.fromRotationTranslation(scaledRotationMatrix, position, new Cesium.Matrix4());
  return Cesium.Matrix4.toArray(modelMatrix);
}
// Concatenates multiple typed arrays into a single Uint8Array.
function concatenateTypedArrays(arrays) {
  // Calculate the total length of all arrays
  let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);

  // Create a new array with the total length
  let result = new Uint8Array(totalLength);

  // Copy each array into the result array
  let length = 0;
  for (let array of arrays) {
    result.set(array, length);
    length += array.length;
  }

  return result;
}

// Creates a buffer containing encoded strings along with their offsets.
function createStringBufferWithStringOffset(stringsArray) {
  const concatenatedStrings = stringsArray.join('');
  const encodedStrings = encoder.encode(concatenatedStrings);
  const encodedStringsByteLength = encodedStrings.byteLength;
  let stringOffset = 0;
  const stringsOffsets = stringsArray.map(string => {
    const offset = stringOffset;
    stringOffset += encoder.encode(string).length;
    return offset;
  });
  stringsOffsets.push(stringOffset);
  const offsetsBuffer = new Uint32Array(stringsOffsets);
  const stringsOffsetsBuffer = new Uint8Array(offsetsBuffer.buffer);
  const stringsOffsetsBufferLength = stringsOffsetsBuffer.byteLength;

  return {
    encodedStrings: encodedStrings, // The binary data for the encoded strings
    stringsOffsetsBuffer: stringsOffsetsBuffer, // The binary data for the strings' offsets
    encodedStringsByteLength: encodedStringsByteLength, // Length of the encoded strings data
    offsetsBufferLength: stringsOffsetsBufferLength, // Length of the offsets data
    totalBufferLength: encodedStringsByteLength + stringsOffsetsBufferLength // Total length of all binary data
  };
}

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
function createCylinderGLTF(outputPath, poleData, x, y, z) {
  console.log('Processing to create GLTF file:', outputPath);

  const totalSet = poleData.length;
  let vertices = [];
  let normals = [];
  let indices = [];
  let vertexOffset = 0;
  let nodes = [];
  let childIndices = [];
  const numSegments = 32;
  const radius = 0.2;
  const height = 1;
  poleData.forEach((pole, index) => {
    const topCartographic = pole.coordinates[0];
    const bottomCartographic = pole.coordinates[1];
    const topCenter = getProperPosition(topCartographic, x, y, z);
    const bottomCenter = getProperPosition(bottomCartographic, x, y, z);
    const modelMatrix = calculateModelMatrix(topCenter, bottomCenter, 1.0);
    let localVertices = [];
    let localNormals = [];

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
    let childIndex = nodes.length;
    childIndices.push(childIndex);
    // Adding node for each pole
    nodes.push({ mesh: index, matrix: modelMatrix });
  });
  const featureIDs = poleData.flatMap((_, index) => Array(vertices.length).fill(index));

  nodes.push({ children: childIndices, matrix: yUpToZupMatrix });
  // Combine all buffers into one binary blob
  const vertexData = new Float32Array(vertices.flat());
  const vertexBuffer = Buffer.from(vertexData.buffer);
  const normalData = new Float32Array(normals.flat());
  const normalBuffer = Buffer.from(normalData.buffer);
  const indexData = new Uint32Array(indices);
  const indexBuffer = Buffer.from(indexData.buffer);
  const featureIdsArray = new Int32Array(featureIDs);
  const featureIdsBuffer = Buffer.from(featureIdsArray.buffer);
  const allStringsBinary = [];
  const metaDataBuffer = [];

  const attributes = Object.keys(poleData[0]).reduce((acc, key) => {
    if (key !== 'color' && key !== 'coordinates') {
      // Define expected types for attributes
      const expectedTypes = {
        Pole_Id: 'string',
        Site_Label: 'string',
        Max_Voltage: 'string',
        Pole_Height: 'number',
        Pole_Lean: 'number',
        Captured_Date: 'string',
        Captured_Time: 'string',
        MaintenanceArea: 'string',
        Depot: 'string'
      };

      const values = poleData.map(item => {
        const value = item[key];
        // Validate type or handle undefined values
        if (typeof value === 'undefined') {
          return 'NA';
        } else if (typeof value !== expectedTypes[key]) {
          throw new Error(`Type mismatch for key ${key}: expected ${expectedTypes[key]}, got ${typeof value}`);
        } else {
          return value.toString();
        }
      });

      const encodedValues = createStringBufferWithStringOffset(values);
      metaDataBuffer.push(encodedValues);
      allStringsBinary.push(encodedValues.encodedStrings); // Directly use the binary data
      allStringsBinary.push(encodedValues.stringsOffsetsBuffer); // Convert Uint32Array to Uint8Array if needed
      // Push the transformed values array under the current key
      acc.push({ [key]: values });
    }
    return acc;
  }, []);

  const metadataCombinedArray = concatenateTypedArrays(allStringsBinary);
  const metadataCombinedArrayBuffer = Buffer.from(metadataCombinedArray);
  const combinedBuffer = Buffer.concat([vertexBuffer, normalBuffer, indexBuffer, featureIdsBuffer, metadataCombinedArrayBuffer]);
  const encodedData = combinedBuffer.toString('base64');
  // const dataURI = `data:application/octet-stream;base64,${combinedBase64String}`;

  // GLTF data structure
  const gltf = {
    asset: { version: '2.0' },
    scenes: [{ nodes: [nodes.length - 1] }],
    extensionsUsed: ['EXT_mesh_features', 'EXT_structural_metadata'],

    nodes: nodes,
    meshes: poleData.map((_, i) => ({
      primitives: [
        {
          attributes: { POSITION: 0, NORMAL: 1, _FEATURE_ID_0: i + 3 },
          indices: 2,
          material: 0,
          extensions: {
            EXT_mesh_features: {
              featureIds: [
                {
                  featureCount: 100,
                  propertyTable: 0,
                  attribute: 0
                }
              ]
            }
          }
        }
      ]
    })),
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1, 1, 1.0] // Color adjusted as needed
        },
        doubleSided: true
      }
    ],
    buffers: [
      {
        byteLength: combinedBuffer.length,
        uri: `data:application/octet-stream;base64,${encodedData}`
      }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: vertexBuffer.byteLength, target: 34962 },
      { buffer: 0, byteOffset: vertexBuffer.byteLength, byteLength: normalBuffer.byteLength, target: 34962 },
      { buffer: 0, byteOffset: vertexBuffer.byteLength + normalBuffer.byteLength, byteLength: indexBuffer.byteLength, target: 34963 }
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: vertices.length, type: 'VEC3', max: [radius, radius, height], min: [-radius, -radius, 0] },
      { bufferView: 1, componentType: 5126, count: normals.length, type: 'VEC3' },
      { bufferView: 2, componentType: 5125, count: indices.length, type: 'SCALAR' }
    ],
    extensions: {
      EXT_structural_metadata: {
        schema: {
          classes: {
            PoleMetadata: {
              properties: {}
            }
          },
          id: 1
        },
        propertyTables: [
          {
            name: 'PolePropertyTable',
            class: 'PoleMetadata',
            count: totalSet,
            properties: {}
          }
        ]
      }
    }
  };
  let currentOffset = vertexBuffer.byteLength + normalBuffer.byteLength + indexBuffer.byteLength;

  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: currentOffset,
    byteLength: vertices.length * 4 * totalSet,
    byteStride: 4,
    target: 34962 // ARRAY_BUFFER for FeatureIds
  });
  currentOffset += featureIdsBuffer.byteLength;
  //add bufferViews for attributes
  metaDataBuffer.forEach(metaData => {
    gltf.bufferViews.push({
      buffer: 0, // Assuming a single buffer that these views reference
      byteOffset: currentOffset,
      byteLength: metaData.encodedStringsByteLength
    });
    currentOffset += metaData.encodedStringsByteLength;
    gltf.bufferViews.push({
      buffer: 0,
      byteOffset: currentOffset,
      byteLength: metaData.offsetsBufferLength
    });

    currentOffset += metaData.offsetsBufferLength;
  });
  // add accessors for featureIds
  poleData.map((_, i) => {
    gltf.accessors.push({
      name: 'FeatureId',
      bufferView: 3,
      byteOffset: i * 2 * 264,
      componentType: 5121, //UNSIGNED_BYTE
      count: vertices.length,
      type: 'SCALAR',
      normalized: false
    });
  });

  let initAttrOffset = 4;
  gltf.extensions.EXT_structural_metadata.propertyTables[0].properties = transformAttributes(attributes, initAttrOffset);
  gltf.extensions.EXT_structural_metadata.schema.classes.PoleMetadata.properties = createSchemaProperties(attributes, initAttrOffset);

  fs.writeFile(outputPath, JSON.stringify(gltf, null, 2), err => {
    if (err) {
      console.error('An error occurred:', err);
    } else {
      console.log('GLTF file for all poles has been created.');
    }
  });
  
}

function transformAttributes(attributes, initAttrOffset) {
  const properties = {};
  attributes.forEach(attr => {
    const key = Object.keys(attr)[0];
    properties[key] = {
      values: initAttrOffset,
      stringOffsets: initAttrOffset + 1
    };
    initAttrOffset += 2;
  });
  return properties;
}
// Creates schema properties based on the provided attributes.
function createSchemaProperties(attributes) {
  return attributes.reduce((acc, item) => {
    const key = Object.keys(item)[0]; // Get the key name (e.g., "Ambient_Tension")
    const description = key.split('_').join(' '); // Replace underscores with spaces for the description
    acc[key] = {
      name: key,
      description: description.charAt(0).toUpperCase() + description.slice(1), // Capitalize the first letter
      type: 'STRING' // Assuming all types are STRING as per your example
    };
    return acc;
  }, {});
}

async function processFile(fullPath, x,y,z) {
  const data = JSON.parse(await readFile(fullPath, 'utf8'));
 data.forEach((pole, index) => {
 })
  const outputPath = fullPath.replace('-data.json', '.gltf');

  createCylinderGLTF(outputPath, data, Number(x), Number(y), z);
}
function extractYFromFilename(filename) {
  // Split the filename by the '-' character and get the first part
  let parts = filename.split('-'); // This assumes the format is 'y-data.json'
  let y = parts[0]; // This should be 'y' from 'y-data.json'
  return y;
}
// Recursively process all directories and files
// Function to recursively walk through directory tree and process JSON files

async function walkDirectory(currentPath, x = null) {
  const z=18;
  const entries = await readdir(currentPath, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      await walkDirectory(fullPath, x === null ? entry.name : x);
    } else if (entry.isFile() && entry.name.endsWith('-data.json')) {
      const y = extractYFromFilename(entry.name);
      await processFile(fullPath, x,y,z);
    }
  }
}

const baseDirectory = '../../../../data/pole/18';
walkDirectory(baseDirectory);
// createCylinderGLTF(poleData, 472760, 190794,18);


