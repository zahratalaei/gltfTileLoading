import fs from 'fs';
import path from 'path';
import { createDataURIfromData } from './createBuffer.mjs';


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


// Finds the minimum and maximum values of x, y, and z coordinates in an array of Cartesian points.
function findMinMax(cartesianPoints) {
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

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

// Transformation matrix to convert from Y-up to Z-up
const yUpToZupMatrix = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];

// Creates a GLTF file based on the provided Cartesian points and attributes.
function createGltf(dataURI, cartesiansArray, combinedBufferByteLength, attributes, lengthsTypedArray, metaDataBuffer, outputPath) {
  try {
    const totalSets = cartesiansArray.length;
    // add primitives
    const primitives = cartesiansArray.map((_, index) => ({
      mode: 3, // TRIANGLES
      attributes: {
        POSITION: index,
        _FEATURE_ID_0: cartesiansArray.length + index
      },
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
    }));

    let gltf = {
      asset: { version: '2.0' },
      extensionsUsed: ['EXT_mesh_features', 'EXT_structural_metadata'],
      scenes: [{ nodes: [0] }],
      nodes: [
        {
          matrix: yUpToZupMatrix,
          mesh: 0
        }
      ],
      meshes: [{ primitives }],
      buffers: [
        {
          uri: dataURI,
          byteLength: combinedBufferByteLength
        }
      ],
      bufferViews: [],
      accessors: [],
      materials: [{ pbrMetallicRoughness: { baseColorFactor: [1.0, 0.0, 0.0, 1.0] } }],
      extensions: {
        EXT_structural_metadata: {
          schema: {
            classes: {
              conductorMetadata: {
                properties: {}
              }
            }
          },
          propertyTables: [
            {
              name: 'ConductorPropertyTable',
              class: 'conductorMetadata',
              count: totalSets,
              properties: {}
            }
          ]
        }
      }
    };

    let initAttrOffset = 2 * cartesiansArray.length;
    gltf.extensions.EXT_structural_metadata.propertyTables[0].properties = transformAttributes(attributes, initAttrOffset);
    gltf.extensions.EXT_structural_metadata.schema.classes.conductorMetadata.properties = createSchemaProperties(attributes, initAttrOffset);
    // add bufferViews for positions
    cartesiansArray.map((_, i) => {
      // Vertex Positions
      gltf.bufferViews.push({
        buffer: 0,
        byteOffset: i * 132,
        byteLength: 11 * 3 * 4, // 12 bytes per vertex
        target: 34962 // ARRAY_BUFFER for vertex attributes
      });
    });
    //add bufferViews for featureIds
    let currentOffset = lengthsTypedArray[0];
    cartesiansArray.map((_, i) => {
      gltf.bufferViews.push({
        buffer: 0,
        byteOffset: currentOffset,
        byteLength: 11 * 4,
        byteStride: 4,
        target: 34962 // ARRAY_BUFFER for FeatureIds
      });
      currentOffset += 44;
    });
    // add accessors for positions
    cartesiansArray.map((cartesianSet, i) => {
      const { minX, maxX, minY, maxY, minZ, maxZ } = findMinMax(cartesianSet);

      gltf.accessors.push({
        name: 'POSITION',
        bufferView: i,
        byteOffset: 0,
        componentType: 5126,
        count: cartesianSet.length,
        type: 'VEC3',
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ]
      });
    });
    // add accessors for featureIds
    cartesiansArray.map((cartesianSet, i) => {
      gltf.accessors.push({
        name: 'FeatureId',
        bufferView: cartesiansArray.length + i,
        byteOffset: 0,
        componentType: 5121, //UNSIGNED_BYTE
        count: cartesianSet.length,
        type: 'SCALAR',
        normalized: false
      });
    });

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

    fs.writeFileSync(outputPath, JSON.stringify(gltf, null, 2));
  } catch (e) {
    console.error(`Error creating GLTF : ${e.message}`);
  }
}

   
function extractYFromFilename(filename) {
  // Split the filename by the '-' character and get the first part
  let parts = filename.split('-'); // This assumes the format is 'y-data.json'
  let y = parts[0]; // This should be 'y' from 'y-data.json'   
  return y;
}
// Recursively process all directories and files
// Function to recursively walk through directory tree and process JSON files

function walkDirectory(currentPath, x = null) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  // If 'x' is null, we're at the 'conductors' level and need to capture 'x'
  if (x === null) {
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        // Capture 'x' and dive into the next level
        walkDirectory(path.join(currentPath, entry.name), entry.name);
      }
    });
  } else {
    // If 'x' is not null, we're inside 'x' and need to look for 'y'
    entries.forEach(entry => {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        // We found 'y', so now we look for the JSON files inside 'y'
        walkDirectory(fullPath, x); // Keep 'x' the same and enter the 'y' directory
      } else if (entry.isFile() && entry.name.endsWith('-data.json')) {
        // We have found a JSON file inside 'y', process it here
        let y = extractYFromFilename(entry.name); // 'currentPath' is the 'y' directory
        const readData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        // You can now use 'x' and 'y' as needed to create the buffer

        const { dataURI, combinedBufferByteLength, cartesiansArray, lengthsTypedArray, attributes, metaDataBuffer } = createDataURIfromData(readData,  Number(x), Number(y)); // Assuming createDataURIfromData accepts 'x' and 'y'
        const outputPath = fullPath.replace('-data.json', '.gltf');
        createGltf(dataURI, cartesiansArray, combinedBufferByteLength, attributes, lengthsTypedArray, metaDataBuffer, outputPath);
      }
    });
  }
}


// const baseDirectory = '../../tilesets';
const baseDirectory = '../../../data/conductors/18';
walkDirectory(baseDirectory);
