import fs from 'fs';
import { Buffer } from 'buffer';
import { calculateTileCenterInCartesian } from './helper.mjs';

const data = [
  {
    cartesian: [
      {
        x: -3929812.986091716,
        y: 2790844.4248461397,
        z: -4163143.216796866
      },
      {
        x: -3929815.4887321773,
        y: 2790841.1872122977,
        z: -4163142.1413248205
      },
      {
        x: -3929818.055068156,
        y: 2790837.994813905,
        z: -4163141.133785391
      },
      {
        x: -3929820.684923532,
        y: 2790834.847525641,
        z: -4163140.1939905705
      },
      {
        x: -3929823.3781603356,
        y: 2790831.7452492793,
        z: -4163139.321793026
      },
      {
        x: -3929826.134678655,
        y: 2790828.6879136288,
        z: -4163138.5170860267
      },
      {
        x: -3929828.9544165917,
        y: 2790825.675474482,
        z: -4163137.7798033655
      },
      {
        x: -3929831.8373502037,
        y: 2790822.707914603,
        z: -4163137.1099193366
      },
      {
        x: -3929834.783493507,
        y: 2790819.7852436965,
        z: -4163136.5074487017
      },
      {
        x: -3929837.7928984785,
        y: 2790816.907498432,
        z: -4163135.972446715
      },
      {
        x: -3929840.8656550837,
        y: 2790814.0747424606,
        z: -4163135.505009144
      }
    ],
    color: '#000100',
    Ambient_Tension: 0.586,
    Ambient_Tension_CBL: 4.188,
    Bay_Id: '199709',
    Captured_Date: '2022-12-18',
    Captured_Time: '11:55:48',
    ConductorId: '591622',
    Conductor_Length: 42,
    Depot: 'North West',
    MaintenanceArea: 'Marrawah South',
    MaxWind_Tension: 3.214,
    MaxWind_Tension_CBL: 22.954,
    Minimum_Ground_Clearance: 5.6,
    Minimum_Road_Clearance: 5.8,
    Nominal_Breaking_Load: 14,
    Voltage: 'LV ABC'
  },
  {
    cartesian: [
      {
        x: -3929841.027838534,
        y: 2790814.1877530655,
        z: -4163135.591126438
      },
      {
        x: -3929844.4487491003,
        y: 2790809.947708644,
        z: -4163134.218047879
      },
      {
        x: -3929847.9679144137,
        y: 2790805.7774416227,
        z: -4163132.949759039
      },
      {
        x: -3929851.585090907,
        y: 2790801.676778537,
        z: -4163131.7859997735
      },
      {
        x: -3929855.3001144365,
        y: 2790797.6456023133,
        z: -4163130.726594648
      },
      {
        x: -3929859.1129001393,
        y: 2790793.6838521957,
        z: -4163129.7714527845
      },
      {
        x: -3929863.02344238,
        y: 2790789.79152368,
        z: -4163128.920567793
      },
      {
        x: -3929867.0318147317,
        y: 2790785.968668516,
        z: -4163128.1740177646
      },
      {
        x: -3929871.138170044,
        y: 2790782.2153947526,
        z: -4163127.5319653368
      },
      {
        x: -3929875.342740564,
        y: 2790778.5318668205,
        z: -4163126.994657824
      },
      {
        x: -3929879.645838126,
        y: 2790774.9183056634,
        z: -4163126.562427418
      }
    ],
    color: '#000100',
    Ambient_Tension: 0.584,
    Ambient_Tension_CBL: 3.454,
    Bay_Id: '199708',
    Captured_Date: '2022-12-18',
    Captured_Time: '11:55:47',
    ConductorId: '591621',
    Conductor_Length: 56,
    Depot: 'North West',
    MaintenanceArea: 'Marrawah South',
    MaxWind_Tension: 2.157,
    MaxWind_Tension_CBL: 12.763,
    Minimum_Ground_Clearance: 6,
    Nominal_Breaking_Load: 16.9,
    Voltage: 'LV ABC'
  },
  {
    cartesian: [
      {
        x: -3929812.5475649945,
        y: 2790844.535527413,
        z: -4163142.991662944
      },
      {
        x: -3929812.6899588,
        y: 2790844.878468089,
        z: -4163141.4622773067
      },
      {
        x: -3929812.893559193,
        y: 2790845.264875959,
        z: -4163139.998169718
      },
      {
        x: -3929813.156677507,
        y: 2790845.6935517844,
        z: -4163138.597539114
      },
      {
        x: -3929813.477870139,
        y: 2790846.1634703693,
        z: -4163137.2588457987
      },
      {
        x: -3929813.8559326055,
        y: 2790846.6737763407,
        z: -4163135.9808051004
      },
      {
        x: -3929814.2898945883,
        y: 2790847.2237806055,
        z: -4163134.7623820906
      },
      {
        x: -3929814.7790159285,
        y: 2790847.812957542,
        z: -4163133.6027873135
      },
      {
        x: -3929815.3227835954,
        y: 2790848.4409428104,
        z: -4163132.5014735386
      },
      {
        x: -3929815.9209095533,
        y: 2790849.1075318754,
        z: -4163131.458133508
      },
      {
        x: -3929816.5733295977,
        y: 2790849.8126791418,
        z: -4163130.472698673
      }
    ],
    color: '#800000',
    Ambient_Tension: 0.142,
    Ambient_Tension_CBL: 0.506,
    Bay_Id: '199710',
    Captured_Date: '2022-12-18',
    Captured_Time: '11:31:27',
    ConductorId: '591623',
    Conductor_Length: 14.4,
    Conductor_Type: '4cABC25mm',
    Depot: 'North West',
    MaintenanceArea: 'Marrawah South',
    MaxWind_Tension: 0.541,
    MaxWind_Tension_CBL: 1.933,
    Minimum_Ground_Clearance: 4.6,
    Nominal_Breaking_Load: 28,
    Voltage: 'Service'
  }
];
//create a tube gltf

