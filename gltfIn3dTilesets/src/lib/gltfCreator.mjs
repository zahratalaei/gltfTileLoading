import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Function to calculate min and max values
function findMinMax(points) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;

  points.forEach((point) => {
    if (point.length === 3) {
      // Ensure each point has 3 coordinates
      minX = Math.min(minX, point[0]);
      maxX = Math.max(maxX, point[0]);
      minY = Math.min(minY, point[1]);
      maxY = Math.max(maxY, point[1]);
      minZ = Math.min(minZ, point[2]);
      maxZ = Math.max(maxZ, point[2]);
    } else {
      console.error("Invalid point data:", point);
    }
  });

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

const zoomLevel = "16";
// New function to read the centerTiles.json
// function readModelMatrices(centerTilesPath) {
//     const centerTilesData = fs.readFileSync(centerTilesPath, 'utf8');
//     const tiles = JSON.parse(centerTilesData);
//     const modelMatrices = {};

//     tiles.forEach(tile => {
//         // Extract x and y from the tileKey
//         const [x, y] = tile.tileKey.split('-');
//         // Construct the key to match your file structure
//         const key = `low/${x}/${y}.json`;

//         modelMatrices[key] = tile.modelMatrix;
//     });

//     return modelMatrices;
// }
const yUpToZupMatrix = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
// Encapsulate the GLTF creation process in a function
// jsdoc
/**
 * @param {string} inputFilePath
 * @param {string} outputFilePath
 * @returns {void}
 */

