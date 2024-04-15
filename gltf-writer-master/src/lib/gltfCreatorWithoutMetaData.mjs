import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const zoomLevel = "16";
const voltageCategory = "low";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = {
  conductorsData: [
    {
      coordinates: [
        [22.034885352943093, -6.694437750149518, -45.824682337697595],
        [18.101614188868552, -9.84812617348507, -42.865545159671456],
        [14.07464520772919, -12.935274473857135, -40.006337356287986],
        [9.954291303642094, -15.956105270422995, -37.24672471778467],
        [5.740801754873246, -18.91079601086676, -34.58644088264555],
        [1.4343623900786042, -21.7994790840894, -32.02528715413064],
        [-2.9649042738601565, -24.62224191427231, -29.56313236290589],
        [-7.4569389573298395, -27.379127016291022, -27.199912786483765],
        [-12.041745580732822, -30.070132028777152, -24.93563208775595],
        [-16.71939125377685, -32.69520971691236, -22.770361341070384],
        [-21.49000633880496, -35.254267930053174, -20.704239058308303],
      ],
      ConductorId: "591620",
      Voltage: "LV ABC",
      Bay_Id: "199707",
      Conductor_Length: 58,
    },
    {
      coordinates: [
        [60.585075611714274, 32.62697914196178, -55.07875672727823],
        [57.164165045600384, 28.386934720445424, -53.70567816821858],
        [53.644999732263386, 24.216667699161917, -52.43738932814449],
        [50.027823239099234, 20.116004613693804, -51.273630062583834],
        [46.3127997093834, 16.084828389808536, -50.21422493690625],
        [42.50001400662586, 12.123078272212297, -49.259083073586226],
        [38.58947176579386, 8.230749756563455, -48.40819808188826],
        [34.581099414266646, 4.40789459226653, -47.66164805367589],
        [30.47474410198629, 0.654620829038322, -47.019595625810325],
        [26.27017358178273, -3.028907102998346, -46.4822881128639],
        [21.967076019849628, -6.642468260135502, -46.050057706888765],
      ],
      ConductorId: "591621",
      Voltage: "LV ABC",
      Bay_Id: "199708",
      Conductor_Length: 56,
    },
    {
      coordinates: [
        [-73.028529221192, -48.301165958400816, 14.233300796709955],
        [-78.92138824239373, -50.11270996928215, 20.471187552437186],
        [-84.99160643527284, -51.79830660298467, 26.51992608513683],
        [-91.23853683751076, -53.35841608559713, 32.3802080466412],
        [-97.66172421444207, -54.79336248897016, 38.05252060946077],
        [-104.26090456731617, -56.10333409579471, 43.53714699950069],
        [-111.0360048445873, -57.288383580278605, 48.834166809450835],
        [-117.98714286414906, -58.348428081255406, 53.94345608353615],
        [-125.1146274455823, -59.28324911603704, 58.86468717036769],
        [-132.41895874589682, -60.09249233221635, 63.597328388597816],
        [-139.90082879038528, -60.77566712209955, 68.14064344158396],
      ],
      ConductorId: "591618",
      Voltage: "LV ABC",
      Bay_Id: "199705",
      Conductor_Length: 87.2,
    },
    {
      coordinates: [
        [88.62682242970914, 62.864072216209024, -62.70442715520039],
        [86.12418196862563, 59.626438374165446, -61.62895510951057],
        [83.55784598970786, 56.434039981570095, -60.62141568027437],
        [80.9279906139709, 53.286751717329025, -59.681620859541],
        [78.23475381033495, 50.184475355781615, -58.80942331487313],
        [75.4782354910858, 47.127139705233276, -58.004716315772384],
        [72.65849755425006, 44.11470055859536, -57.267433654516935],
        [69.77556394226849, 41.147140679415315, -56.5975496256724],
        [66.82942063873634, 38.224469773005694, -55.995078990701586],
        [63.820015667472035, 35.346724508330226, -55.46007700404152],
        [60.74725906224921, 32.513968537095934, -54.9926394331269],
      ],
      ConductorId: "591622",
      Voltage: "LV ABC",
      Bay_Id: "199709",
      Conductor_Length: 42,
    },
    {
      coordinates: [
        [-21.959010941442102, -35.483878544997424, -20.523473317269236],
        [-26.678485904820263, -37.049097787588835, -16.630617254413664],
        [-31.486432573292404, -38.55149051127955, -12.832114196848124],
        [-36.382790385279804, -39.99110005097464, -9.127898958977312],
        [-41.36754467105493, -41.367937160190195, -5.517955292016268],
        [-46.44072663830593, -42.6819800036028, -2.002315873745829],
        [-51.60241339216009, -43.933174163103104, 1.4189376723952591],
        [-56.85272797010839, -45.12143260007724, 4.745674732606858],
        [-62.19183941464871, -46.24663560697809, 7.977715642657131],
        [-67.61996285058558, -47.30863075144589, 11.114831583574414],
        [-73.1373596037738, -48.307232794351876, 14.15674447407946],
      ],
      ConductorId: "591619",
      Voltage: "LV ABC",
      Bay_Id: "199706",
      Conductor_Length: 63.3,
    },
  ],
  center: {
    x: -3929901.612914146,
    y: 2790781.5607739235,
    z: -4163080.512369711,
  },
  modelMatrix: [
    0.9985262684144982, -0.04683115880899416, -0.027425058811691494, 0,
    0.04732333227271074, 0.9987249013924642, 0.017580488082528545, 0,
    0.026566774528056614, -0.01885242433269696, 0.9994692554490887, 0,
    -3929901.612914146, 2790781.5607739235, -4163080.512369711, 1,
  ],
};

