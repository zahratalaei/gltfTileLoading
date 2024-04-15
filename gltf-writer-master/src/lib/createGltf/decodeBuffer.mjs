import { createDataURIfromData } from "./createBuffer.mjs";
import { Buffer } from "node:buffer";


const data = [
  {
    cartesian: [
      {
        x: -3929812.986091716,
        y: 2790844.4248461397,
        z: -4163143.216796866,
      },
      {
        x: -3929815.4887321773,
        y: 2790841.1872122977,
        z: -4163142.1413248205,
      },
      {
        x: -3929818.055068156,
        y: 2790837.994813905,
        z: -4163141.133785391,
      },
      {
        x: -3929820.684923532,
        y: 2790834.847525641,
        z: -4163140.1939905705,
      },
      {
        x: -3929823.3781603356,
        y: 2790831.7452492793,
        z: -4163139.321793026,
      },
      {
        x: -3929826.134678655,
        y: 2790828.6879136288,
        z: -4163138.5170860267,
      },
      {
        x: -3929828.9544165917,
        y: 2790825.675474482,
        z: -4163137.7798033655,
      },
      {
        x: -3929831.8373502037,
        y: 2790822.707914603,
        z: -4163137.1099193366,
      },
      {
        x: -3929834.783493507,
        y: 2790819.7852436965,
        z: -4163136.5074487017,
      },
      {
        x: -3929837.7928984785,
        y: 2790816.907498432,
        z: -4163135.972446715,
      },
      {
        x: -3929840.8656550837,
        y: 2790814.0747424606,
        z: -4163135.505009144,
      },
    ],
    color: "#000100",
    Ambient_Tension: 0.586,
    Ambient_Tension_CBL: 4.188,
    Bay_Id: "199709",
    Captured_Date: "2022-12-18",
    Captured_Time: "11:55:48",
    ConductorId: "591622",
    Conductor_Length: 42,
    Depot: "North West",
    MaintenanceArea: "Marrawah South",
    MaxWind_Tension: 3.214,
    MaxWind_Tension_CBL: 22.954,
    Minimum_Ground_Clearance: 5.6,
    Minimum_Road_Clearance: 5.8,
    Nominal_Breaking_Load: 14,
    Voltage: "LV ABC",
  },
  {
    cartesian: [
      {
        x: -3929841.027838534,
        y: 2790814.1877530655,
        z: -4163135.591126438,
      },
      {
        x: -3929844.4487491003,
        y: 2790809.947708644,
        z: -4163134.218047879,
      },
      {
        x: -3929847.9679144137,
        y: 2790805.7774416227,
        z: -4163132.949759039,
      },
      {
        x: -3929851.585090907,
        y: 2790801.676778537,
        z: -4163131.7859997735,
      },
      {
        x: -3929855.3001144365,
        y: 2790797.6456023133,
        z: -4163130.726594648,
      },
      {
        x: -3929859.1129001393,
        y: 2790793.6838521957,
        z: -4163129.7714527845,
      },
      {
        x: -3929863.02344238,
        y: 2790789.79152368,
        z: -4163128.920567793,
      },
      {
        x: -3929867.0318147317,
        y: 2790785.968668516,
        z: -4163128.1740177646,
      },
      {
        x: -3929871.138170044,
        y: 2790782.2153947526,
        z: -4163127.5319653368,
      },
      {
        x: -3929875.342740564,
        y: 2790778.5318668205,
        z: -4163126.994657824,
      },
      {
        x: -3929879.645838126,
        y: 2790774.9183056634,
        z: -4163126.562427418,
      },
    ],
    color: "#000100",
    Ambient_Tension: 0.584,
    Ambient_Tension_CBL: 3.454,
    Bay_Id: "199708",
    Captured_Date: "2022-12-18",
    Captured_Time: "11:55:47",
    ConductorId: "591621",
    Conductor_Length: 56,
    Depot: "North West",
    MaintenanceArea: "Marrawah South",
    MaxWind_Tension: 2.157,
    MaxWind_Tension_CBL: 12.763,
    Minimum_Ground_Clearance: 6,
    Nominal_Breaking_Load: 16.9,
    Voltage: "LV ABC",
  },
  {
    cartesian: [
      {
        x: -3929812.5475649945,
        y: 2790844.535527413,
        z: -4163142.991662944,
      },
      {
        x: -3929812.6899588,
        y: 2790844.878468089,
        z: -4163141.4622773067,
      },
      {
        x: -3929812.893559193,
        y: 2790845.264875959,
        z: -4163139.998169718,
      },
      {
        x: -3929813.156677507,
        y: 2790845.6935517844,
        z: -4163138.597539114,
      },
      {
        x: -3929813.477870139,
        y: 2790846.1634703693,
        z: -4163137.2588457987,
      },
      {
        x: -3929813.8559326055,
        y: 2790846.6737763407,
        z: -4163135.9808051004,
      },
      {
        x: -3929814.2898945883,
        y: 2790847.2237806055,
        z: -4163134.7623820906,
      },
      {
        x: -3929814.7790159285,
        y: 2790847.812957542,
        z: -4163133.6027873135,
      },
      {
        x: -3929815.3227835954,
        y: 2790848.4409428104,
        z: -4163132.5014735386,
      },
      {
        x: -3929815.9209095533,
        y: 2790849.1075318754,
        z: -4163131.458133508,
      },
      {
        x: -3929816.5733295977,
        y: 2790849.8126791418,
        z: -4163130.472698673,
      },
    ],
    color: "#800000",
    Ambient_Tension: 0.142,
    Ambient_Tension_CBL: 0.506,
    Bay_Id: "199710",
    Captured_Date: "2022-12-18",
    Captured_Time: "11:31:27",
    ConductorId: "591623",
    Conductor_Length: 14.4,
    Conductor_Type: "4cABC25mm",
    Depot: "North West",
    MaintenanceArea: "Marrawah South",
    MaxWind_Tension: 0.541,
    MaxWind_Tension_CBL: 1.933,
    Minimum_Ground_Clearance: 4.6,
    Nominal_Breaking_Load: 28,
    Voltage: "Service",
  },
];
const {
  dataURI,
  combinedBufferByteLength,
  cartesiansArray,
  byteLengthsArray,
  lengthsTypedArray,
} = createDataURIfromData(data);
  console.log("🚀 ~ lengthsTypedArray:", lengthsTypedArray)

