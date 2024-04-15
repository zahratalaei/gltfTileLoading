import fs from 'fs';

// 1. Read the original JSON file
const jsonData = fs.readFileSync('119163-48372-cart.json', 'utf8');
// 2. Parse the JSON content to a JavaScript object
const allPointsSets = JSON.parse(jsonData);
let sumX = 0, sumY = 0, sumZ = 0;
let totalPoints = 0;

// allPointsSets.forEach(catenary => {
//         catenary.forEach(point => {
//         sumX += point[0];
//         sumY += point[1];
//         sumZ += point[2];
//         totalPoints++;
//     });
// });
// console.log(allPointsSets.length);
// const avgX = sumX / totalPoints;
// const avgY = sumY / totalPoints;
// const avgZ = sumZ / totalPoints;

// console.log(`Average Point: (${avgX}, ${avgY}, ${avgZ})`);
const totalSets = allPointsSets.length;
const bytesPerSet = 132;

let gltf = {
    asset: {
        version: "2.0"
    },
    scenes: [
        {
            nodes: [0]
        }
    ],
    nodes: [{
        children: Array.from({ length: totalSets }, (_, i) => i + 1)
    }],
    meshes: [],
    accessors: [],
    bufferViews: Array.from({ length: totalSets }, (_, i) => ({
        buffer: 0,
        byteOffset: i * bytesPerSet,
        byteLength: bytesPerSet
    })),
    buffers: [{
        uri: "119163-48372-cart.bin",
        byteLength: totalSets * bytesPerSet
    }]
};
gltf.materials = [
    {
        pbrMetallicRoughness: {
            baseColorFactor: [1.0, 0.0, 0.0, 1.0]  // Red color
        }
    }
];

// Populate meshes and accessors
for (let i = 0; i < totalSets; i++) {

    // Extract floats for the current set
    const floats = allPointsSets[i].flat()
        
   
    // Recalculate min/max here:
    const recalculatedMinX = Math.min(...floats.filter((_, idx) => idx % 3 === 0));
    const recalculatedMaxX = Math.max(...floats.filter((_, idx) => idx % 3 === 0));

    const recalculatedMinY = Math.min(...floats.filter((_, idx) => idx % 3 === 1));
    const recalculatedMaxY = Math.max(...floats.filter((_, idx) => idx % 3 === 1));

    const recalculatedMinZ = Math.min(...floats.filter((_, idx) => idx % 3 === 2));
    const recalculatedMaxZ = Math.max(...floats.filter((_, idx) => idx % 3 === 2));
 
    // Add the accessor for this set
    gltf.accessors.push({
        bufferView: i,
        byteOffset: 0,
        componentType: 5126,
        count: 11,
        type: "VEC3",
        max: [recalculatedMaxX, recalculatedMaxY, recalculatedMaxZ],
        min: [recalculatedMinX, recalculatedMinY, recalculatedMinZ]
    });

    // Add mesh for this set
    gltf.meshes.push({
        primitives: [{
            mode: 3,
            attributes: {
                POSITION: i
            },
            material: 0 
        }]
    });
}
   // The transformation matrix
   const transformationMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -3940200, +2528000, -4317200, 1
];

// Add nodes for each mesh
for (let i = 0; i < totalSets; i++) {
    gltf.nodes.push({
        mesh: i,
        // matrix: transformationMatrix
    });
}

// Save the constructed GLTF to a file
fs.writeFileSync('119163-48372.gltf', JSON.stringify(gltf, null, 2));