// function createGltf(inputFilePath, outputFilePath, binFilePath, modelMatrix,data) {
function createGltf(outputFilePath, data) {
  try {
    // const jsonData = fs.readFileSync(inputFilePath, 'utf8');
    // const allPointsSets = JSON.parse(jsonData);
    const allPointsSets = data.conductorsData;
    const totalSets = allPointsSets.length;
    const modelMatrix = data.modelMatrix;
    let positionOffset = 0; // Byte offset for the first vertex position
    let featureIdOffset = 700;
    const bytesPerVertexPosition = 12; // 3 components * 4 bytes each
    const bytesPerFeatureId = 4; // Assuming 4 bytes per _feature_id_0
    let gltf = {
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
      bufferViews: [],
      buffers: [
        {
          uri: "data:application/octet-stream;base64,ckewQdY41sB6TDfCG9CQQe2RHcFRdivCvzFhQeL2TsF9BiDCx0QfQTVMf8Gl/BTCprS3QE9Jl8GEWArCMJm3P1VlrsHlGQDC/sA9wFr6xMFMgezBPp/uwHQI28FsmdnB/apAwaGP8MEtfMfBUMGFweXHAsKzKbbBiOurwV8EDcJIoqXBHldyQgeCAkKmUFzCG6hkQnEY40Gd0lbCe5RWQry7wUHjv1HCfhxIQpTtoEEyGE3CT0A5QrutgEFe20jCBAAqQiH4QUFNCUXCnlsaQiexA0H/oUHCDFMKQnkNjUCHpT7CR8zzQTuVJz8RFDzCUSnSQZ3ZQcDd7TnCkryvQRqP1MBCMzjCmw6SwmU0QcKau2NBwNedwmpzSML+xKNBtPupwncxT8LPKNRBInq2wgVvVcJVhQFCzlLDwmcsW8LINRhClYXQwtBpYMIKJi5CbxLewk4nZcIwVkNCa/nrwspkacIZxldCsDr6wgwibcJxdWtCQWsEw7ZecMKqY35CneYLw0gac8ICSIhC70CxQs90e0JV0XrClT+sQnmBbkINhHbCnh2nQnW8YUJUfHLCItuhQqIlVUL7uW7CMnicQue8SELZPGvC2/SWQjGCPELUBGjCJ1GRQnR1MELaEWXCF42LQqyWJELkY2LCqqiFQtvlGEL2+l/Cskd/QgxjDUIe113CMf1yQk4OAkJ2+FvCDqyvwX7vDcITMKTBim3VwUcyFMKBC4XBN+T7wbo0GsJXUE3B+ocRwuP2H8LgCxLBXnglwsV4JcIXk7DATsM5wlm6KsLxJQDA32hOwpK7L8LAn7U/Mmljwll8NMKR3JdAcsR4wo78OMJySf9AbD2Hwgo8PcJa1jFBVEaSwps6QcIGgmJBGwwDAAQHCQAbDAMABAcJABsMAwAEBwkAGwwDAAQHCQAbDAMABAcJABsMAwAEBwkAGwwDAAQHCQAbDAMABAcJABsMAwAEBwkAGwwDAAQHCQAbDAMABAcJABwMAwAFBwkAHAwDAAUHCQAcDAMABQcJABwMAwAFBwkAHAwDAAUHCQAcDAMABQcJABwMAwAFBwkAHAwDAAUHCQAcDAMABQcJABwMAwAFBwkAHAwDAAUHCQAZDAMAAgcJABkMAwACBwkAGQwDAAIHCQAZDAMAAgcJABkMAwACBwkAGQwDAAIHCQAZDAMAAgcJABkMAwACBwkAGQwDAAIHCQAZDAMAAgcJABkMAwACBwkAHQwDAAYHCQAdDAMABgcJAB0MAwAGBwkAHQwDAAYHCQAdDAMABgcJAB0MAwAGBwkAHQwDAAYHCQAdDAMABgcJAB0MAwAGBwkAHQwDAAYHCQAdDAMABgcJABoMAwADBwkAGgwDAAMHCQAaDAMAAwcJABoMAwADBwkAGgwDAAMHCQAaDAMAAwcJABoMAwADBwkAGgwDAAMHCQAaDAMAAwcJABoMAwADBwkAGgwDAAMHCQABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAwAAAAMAAAADAAAAAwAAAAMAAAADAAAAAwAAAAMAAAADAAAAAwAAAAMAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAABQAAAAUAAAAFAAAA",
          byteLength: 920,
        },
      ],
      materials: [
        { pbrMetallicRoughness: { baseColorFactor: [1.0, 0.0, 0.0, 1.0] } },
      ],
      extensionsUsed: ["EXT_mesh_features", "EXT_structural_metadata"],
      extensions: {
        EXT_structural_metadata: {
          schema: {
            classes: {
              conductorMetadata: {
                properties: {
                  BayId: {
                    type: "UINT32",
                    name: "Bay Identifier",
                    description: "Unique identifier for the bay",
                  },
                  ConductorId: {
                    type: "UINT32",
                    name: "Conductor Identifier",
                    description: "Identifier for the conductor",
                  },
                },
              },
            },
          },
          propertyTables: [
            {
              name: "ConductorPropertyTable",
              class: "conductorMetadata",
              count: totalSets,
              properties: {
                BayId: {
                  value: totalSets,
                },
                ConductorId: {
                  value: totalSets + 1,
                },
              },
            },
          ],
        },
      },
    };let currentByteOffset = 0;

    for (let i = 0; i < totalSets; i++) {
      const { minX, maxX, minY, maxY, minZ, maxZ } = findMinMax(
        allPointsSets[i].coordinates
      );

      gltf.accessors.push({
        bufferView: i,
        byteOffset: 0,
        componentType: 5126,
        count: allPointsSets[i].coordinates.length,
        type: "VEC3",
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ],
      });
      // Adjust the offset for the next conductor's vertex positions
      positionOffset += 11 * bytesPerVertexPosition;
     
      // Mesh configuration with EXT_mesh_features for feature IDs
      gltf.meshes.push({
        primitives: [
          {
            attributes: {
              POSITION: i, // Index of the accessor for this conductor's positions
              _FEATURE_ID_0: totalSets + 2 + i,
            },
            //   "material": 0, // Assuming a default material; adjust as needed
            mode: 3, // Commonly used for TRIANGLES; adjust based on your geometry
            extensions: {
              EXT_mesh_features: {
                featureIds: [
                  {
                    featureCount: 11, // Since the entire mesh is associated with a single set of metadata
                    propertyTable: 0, // Index of the property table containing bay_id and conductorId
                  },
                ],
              },
            },
          },
        ],
      });

      // Define a node for each set of points
      gltf.nodes.push({
        mesh: i,
        // Uncomment and add transformation matrix if needed
      });
      

      // Vertex Positions
      gltf.bufferViews.push({
        buffer: 0,
        byteOffset: currentByteOffset,
        byteLength: 11 * 12, // 12 bytes per vertex
        target: 34962, // ARRAY_BUFFER for vertex attributes
      });
      currentByteOffset += 11 * 12; 
    }

    //bufferviews for Bay_Ids
    gltf.bufferViews.push({
      buffer: 0,
      byteOffset: 660,
      byteLength: totalSets * 4, // 4 bytes per Bay_Id
      target: 34962, // ARRAY_BUFFER, assuming these are considered vertex attributes
    });

    //bufferviews for ConductorIds
    gltf.bufferViews.push({
      buffer: 0,
      byteOffset: 680,
      byteLength: totalSets * 4, // 4 bytes per ConductorId
      target: 34962, // ARRAY_BUFFER, assuming these are considered vertex attributes
    });
    //bufferViews  _FEATURE_ID_0
    gltf.bufferViews.push({
      buffer: 0,
      byteOffset: 700 ,
      byteLength: 220, // 4 bytes per _FEATURE_ID_0
      target: 34962, // ARRAY_BUFFER, assuming these are considered vertex attributes
      byteStride: 44, // If needed for alignment or indicating these are separate elements
    });
    for (let i = 0; i < totalSets; i++) {
      
      gltf.accessors.push({
        bufferView: totalSets + 2, // This should match the index of the bufferView for _feature_id_0
        byteOffset: 0, // Assuming _feature_id_0 data starts at the beginning of its bufferView
        componentType: 5121, // Unsigned, assuming _feature_id_0 is stored as unsigned
        count: totalSets, // One _feature_id_0 per vertex
        type: "SCALAR", // Single-component values for _feature_id_0
      });
      // Adjust the offset for the next conductor's _feature_id_0
      featureIdOffset += 11 * bytesPerFeatureId;
    }
    // Modify each node to include the model matrix
    gltf.nodes.forEach((node, index) => {
      if (index !== 0) {
        // Skip the root node
        node.matrix = modelMatrix;
      }
    });
    fs.writeFileSync(outputFilePath, JSON.stringify(gltf, null, 2));
  } catch (e) {
    console.error(`Error creating GLTF : ${e.message}`);
  }
}
createGltf("./test4.gltf", data);

