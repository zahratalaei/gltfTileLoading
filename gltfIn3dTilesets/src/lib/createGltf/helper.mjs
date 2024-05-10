

import * as Cesium from "cesium";

// const data = [
//     [
//       {
//         x: -3929812.986091716,
//         y: 2790844.4248461397,
//         z: -4163143.216796866,
//       },
//       {
//         x: -3929815.4887321773,
//         y: 2790841.1872122977,
//         z: -4163142.1413248205,
//       },
//       {
//         x: -3929818.055068156,
//         y: 2790837.994813905,
//         z: -4163141.133785391,
//       },
//       {
//         x: -3929820.684923532,
//         y: 2790834.847525641,
//         z: -4163140.1939905705,
//       },
//       {
//         x: -3929823.3781603356,
//         y: 2790831.7452492793,
//         z: -4163139.321793026,
//       },
//       {
//         x: -3929826.134678655,
//         y: 2790828.6879136288,
//         z: -4163138.5170860267,
//       },
//       {
//         x: -3929828.9544165917,
//         y: 2790825.675474482,
//         z: -4163137.7798033655,
//       },
//       {
//         x: -3929831.8373502037,
//         y: 2790822.707914603,
//         z: -4163137.1099193366,
//       },
//       {
//         x: -3929834.783493507,
//         y: 2790819.7852436965,
//         z: -4163136.5074487017,
//       },
//       {
//         x: -3929837.7928984785,
//         y: 2790816.907498432,
//         z: -4163135.972446715,
//       },
//       {
//         x: -3929840.8656550837,
//         y: 2790814.0747424606,
//         z: -4163135.505009144,
//       },
//     ], 
//     [
//       {
//         x: -3929841.027838534,
//         y: 2790814.1877530655,
//         z: -4163135.591126438,
//       },
//       {
//         x: -3929844.4487491003,
//         y: 2790809.947708644,
//         z: -4163134.218047879,
//       },
//       {
//         x: -3929847.9679144137,
//         y: 2790805.7774416227,
//         z: -4163132.949759039,
//       },
//       {
//         x: -3929851.585090907,
//         y: 2790801.676778537,
//         z: -4163131.7859997735,
//       },
//       {
//         x: -3929855.3001144365,
//         y: 2790797.6456023133,
//         z: -4163130.726594648,
//       },
//       {
//         x: -3929859.1129001393,
//         y: 2790793.6838521957,
//         z: -4163129.7714527845,
//       },
//       {
//         x: -3929863.02344238,
//         y: 2790789.79152368,
//         z: -4163128.920567793,
//       },
//       {
//         x: -3929867.0318147317,
//         y: 2790785.968668516,
//         z: -4163128.1740177646,
//       },
//       {
//         x: -3929871.138170044,
//         y: 2790782.2153947526,
//         z: -4163127.5319653368,
//       },
//       {
//         x: -3929875.342740564,
//         y: 2790778.5318668205,
//         z: -4163126.994657824,
//       },
//       {
//         x: -3929879.645838126,
//         y: 2790774.9183056634,
//         z: -4163126.562427418,
//       },
//     ],
//      [
//       {
//         x: -3929812.5475649945,
//         y: 2790844.535527413,
//         z: -4163142.991662944,
//       },
//       {
//         x: -3929812.6899588,
//         y: 2790844.878468089,
//         z: -4163141.4622773067,
//       },
//       {
//         x: -3929812.893559193,
//         y: 2790845.264875959,
//         z: -4163139.998169718,
//       },
//       {
//         x: -3929813.156677507,
//         y: 2790845.6935517844,
//         z: -4163138.597539114,
//       },
//       {
//         x: -3929813.477870139,
//         y: 2790846.1634703693,
//         z: -4163137.2588457987,
//       },
//       {
//         x: -3929813.8559326055,
//         y: 2790846.6737763407,
//         z: -4163135.9808051004,
//       },
//       {
//         x: -3929814.2898945883,
//         y: 2790847.2237806055,
//         z: -4163134.7623820906,
//       },
//       {
//         x: -3929814.7790159285,
//         y: 2790847.812957542,
//         z: -4163133.6027873135,
//       },
//       {
//         x: -3929815.3227835954,
//         y: 2790848.4409428104,
//         z: -4163132.5014735386,
//       },
//       {
//         x: -3929815.9209095533,
//         y: 2790849.1075318754,
//         z: -4163131.458133508,
//       },
//       {
//         x: -3929816.5733295977,
//         y: 2790849.8126791418,
//         z: -4163130.472698673,
//       },
//     ]
// ];