export function getCombinedBufferFromdataURI(dataURI) {
  // Extract the Base64-encoded string from the dataURI
  const base64String = dataURI.split(",")[1];

  // Decode the Base64 string back into a Buffer
  const combinedBuffer = Buffer.from(base64String, "base64");

  return combinedBuffer;
}

//function to decode cartesian buffer base 64
function decodeCartesianBuffer64String(cartesianBuffer64String) {
  // Convert the Base64 string back to a Buffer
  const cartesianBufferFromBase64 = Buffer.from(
    
    cartesianBuffer64String,
    "base64"
  );

  // Convert the Buffer back to a Float64Array
  const cartesianFloatArray = new Float64Array(
    cartesianBufferFromBase64.buffer,
    cartesianBufferFromBase64.byteOffset,
    cartesianBufferFromBase64.byteLength / Float64Array.BYTES_PER_ELEMENT
  );

  // Decode the Float64Array back into an array of cartesian coordinate objects
  const cartesianCoordinates = [];
  for (let i = 0; i < cartesianFloatArray.length; i += 3) {
    const x = cartesianFloatArray[i];
    const y = cartesianFloatArray[i + 1];
    const z = cartesianFloatArray[i + 2];
    cartesianCoordinates.push({ x, y, z });
  }

  return cartesianCoordinates;
}
// function to decode featureIds buffer base64
function decodeFeatureIdsBufferBase64String(featureIdsBufferBase64String) {
    // Convert the Base64 string back to a Buffer
    const featureIdsBufferFromBase64 = Buffer.from(featureIdsBufferBase64String, "base64");
    
    // Create an Int32Array from the Buffer
    // Note: If the buffer might not be byte-aligned or if it's a slice of a larger buffer,
    // you may need to copy it into an ArrayBuffer of the correct length first.
    const featureIdsArray = new Int32Array(
        featureIdsBufferFromBase64.buffer, 
        featureIdsBufferFromBase64.byteOffset, 
        featureIdsBufferFromBase64.byteLength / Int32Array.BYTES_PER_ELEMENT
    );
    
    // The Int32Array can be used directly, but you might want to convert it to a regular array for ease of use
    const featureIds = Array.from(featureIdsArray);
    
    return featureIds;
}

// //function to decode Attributes
function decodeAttributes(buffer) {
  const decoder = new TextDecoder('utf-8');
  // Step 1: Decode the entire buffer back to a string
  const decodedString = decoder.decode(buffer);

  // Step 2: Split the decoded string by spaces to get each attribute's concatenated values
  const attributeGroups = decodedString.split(' ');

  // Since the original question does not specify how to further process or identify each group of values,
  // the attributeGroups array contains each set of concatenated attribute values as a separate string.
  // Further processing can be applied as needed, based on the structure and requirements of your application.

  return attributeGroups;
}
// function decodeAttributes(bufferString, byteLengthsArray) {
//   const base64String = bufferString.toString("base64");