const outputFilePath = path.join(__dirname, 'test.gltf');
// Function to calculate min and max values
function findMinMax(points) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;

  points.forEach((point) => {
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
    minY = Math.min(minY, point[1]);
    maxY = Math.max(maxY, point[1]);
    minZ = Math.min(minZ, point[2]);
    maxZ = Math.max(maxZ, point[2]);
  });

  return { minX, maxX, minY, maxY, minZ, maxZ };
}


const yUpToZupMatrix = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
// Encapsulate the GLTF creation process in a function
// jsdoc
/**
 * @param {string} inputFilePath
 * @param {string} outputFilePath
 * @returns {void}
 */

function createGltf(data) {
  try {
    // const totalSets = data.conductorsData.length;
    const totalSets = 3;
    console.log("🚀 ~ createGltf ~ totalSets:", totalSets);

    const bytesPerCoordinateSet = 3 * 4; // 11 points, each with 3 coordinates (Float32)
    const bytesPerAttributeSet = 4; // 2 attributes (Bay_Id and ConductorId), each 4 bytes (Int32)

    const byteLengthCoordinates = 11 * bytesPerCoordinateSet;
    const byteLengthAttributes = 2 * bytesPerAttributeSet;

    const bufferViews = [];
    const byteOffsets = [];

    // Buffer view for coordinates
    bufferViews.push({
      buffer: 0,
      byteOffset: 0,
      byteLength: byteLengthCoordinates,
      target: 34962, // ARRAY_BUFFER
    });
    byteOffsets.push(0);
    // Calculate the starting byte offset for Bay_Id data
    const bayIdByteOffset = byteLengthCoordinates;
    // BufferView for Bay_Id data
    bufferViews.push({
      buffer: 0,
      byteOffset: bayIdByteOffset,
      byteLength: byteLengthAttributes, // Assuming all Bay_Ids are stored consecutively
      // "target" is optional here since this data might not be used as vertex attributes
    });
    // Calculate the starting byte offset for ConductorId data
    const conductorIdByteOffset = bayIdByteOffset + byteLengthAttributes;
    byteOffsets.push(byteLengthCoordinates);
    // BufferView for ConductorId data
    bufferViews.push({
      buffer: 0,
      byteOffset: conductorIdByteOffset,
      byteLength: byteLengthAttributes, // Assuming all ConductorIds are stored consecutively
      // "target" is optional for the same reason as Bay_Id
    });
    const gltf = {
      asset: { version: "2.0" },
      scenes: [{ nodes: [0] }],
      nodes: [
        {
          matrix: yUpToZupMatrix,
          name: "rootNode",
          children: Array.from({ length: totalSets }, (_, i) => i + 1),
        },
      ],
      meshes: [],
      accessors: [],
      bufferViews: bufferViews,
      buffers: [
        {
          uri: "./test2.bin",
          byteLength: byteLengthCoordinates + byteLengthAttributes,
        },
      ],
      materials: [
        { pbrMetallicRoughness: { baseColorFactor: [1.0, 0.0, 0.0, 1.0] } },
      ],
      extensionsUsed: ["EXT_mesh_features", "EXT_structural_metadata"],
      extensions: {
        EXT_structural_metadata: {
          schema: {
            id: "FeatureIdAttributeAndPropertyTableSchema",
            classes: {
                conductorMetadataClass: { // Renamed for clarity
                  name: "Conductor Metadata",
                  description: "Properties of a conductor",
                  properties: {
                    ConductorId: {
                      name: "Conductor ID",
                      description: "Unique identifier for the conductor",
                      type: "SCALAR",
                      componentType: "UINT32", // Assuming IDs are unsigned integers
                    },
                    Bay_Id: {
                      name: "Bay ID",
                      description: "Identifier for the bay associated with the conductor",
                      type: "SCALAR",
                      componentType: "UINT32",
                    },
                    // Include other properties as needed
                  },
                },
              },
              propertyTables: [
                {
                  name: "Conductor Properties",
                  class: "conductorMetadataClass", // Match the class name defined above
                  count: totalSets, // The number of conductors
                  properties: {
                    ConductorId: {
                      values: ,
                    },
                    Bay_Id: {
                      values: ,
                    },
                    // Include arrays of other property values as needed
                  },
                },
              ],
        },
      },
    };
    // Assuming starting byteOffset for positions is 0
    let currentByteOffset = 0;

    for (let i = 0; i < totalSets; i++) {
      const { minX, maxX, minY, maxY, minZ, maxZ } = findMinMax(
        data.conductorsData[i].coordinates
      );

      // Accessor for coordinates
      gltf.accessors.push({
        bufferView: 0,
        byteOffset: currentByteOffset,
        componentType: 5126, // FLOAT32
        count: 11, // 11 points
        type: "VEC3",
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ],
      });
      currentByteOffset += byteLengthCoordinates;

      // Accessor for attributes (Bay_Id)
      gltf.accessors.push({
        bufferView: 1, // Assuming Bay_Id is in the second bufferView
        byteOffset: 0,
        componentType: 5125, // UNSIGNED_INT
        count: totalSets,
        type: "SCALAR",
      });
      // Add an accessor for ConductorId
      gltf.accessors.push({
        bufferView: 2, // Assuming ConductorId is in the third bufferView
        byteOffset: 0,
        componentType: 5125, // UNSIGNED_INT
        count: totalSets,
        type: "SCALAR",
      });
      // Meshes
      gltf.meshes.push({
        primitives: [
            {
              extensions: {
                EXT_mesh_features: {
                  featureIds: [
                    {
                      featureCount: conductor.coordinates.length,
                      attribute: "_FEATURE_ID_0",
                      propertyTable: i // Assuming one property table per conductor
                    }
                  ]
                }
              },
              attributes: {
                POSITION: index, // Simplified; in reality, you'd need to create accessors for these
                "_FEATURE_ID_0": i + 1000, // Example; adjust based on actual accessor indices
              },
              indices: i, // Simplified; assuming an accessor for indices exists
              material: 0, // Assuming a default material
              mode: 4 // TRIANGLES
            }
          ]
      });

      // Nodes
      gltf.nodes.push({
        mesh: i,
        // Uncomment and add transformation matrix if needed
      });
    }

    // Write GLTF to file
    fs.writeFileSync(outputFilePath, JSON.stringify(gltf, null, 2));

    console.log("GLTF created successfully!");
  } catch (e) {
    console.error(`Error creating GLTF: ${e.message}`);
  }
}
createGltf(data);
// 
//         // Define your transformation matrix
//         const bytesPerSet = 132;
//         let gltf = {
//             asset: { version: "2.0" },
//             scenes: [{ nodes: [0] }],
//             nodes: [{ matrix: yUpToZupMatrix, name: "rootNode", children: Array.from({ length: totalSets }, (_, i) => i + 1) }],
//             meshes: [],
//             accessors: [],
//             bufferViews: Array.from({ length: totalSets }, (_, i) => ({
//                 buffer: 0,
//                 byteOffset: i * bytesPerSet,
//                 byteLength: bytesPerSet
//             })),
//             buffers: [{ uri: binFileRelativePath, byteLength: totalSets * bytesPerSet }],
//             materials: [{ pbrMetallicRoughness: { baseColorFactor: [1.0, 0.0, 0.0, 1.0] } }]
//         };

