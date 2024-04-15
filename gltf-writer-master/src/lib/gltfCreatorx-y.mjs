import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const zoomLevel = "16";
const voltageCategory = "low";
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
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
    minY = Math.min(minY, point[1]);
    maxY = Math.max(maxY, point[1]);
    minZ = Math.min(minZ, point[2]);
    maxZ = Math.max(maxZ, point[2]);
  });

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

// New function to read the centerTiles.json
function readModelMatrices(centerTilesPath) {
  const centerTilesData = fs.readFileSync(centerTilesPath, "utf8");
  return JSON.parse(centerTilesData).reduce((acc, tile) => {
    acc[tile.tileKey] = tile.modelMatrix;
    return acc;
  }, {});
}
const yUpToZupMatrix = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
// Encapsulate the GLTF creation process in a function
// jsdoc
/**
 * @param {string} inputFilePath
 * @param {string} outputFilePath
 * @returns {void}
 */

function createGltf(
  inputFilePath,
  outputFilePath,
  binFilePath,
  modelMatrix,
  metadataFilePath
) {
  try {
    const jsonData = fs.readFileSync(inputFilePath, "utf8");
    const allPointsSets = JSON.parse(jsonData);
    const totalSets = allPointsSets.length;

    // Compute the relative path from the GLTF file to the .bin file
    const binFileRelativePath = path.relative(
      path.dirname(outputFilePath),
      binFilePath
    );

    // Read metadata file
    const metadataJson = fs.readFileSync(metadataFilePath, "utf8");
    const metadata = JSON.parse(metadataJson);

    // Example: Create a property table for metadata
    let propertyTables = [
      {
        name: "CatenaryProperties",
        properties: {
          Bay_Id: {
            type: "STRING",
            values: metadata.map((item) => item.Bay_Id),
          },
          ConductorId: {
            type: "STRING",
            values: metadata.map((item) => item.ConductorId),
          },
        },
      },
    ];

    // Define your transformation matrix
    const bytesPerSet = 132;
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
      bufferViews: Array.from({ length: totalSets }, (_, i) => ({
        buffer: 0,
        byteOffset: i * bytesPerSet,
        byteLength: bytesPerSet,
      })),
      buffers: [
        { uri: binFileRelativePath, byteLength: totalSets * bytesPerSet },
      ],
      materials: [
        { pbrMetallicRoughness: { baseColorFactor: [1.0, 0.0, 0.0, 1.0] } },
      ],
    };
    // Add the EXT_mesh_features extension to the GLTF
    gltf.extensionsUsed = gltf.extensionsUsed || [];
    gltf.extensionsUsed.push("EXT_mesh_features");
    gltf.extensions = {
      EXT_mesh_features: {
        propertyTables: propertyTables,
      },
    };

    for (let i = 0; i < totalSets; i++) {
      const { minX, maxX, minY, maxY, minZ, maxZ } = findMinMax(
        allPointsSets[i]
      );

      gltf.accessors.push({
        bufferView: i,
        byteOffset: 0,
        componentType: 5126,
        count: allPointsSets[i].length,
        type: "VEC3",
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ],
      });

      gltf.meshes.push({
        primitives: [{ mode: 3, attributes: { POSITION: i }, material: 0 }],
      });

      gltf.nodes.push({
        mesh: i,
        // Uncomment and add transformation matrix if needed
      });
    }
    // Modify each node to include the model matrix
    gltf.nodes.forEach((node, index) => {
      if (index !== 0) {
        // Skip the root node
        node.matrix = modelMatrix;
      }
    });
    
    // Modify each primitive to include a feature ID
// Modify each primitive to include a feature ID
gltf.meshes.forEach((mesh, index) => {
  mesh.primitives.forEach(primitive => {
      // Adjust the structure to match EXT_mesh_features specifications
      primitive.extensions = {
          EXT_mesh_features: {
              featureIds: [
                {
                  featureCount: "catenary", // Use the feature table name for catenary
                  featureIds: {
                    attribute: "_FEATURE_ID_0" // Replace with the actual feature ID attribute that links to your bayId and conductorId
                  }
                }
              ]
          }
      };
  });
});

    fs.writeFileSync(outputFilePath, JSON.stringify(gltf, null, 2));
  } catch (e) {
    console.error(`Error creating GLTF for ${inputFilePath}: ${e.message}`);
  }
}

function createGltfsForDirectory(directoryPath) {
  const modelMatrices = readModelMatrices(centerTilesPath);

  // Read all files from the directory
  const files = fs.readdirSync(directoryPath);

  // Separate point data and metadata files
  const jsonFiles = files.filter(file => path.extname(file) === '.json');
  const pointFiles = jsonFiles.filter(file => !file.includes("-info"));
  const metadataFiles = jsonFiles.filter(file => file.includes("-info"));

  // Generate GLTF for each point data file
  pointFiles.forEach(file => {
      const baseName = path.basename(file, '.json');
      const inputFilePath = path.join(directoryPath, file);
      const outputFilePath = path.join(directoryPath, `${baseName}.gltf`);
      const binFileName = path.join(directoryPath, `${baseName}.bin`); // The corresponding .bin filename
      const metadataFilePath = metadataFiles.find(f => f.startsWith(baseName)); // Find the corresponding metadata file

      // Retrieve the model matrix for the current file
      const modelMatrix = modelMatrices[baseName];

      // Call the createGltf function with the path to the metadata file
      createGltf(inputFilePath, outputFilePath, binFileName, modelMatrix, path.join(directoryPath, metadataFilePath));
  });
}

const centerTilesPath = path.resolve(
  __dirname,
  "..",
  "tilesets",
  zoomLevel,
  "low_summary.json"
);
// Call this function with the path to your tilesets directory
createGltfsForDirectory(
  path.resolve(__dirname, "..", "tilesets", zoomLevel, "test01")
);
