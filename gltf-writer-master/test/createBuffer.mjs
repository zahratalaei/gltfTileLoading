import { Buffer } from "buffer";

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
    MaintenanceArea: "Marrawah",
    MaxWind_Tension: 0.541,
    MaxWind_Tension_CBL: 1.933,
    Minimum_Ground_Clearance: 4.6,
    Nominal_Breaking_Load: 28,
    Voltage: "Service",
  },
];

export function createDataURIfromBuffers(data) {
  // Size per float in bytes
  const sizePerFloat = 4; // Float32Array uses 4 bytes per float
  // Number of floats per point (x, y, z)
  const floatsPerPoint = 3;
  // Size per point in bytes
  const sizePerPoint = floatsPerPoint * sizePerFloat;
  // Number of points per set
  const pointsPerSet = 11;
  // Size per set in bytes
  const cartesianSetByteLength = pointsPerSet * sizePerPoint;

  let buffers = [];
  let byteLengths = [];
  // Function to calculate the byte length of a string in UTF-8
  const utf8ByteLength = (str) => Buffer.byteLength(str, "utf-8");
  //  Create a flat array of all cartesian points and then create a buffer of them
  const flatCartesians = data.flatMap((item) => item.cartesian).flat();
  const flatCartesiansArray = new Float64Array(
    flatCartesians.map((point) => [point.x, point.y, point.z]).flat()
  );

  // Convert Float32Array to Node.js Buffer
  const cartesianBuffer = Buffer.from(flatCartesiansArray.buffer);

  // convert cartesian buffer to base64
  const cartesianBufferBase64String = cartesianBuffer.toString("base64");

  //  Assign featureId to each cartesians set and create an array of those indexes
  const featureIds = data.flatMap((item, index) =>
    Array(item.cartesian.length).fill(index)
  );

  // Encode featureIds as binary data using Int32Array
  const featureIdsArray = new Int32Array(featureIds);
  const featureIdsBuffer = Buffer.from(featureIdsArray.buffer);
  // convert featureIds buffer to base64
  const featureIdsBufferBase64String = featureIdsBuffer.toString("base64");
  // Size of binary representation of each featureId in bytes
  const featureIdByteLength = featureIdsArray.BYTES_PER_ELEMENT;

  // Initialize arrays to hold attribute buffers and their sizes
  let attributeBuffers = [];
  let attributeValueSizes = []; // For individual value sizes
  let attributeTotalSizes = []; // For total size of each attribu
  //  Create a flat array of other attributes excluding 'color'
  const attributes = Object.keys(data[0]).reduce((acc, key) => {
    if (key !== "color" && key !== "cartesian") {
      // Transform each item's value for the current key based on your criteria
      const values = data.map((item) => {
        const value = item[key];
        // Convert numbers to strings and handle undefined values by converting them to "NA"
        if (typeof value === "number") {
          return value.toString();
        } else if (typeof value === "undefined") {
          return "NA";
        } else {
          return value;
        }
      });
      // Push the transformed values array under the current key
      acc.push({ [key]: values });
    }
    return acc;
  }, []);
  const allValuesFlattened = attributes.flatMap((attribute) =>
    Object.values(attribute).flat()
  );

  const byteLengthsArray = allValuesFlattened.map((value) =>
    Buffer.byteLength(value, "utf-8")
  );

  // Assuming allValuesFlattened contains all the values as strings
  const allValuesString = allValuesFlattened.join(""); // Concatenate all values into a single string

  // Convert the concatenated string to a Buffer
  const bufferString = Buffer.from(allValuesString, "utf-8");
  // Encode the Buffer as a Base64 string
  const base64String = bufferString.toString("base64");
  // Assuming byteLengthsArray contains the byte lengths of each value
  const byteLengthsTypedArray = new Uint32Array(byteLengthsArray);
  // Convert the Uint32Array to a Buffer
  const byteLengthsBuffer = Buffer.from(byteLengthsTypedArray.buffer);
  // console.log("🚀 ~ byteLengthsBuffer:", byteLengthsBuffer);

  // Create an array of these lengths
  const bufferLengthsArray = {
    cartesianBufferLength: cartesianBuffer.length,
    featureIdsBufferLength: featureIdsBuffer.length,
    bufferStringLength: bufferString.length,
    byteLengthsBufferLength: byteLengthsBuffer.length,
  };

  const lengthsTypedArray = new Uint32Array([
    bufferLengthsArray.cartesianBufferLength,
    bufferLengthsArray.featureIdsBufferLength,
    bufferLengthsArray.bufferStringLength,
    bufferLengthsArray.byteLengthsBufferLength,
  ]);

  // Convert the Uint32Array to a Node.js Buffer
  const lengthsBuffer = Buffer.from(lengthsTypedArray.buffer);
  // Concatenate all buffers: cartesian data, feature IDs, and attributes
  const combinedBuffer = Buffer.concat([
    lengthsBuffer,
    cartesianBuffer,
    featureIdsBuffer,
    bufferString,
    byteLengthsBuffer,
  ]);

  // Convert the combined buffer to Base64 string for transmission/storage
  const combinedBase64String = combinedBuffer.toString("base64");

  // Creating a combined data URI
  const dataURI = `data:application/octet-stream;base64,${combinedBase64String}`;

  return dataURI;
}