//         for (let i = 0; i < totalSets; i++) {
//             const { minX, maxX, minY, maxY, minZ, maxZ } = findMinMax(allPointsSets[i]);

//             gltf.accessors.push({
//                 bufferView: i,
//                 byteOffset: 0,
//                 componentType: 5126,
//                 count: allPointsSets[i].length,
//            type: "VEC3",
//                 max: [maxX, maxY, maxZ],
//                 min: [minX, minY, minZ]
//             });

//             gltf.meshes.push({
//                 primitives: [{ mode: 3, attributes: { POSITION: i }, material: 0 }]
//             });

//             gltf.nodes.push({
//                 mesh: i,
//                 // Uncomment and add transformation matrix if needed
//             });
//         }
//             // Modify each node to include the model matrix
//             gltf.nodes.forEach((node, index) => {
//             if (index !== 0) { // Skip the root node
//             node.matrix = modelMatrix;
//             }
//     });
//         fs.writeFileSync(outputFilePath, JSON.stringify(gltf, null, 2));
//     } catch (e) {
//         console.error(`Error creating GLTF for ${inputFilePath}: ${e.message}`);
//     }
// }

// function createGltfsForDirectory(directoryPath) {
//   const modelMatrices = getModelMatricesFromData(data);
//   // const modelMatrices = readModelMatrices(centerTilesPath);

//   // Read all files from the directory
//   const files = fs.readdirSync(directoryPath);

//   // Filter out non-JSON files
//   const jsonFiles = files.filter((file) => path.extname(file) === ".json");

//   // Generate GLTF for each JSON file
//   jsonFiles.forEach((file) => {
//     const baseName = path.basename(file, ".json");
//     const inputFilePath = path.join(directoryPath, file);
//     const outputFilePath = path.join(directoryPath, `${baseName}.gltf`);
//     const binFileName = path.join(directoryPath, `${baseName}.bin`); // The corresponding .bin filename
//     // Retrieve the model matrix for the current file
//     const modelMatrix = modelMatrices[baseName];
//     // Make sure to adjust the `createGltf` function to accept the binFileName parameter and use it
//     createGltf(inputFilePath, outputFilePath, binFileName, modelMatrix);
//   });
// }

// const centerTilesPath = path.resolve(
//   __dirname,
//   "..",
//   "tilesets",
//   zoomLevel,
//   "low_summary.json"
// );
// // Call this function with the path to your tilesets directory
// createGltfsForDirectory(
//   path.resolve(__dirname, "..", "tilesets", zoomLevel, voltageCategory)
// );