//   // Decode the Base64 string back to Buffer
//   const decodedBuffer = Buffer.from(base64String, "base64");

//   // Convert the Buffer back to string (Assuming 'utf-8' encoding)
//   const decodedString = decodedBuffer.toString("utf-8");

//   // Split the decoded string into individual attribute values based on byte lengths
//   let attributes = [];
//   let offset = 0;
//   for (let length of byteLengthsArray) {
//     // Extract the attribute value by its length and update the offset
//     const attributeValue = decodedString.substr(offset, length);
//     attributes.push(attributeValue);
//     offset += Buffer.byteLength(attributeValue, "utf-8");
//   }

//   return attributes;
// }


//function to decode byteLengthsArray
function decodedByteLengthsBuffer(byteLengthsBuffer) {
  // Create a copy of the buffer to ensure it's aligned correctly for Uint32Array
  // This step is crucial if byteLengthsBuffer might be a slice with an unaligned byteOffset
  const alignedBuffer = Buffer.from(byteLengthsBuffer);

  // Now create a Uint32Array from the aligned buffer's underlying ArrayBuffer.
  // Since we're creating a new Buffer with Buffer.from(), the byteOffset is 0 and the buffer is aligned.
  const decodedByteLengthsTypedArray = new Uint32Array(
    alignedBuffer.buffer,
    alignedBuffer.byteOffset,
    alignedBuffer.byteLength / Uint32Array.BYTES_PER_ELEMENT
  );

  // Convert the Uint32Array to a regular JavaScript array for easier use.
  const decodedByteLengthsArray = Array.from(decodedByteLengthsTypedArray);
  return decodedByteLengthsArray;
}

//function to extract  from dataURI
export function extractBuffersFromCombined(dataURI, lengthsTypedArray) {
  const combinedBuffer = getCombinedBufferFromdataURI(dataURI);
  // // Determine the byte length of the lengths portion (4 * 32-bit integers)
  // const headerByteLength = 4 * Uint32Array.BYTES_PER_ELEMENT;

  // // Create a Uint32Array from the combined buffer's ArrayBuffer, adjusted for byteOffset
  // // Ensure the slice of the combined buffer used for lengthsTypedArray is correct
  // const lengthsBuffer = combinedBuffer.slice(0, headerByteLength);
  // const lengthsTypedArray = new Uint32Array(
  //   lengthsBuffer.buffer,
  //   lengthsBuffer.byteOffset,
  //   4
  // );

const [
  cartesianBufferLength,
  featureIdsBufferLength,
  bufferStringLength,
  byteLengthsBufferLength,
] = lengthsTypedArray;


  // Start slicing after the lengths buffer
  let offset = 0;
  const cartesianBuffer = combinedBuffer.slice(
    offset,
    (offset += cartesianBufferLength)
  );
  const featureIdsBuffer = combinedBuffer.slice(
    offset,
    (offset += featureIdsBufferLength)
  );
  const bufferString = combinedBuffer.slice(
    offset,
    (offset += bufferStringLength)
  );
  const byteLengthsBuffer = combinedBuffer.slice(
    offset,
    (offset += byteLengthsBufferLength)
  );

  // Recreate the lengthsBuffer for completeness
  // Note: This step might be redundant if you only need the lengths for slicing
  // and not for any subsequent processing or output.

  return {
    cartesianBuffer,
    featureIdsBuffer,
    bufferString,
    byteLengthsBuffer,
  };
}


//function to give all decoded data from dataURI
export function decodeData(dataURI, lengthsTypedArray) {
  const extractedBuffers = extractBuffersFromCombined(
    dataURI,
    lengthsTypedArray
  );
  // const decodeLengthBuffer = decodeFeatureIdsBufferBase64String(
  //   extractedBuffers.lengthsBuffer
  // );
  const cartesian = decodeCartesianBuffer64String(
    extractedBuffers.cartesianBuffer
  );
  const featureIdsBuffer = decodeFeatureIdsBufferBase64String(
    extractedBuffers.featureIdsBuffer
  );

  const decodedByteLengthsArray = decodedByteLengthsBuffer(
    extractedBuffers.byteLengthsBuffer
  );
  const attributes = decodeAttributes(
    extractedBuffers.bufferString,
    decodedByteLengthsArray
  );
  return {
    cartesian,
    featureIdsBuffer,
    attributes,
    decodedByteLengthsArray,
  };
}

const decodedData = decodeData(dataURI, lengthsTypedArray);
console.log("🚀 ~ decodedData:", decodedData)