// // Modified function to process JSON files within the specific zoom level and tile coordinates
// function createGltfsForZoomLevel(zoomLevelPath) {
//     // Iterate over each 'x' directory in the zoom level
//     const xDirs = fs.readdirSync(zoomLevelPath, { withFileTypes: true })
//                     .filter(dirent => dirent.isDirectory());

//     xDirs.forEach(xDir => {
//         const xDirPath = path.join(zoomLevelPath, xDir.name);
//         // Iterate over each 'y.json' file in the 'x' directory
//         const yFiles = fs.readdirSync(xDirPath, { withFileTypes: true })
//                         .filter(dirent => dirent.isFile() && path.extname(dirent.name) === '.json');

//         yFiles.forEach(yFile => {
//             const baseName = path.basename(yFile.name, '.json');
//             const jsonFilePath = path.join(xDirPath, yFile.name);
//             const binFilePath = path.join(xDirPath, `${baseName}.bin`);
//             const outputFilePath = path.join(xDirPath, `${baseName}.gltf`);

//             // Check if the corresponding .bin file exists
//             if (fs.existsSync(binFilePath)) {
//                 // Create GLTF file
//                 createGltf(jsonFilePath, outputFilePath, binFilePath);
//             } else {
//                 console.warn(`Binary file not found for: ${jsonFilePath}`);
//             }
//         });
//     });
// }
// function createGltfsForDirectory(directoryPath) {
//     const modelMatrices = readModelMatrices(centerTilesPath);

//     // Iterate over each 'x' directory in the given directoryPath
//     const xDirs = fs.readdirSync(directoryPath, { withFileTypes: true })
//                     .filter(dirent => dirent.isDirectory());

//     xDirs.forEach(xDir => {
//         const xDirPath = path.join(directoryPath, xDir.name);

//         // Read all files from the 'x' directory
//         const files = fs.readdirSync(xDirPath);

//         // Filter out non-JSON files
//         const jsonFiles = files.filter(file => path.extname(file) === '.json');

//         // Generate GLTF for each JSON file
//         jsonFiles.forEach(file => {
//             const baseName = path.basename(file, '.json');
//             const inputFilePath = path.join(xDirPath, file);
//             const outputFilePath = path.join(xDirPath, `${baseName}.gltf`);
//             const binFileName = path.join(xDirPath, `${baseName}.bin`); // The corresponding .bin filename

//             // Construct the key to match the modelMatrices object
//             const key = `low/${xDir.name}/${baseName}.json`;

//             // Retrieve the model matrix for the current file
//             const modelMatrix = modelMatrices[key];

//             // Create GLTF file
//             createGltf(inputFilePath, outputFilePath, binFileName, modelMatrix);
//         });
//     });
// }

// const centerTilesPath = path.resolve(__dirname, '..', 'tilesets','data', zoomLevel,'low_summary.json');
// // const zoomLevelDir = path.resolve(__dirname, '..', 'tilesets', 'gltf', zoomLevel, 'high');

// // Call this function with the path to your tilesets directory
// createGltfsForDirectory(path.resolve(__dirname, '..', 'tilesets','data', zoomLevel, 'low'));

// // createGltfsForZoomLevel(zoomLevelDir);
