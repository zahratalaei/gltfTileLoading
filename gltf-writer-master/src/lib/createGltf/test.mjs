import { tileOuterExtent } from "../../../../mercator-transforms-master/src/index.mjs";
import * as Cesium from "cesium"
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
const attributes = [
  [ '0.586', '0.584', '0.142' ],
  [ '4.188', '3.454', '0.506' ],
  [ '199709', '199708', '199710' ],
  [ '2022-12-18', '2022-12-18', '2022-12-18' ],
  [ '11:55:48', '11:55:47', '11:31:27' ],
  [ '591622', '591621', '591623' ],
  [ '42', '56', '14.4' ],
  [ 'North West', 'North West', 'North West' ],
  [ 'Marrawah South', 'Marrawah South', 'Marrawah South' ],
  [ '3.214', '2.157', '0.541' ],
  [ '22.954', '12.763', '1.933' ],
  [ '5.6', '6', '4.6' ],
  [ '5.8', 'NA', 'NA' ],
  [ '14', '16.9', '28' ],
  [ 'LV ABC', 'LV ABC', 'Service' ]
]
let x = 472760;
let y = 190794;
const bounds = tileOuterExtent(
  { x, y, z: 18 },
  "EPSG:28355",
  "EPSG:3857",
  "cesium"
);
function toCartesian(longitude, latitude, elevation) {
  return Cesium.Cartesian3.fromDegrees(longitude, latitude, elevation);
}
const minCorner = bounds.latlon.extents[0];
const maxCorner = bounds.latlon.extents[1];
const latCenter = (minCorner[1] + maxCorner[1]) / 2;
const lonCenter = (minCorner[0] + maxCorner[0]) / 2;
const centerTile = [latCenter, lonCenter];
console.log("🚀 ~ centerTile:", centerTile)
// const tileCenterCartesian = toCartesian(lonCenter, latCenter, 0);
// console.log("🚀 ~ tileCenterCartesian:", tileCenterCartesian)

function localizeCoordinates(point, center) {
  return Cesium.Cartesian3.subtract(point, center, new Cesium.Cartesian3());
}