function vectorBetween(p1, p2) {
  return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
}

function normalize(v) {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
}

// Function to create cylinder vertices and indices
function createCylinder(p1, p2, radius, segments) {
  const direction = vectorBetween(p1, p2);
  const normDirection = normalize(direction);
  const up = [0, 0, 1]; // Default cylinder alignment along z-axis

  let vertices = [];
  let max = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
  let min = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];

  for (let i = 0; i <= segments; i++) {
    let angle = (i / segments) * 2 * Math.PI;
    let x = radius * Math.cos(angle);
    let y = radius * Math.sin(angle);
    let z = 0;

    // Add vertices for bottom and top of the cylinder
    let bottomVertex = [p1[0] + x, p1[1] + y, p1[2] + z];
    let topVertex = [p2[0] + x, p2[1] + y, p2[2] + z];
    vertices.push(bottomVertex, topVertex);

    // Update max and min values
    max = bottomVertex.map((val, idx) => Math.max(val, max[idx]));
    min = bottomVertex.map((val, idx) => Math.min(val, min[idx]));
    max = topVertex.map((val, idx) => Math.max(val, max[idx]));
    min = topVertex.map((val, idx) => Math.min(val, min[idx]));
  }

  // Create indices for the sides of the cylinder
  let indices = [];
  for (let i = 0; i < segments; i++) {
    let current = 2 * i;
    let next = 2 * ((i + 1) % segments);
    indices.push(current, next, current + 1);
    indices.push(current + 1, next, next + 1);
  }

  return { vertices, indices, max, min };
}

