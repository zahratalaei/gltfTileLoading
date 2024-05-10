import { Buffer } from 'buffer';
import { calculateTileCenter } from './helper.mjs';

const poleData = [
  {
    color: '#000100',
    coordinates: [
      {
        Longitude: 144.61868540576725,
        Latitude: -41.008482793412135,
        Elevation: 6.801814204179589
      },
      {
        Longitude: 144.61868429514539,
        Latitude: -41.00848126843706,
        Elevation: 14.266444676203603
      }
    ],
    Pole_Id: '167493',
    Site_Label: '921292',
    Max_Voltage: 'LV ABC',
    Pole_Height: 7.5,
    Pole_Lean: 1.5,
    Captured_Date: '2022-12-18',
    Captured_Time: '11:55:46',
    MaintenanceArea: 'Marrawah South',
    Depot: 'North West'
  },
  {
    color: '#000100',
    coordinates: [
      {
        Longitude: 144.61916699488626,
        Latitude: -41.00839934395629,
        Elevation: 6.174048665595663
      },
      {
        Longitude: 144.61917028428627,
        Latitude: -41.008399699949834,
        Elevation: 13.38349549865179
      }
    ],
    Pole_Id: '167492',
    Site_Label: '212502',
    Max_Voltage: 'LV ABC',
    Pole_Height: 7.2,
    Pole_Lean: 2.2,
    Captured_Date: '2022-12-18',
    Captured_Time: '11:31:25',
    MaintenanceArea: 'Marrawah South',
    Depot: 'North West'
  }
];
const x = 472760;
const y = 190794;
const zoomLevel = 18;
const encoder = new TextEncoder();

// Localizes the coordinates of a point relative to a given center.
export function localizeCoordinates(point, center) {
  return {
    x: point.x - center.x,
    y: point.y - center.y,
    z: point.z - center.z
  };
}

// Converts a Uint8Array to a base64-encoded string.
function uint8ArrayToBase64(uint8Array) {
  let binaryString = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binaryString);
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

function getProperPosition(point, x, y, zoomLevel) {
  //  const x = 472760;
  //  const y = 190794;
  //  const z = 18;
  const cartesian = convertCartographicToCartesian(point);
  const center = calculateTileCenter(x, y, z);
  const localizedPoint = localizeCoordinates(cartesian, center);
  return localizedPoint;
}

export function createDataURIfromData(poleData, x, y, zoomLevel) {
  let vertices = [];
  let normals = [];
  let indices = [];
  let vertexOffset = 0;
  const numSegments = 32;
  const radius = 0.2;
  const height = 1;
  let featureIDs = [];
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
    featureIDs = poleData.flatMap((_, index) => Array(vertices.length).fill(index));
  
  console.log('🚀 ~ createDataURIfromData ~ featureIDs:', featureIDs);
  const vertexData = new Float32Array(vertices.flat());
  const vertexBuffer = Buffer.from(vertexData.buffer);
  const normalData = new Float32Array(normals.flat());
  console.log('🚀 ~ createCylinderGLTF ~ normalData:', normalData.length);
  const normalBuffer = Buffer.from(normalData.buffer);
  console.log('🚀 ~ createCylinderGLTF ~ normalBuffer:', normalBuffer.byteLength);
  const indexData = new Uint32Array(indices);
  const indexBuffer = Buffer.from(indexData.buffer);
  // Encode featureIds as binary data using Int32Array
  const featureIdsArray = new Int32Array(featureIDs);
  const featureIdsBuffer = Buffer.from(featureIdsArray.buffer);

  //  const combinedBuffer = Buffer.concat([vertexBuffer, normalBuffer, indexBuffer, featureIdsBuffer]);
  //  const encodedData = combinedBuffer.toString('base64');

  const allStringsBinary = [];
  const metaDataBuffer = [];
  const attributes = Object.keys(poleData[0]).reduce((acc, key) => {
    if (key !== 'coordinates') {
      // Transform each item's value for the current key based on your criteria
      const values = poleData.map(item => {
        const value = item[key];
        // Convert numbers to strings and handle undefined values by converting them to "NA"
        if (typeof value === 'number') {
          return value.toString();
        } else if (typeof value === 'undefined') {
          return 'NA';
        } else {
          return value;
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
  console.log('🚀 ~ attributes ~ attributes:', attributes);
  const metadataCombinedArray = concatenateTypedArrays(allStringsBinary);
  const metadataCombinedArrayBuffer = Buffer.from(metadataCombinedArray);

  // Create an array of these lengths
  const bufferLengthsArray = {
    vertexBufferLength: vertexBuffer.length,
    normalBufferLength: normalBuffer.length,
    indexBufferLength: indexBuffer.length,
    featureIdsBufferLength: featureIdsBuffer.length
  };
  const lengthsTypedArray = new Uint32Array([
    bufferLengthsArray.vertexBufferLength,
    bufferLengthsArray.normalBufferLength,
    bufferLengthsArray.indexBufferLength,
    bufferLengthsArray.featureIdsBufferLength
  ]);

  // Concatenate all buffers: cartesian data, feature IDs, and attributes
  const combinedBuffer = Buffer.concat([vertexBuffer, normalBuffer, indexBuffer, featureIdsBuffer, metadataCombinedArrayBuffer]);
  // Convert the combined buffer to Base64 string for transmission/storage
  const combinedBase64String = uint8ArrayToBase64(combinedBuffer);
  // const combinedBase64String = combinedBuffer.toString('base64');
  // Creating a combined data URI
  const dataURI = `data:application/octet-stream;base64,${combinedBase64String}`;
  // Return both the data URI and the byte length of the combined buffer
  return {
    dataURI: dataURI,
    combinedBufferByteLength: combinedBuffer.length,
    lengthsTypedArray: lengthsTypedArray,
    attributes: attributes,
    metaDataBuffer: metaDataBuffer
  };
}

// Example usage:
const result = createDataURIfromData(poleData, x, y, zoomLevel);
// console.log("🚀 ~ result:", result)
// let s = 0;
// result.metaDataBuffer.map(data => {
//   s += data.totalBufferLength;
// });