// const cartesians =[
//       {
//         x: -3929812.986091716,
//         y: 2790844.4248461397,
//         z: -4163143.216796866,
//       },
//       {
//         x: -3929815.4887321773,
//         y: 2790841.1872122977,
//         z: -4163142.1413248205,
//       },
//       {
//         x: -3929818.055068156,
//         y: 2790837.994813905,
//         z: -4163141.133785391,
//       },
//       {
//         x: -3929820.684923532,
//         y: 2790834.847525641,
//         z: -4163140.1939905705,
//       },
//       {
//         x: -3929823.3781603356,
//         y: 2790831.7452492793,
//         z: -4163139.321793026,
//       },
//       {
//         x: -3929826.134678655,
//         y: 2790828.6879136288,
//         z: -4163138.5170860267,
//       },
//       {
//         x: -3929828.9544165917,
//         y: 2790825.675474482,
//         z: -4163137.7798033655,
//       },
//       {
//         x: -3929831.8373502037,
//         y: 2790822.707914603,
//         z: -4163137.1099193366,
//       },
//       {
//         x: -3929834.783493507,
//         y: 2790819.7852436965,
//         z: -4163136.5074487017,
//       },
//       {
//         x: -3929837.7928984785,
//         y: 2790816.907498432,
//         z: -4163135.972446715,
//       },
//       {
//         x: -3929840.8656550837,
//         y: 2790814.0747424606,
//         z: -4163135.505009144,
//       },
//     ]
const encoder = new TextEncoder();

/**
 * Calculates the center Cartesian coordinates of a tile specified by its tile indices and zoom level.
 * @param {Number} x - The X coordinate of the tile.
 * @param {Number} y - The Y coordinate of the tile.
 * @param {Number} z - The zoom level of the tile.
 * @returns {Cesium.Cartesian3} The Cartesian coordinates representing the center of the tile.
 */
export function calculateTileCenter(x, y, z) {
  // Create a GeographicTilingScheme instance
  const tilingScheme = new Cesium.GeographicTilingScheme();

  // Convert tile indices to a geographic rectangle
  const rectangle = tilingScheme.tileXYToRectangle(x, y, z);
  
  // Find the center of the geographic rectangle
  const centerCartographic = Cesium.Rectangle.center(rectangle);
  
  // Convert Cartographic coordinates (radians) to Cartesian coordinates (3D coordinates)
  const centerCartesian = Cesium.Cartographic.toCartesian(centerCartographic);
  
  // Return the center Cartesian coordinates
  return centerCartesian;
}


/**
 * Localizes the coordinates of a point relative to a given center.
 * @param {Object} point - The point object containing x, y, and z coordinates.
 * @param {Object} center - The center object containing x, y, and z coordinates.
 * @returns {Object} An object containing the localized x, y, and z coordinates.
 */
export function localizeCoordinates(point, center) {
  return {
    x: point.x - center.x,
    y: point.y - center.y,
    z: point.z - center.z
  };
}

// Converts a Uint8Array to a base64-encoded string.
export function uint8ArrayToBase64(uint8Array) {
  let binaryString = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binaryString);
}

// Concatenates multiple typed arrays into a single Uint8Array.
export function concatenateTypedArrays(arrays) {
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

/**
 * Creates a buffer containing encoded strings along with their offsets.
 * @param {Array<string>} stringsArray - An array of strings to encode.
 * @returns {Object} An object containing the encoded strings, strings' offsets buffer, and other lengths.
 */
export function createStringBufferWithStringOffset(stringsArray) {
  // Concatenate all strings into a single string
  const concatenatedStrings = stringsArray.join('');
  // Encode the concatenated string into binary data
  const encodedStrings = encoder.encode(concatenatedStrings);
  // Calculate the byte length of the encoded strings
  const encodedStringsByteLength = encodedStrings.byteLength;

  // Initialize variables for string offsets
  let stringOffset = 0;
  // Calculate the offsets for each string in the concatenated string
  const stringsOffsets = stringsArray.map(string => {
    const offset = stringOffset;
    // Update the string offset for the next string
    stringOffset += encoder.encode(string).length;
    return offset;
  });
  // Add the final string offset to the offsets array
  stringsOffsets.push(stringOffset);
  
  // Convert the offsets array into a Uint32Array
  const offsetsBuffer = new Uint32Array(stringsOffsets);
  // Convert the Uint32Array into a Uint8Array
  const stringsOffsetsBuffer = new Uint8Array(offsetsBuffer.buffer);
  // Calculate the byte length of the offsets buffer
  const stringsOffsetsBufferLength = stringsOffsetsBuffer.byteLength;

  return {
    encodedStrings: encodedStrings, // The binary data for the encoded strings
    stringsOffsetsBuffer: stringsOffsetsBuffer, // The binary data for the strings' offsets
    encodedStringsByteLength: encodedStringsByteLength, // Length of the encoded strings data
    offsetsBufferLength: stringsOffsetsBufferLength, // Length of the offsets data
    totalBufferLength: encodedStringsByteLength + stringsOffsetsBufferLength // Total length of all binary data
  };
}