function createTubeGLTF(points, radius, segments) {
  let globalVertices = [];
  let globalIndices = [];
  let offset = 0;
  let globalMax = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
  let globalMin = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];

  for (let i = 0; i < points.length - 1; i++) {
    let { vertices, indices, max, min } = createCylinder(points[i], points[i + 1], radius, segments);
    globalVertices.push(...vertices);
    globalIndices.push(...indices.map(index => index + offset));
    offset += vertices.length;

    // Update global max and min
    globalMax = max.map((val, idx) => Math.max(val, globalMax[idx]));
    globalMin = min.map((val, idx) => Math.min(val, globalMin[idx]));
  }

  let vertexData = Float32Array.from(globalVertices.flat());
  let indexData = Uint32Array.from(globalIndices);

  let combinedBuffer = Buffer.concat([Buffer.from(vertexData.buffer), Buffer.from(indexData.buffer)]);
  let encodedData = combinedBuffer.toString('base64');

  let gltf = {
    asset: { version: '2.0' },
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            indices: 1
          }
        ]
      }
    ],
    buffers: [
      {
        byteLength: combinedBuffer.length,
        uri: `data:application/octet-stream;base64,${encodedData}`
      }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: vertexData.byteLength, target: 34962 },
      { buffer: 0, byteOffset: vertexData.byteLength, byteLength: indexData.byteLength, target: 34963 }
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: globalVertices.length, type: 'VEC3', max: globalMax, min: globalMin },
      { bufferView: 1, componentType: 5125, count: globalIndices.length, type: 'SCALAR' }
    ]
  };

  fs.writeFile('tube.gltf', JSON.stringify(gltf, null, 2), 'utf8', err => {
    if (err) {
      console.error('An error occurred:', err);
    } else {
      console.log('GLTF file for the tube has been created.');
    }
  });
}
let x = 472760;
let y = 190794;
const tileCenter = calculateTileCenterInCartesian(x, y, 18);
 function localizeCoordinates(point, center) {
  return {
    x: point.x - center.x,
    y: point.y - center.y,
    z: point.z - center.z
  };
}

function extractCartesiansInArrays(data) {
  const localizedData = data.map(item => ({
    ...item, // Spread existing item properties
    cartesian: item.cartesian.map(point => {
      // Localize each point and return only the values as an array
      const localizedPoint = localizeCoordinates(point, tileCenter);
      return [localizedPoint.x, localizedPoint.y, localizedPoint.z];
    })
  }));

  // Create a flat array of all cartesian point values
  const flatCartesians = localizedData.flatMap(item => item.cartesian);
  return flatCartesians;
}
function extractAllCartesiansFlat(data) {
     
  let allCartesiansFlat = [];
  for (let item of data) {
    if (item.cartesian && Array.isArray(item.cartesian)) {
      // Flatten directly by pushing each coordinate triplet into the main array
      for (const cart of item.cartesian) {
        allCartesiansFlat.push([cart.x, cart.y, cart.z]);
      }
    }
  }
  return allCartesiansFlat;
}

// Example usage:
const allCartesiansFlat = extractCartesiansInArrays(data);
// console.log(allCartesiansFlat);



// Example usage with points
createTubeGLTF(
allCartesiansFlat,
  0.1,
  32
);
// createTubeGLTF(
//   [
//     [-2.5475649945, 4.535527413, -42.991662944],
//     [-2.6899588, 4.878468089, -41.4622773067],
//     [-2.893559193, 5.264875959, -39.998169718],
//     [-3.156677507, 5.6935517844, -38.597539114],
//     [-3.477870139, 6.1634703693, -37.2588457987],
//     [-3.8559326055, 6.6737763407, -35.9808051004],
//     [-4.2898945883, 7.2237806055, -34.7623820906],
//     [-4.7790159285, 7.812957542, -33.6027873135],
//     [-5.3227835954, 8.4409428104, -32.5014735386],
//     [-5.9209095533, 9.1075318754, -31.458133508],
//     [-6.5733295977, 9.8126791418, -30.472698673]
//   ],
//   0.2,
//   32
// );



// createTubeGLTF(multiplePointSets, 0.5, 16, 'multiple_tubes.gltf');