// import express from 'express';
// import  fs from 'graceful-fs';
// import path from 'path';
// import cors from 'cors';
// import { Router } from 'express';
// const app = express();
// const port = 3000;
// const router = Router();
// app.use(cors());

// // Function to serve files
// function serveFile(req, res, fileType) {
//     const { zoomLevel, x, y } = req.params;
//     const filename = `${y}.${fileType}`;
//     // const filePath = path.join(new URL('..', import.meta.url).pathname, 'data', 'conductors', zoomLevel, x, filename);
//     const filePath = path.join(new URL('..', import.meta.url).pathname, 'data', 'pole', zoomLevel, x, filename);
    
//     if (fs.existsSync(filePath)) {
//         const contentType = (fileType === 'json') ? 'application/json' : 'model/gltf+json';
//         res.type(contentType).sendFile(filePath);
//     } else {
//         res.status(404).send('File not found');
//     }
// }

// // Define routes for JSON and GLTF files
// router.get('/:zoomLevel/:x/:y.json', (req, res) => {
//     serveFile(req, res, 'json');
// });

// router.get('/:zoomLevel/:x/:y.gltf', (req, res) => {
//     serveFile(req, res, 'gltf');
// });

// // Apply the router to the app
// app.use('/getTilesets', router);

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*"); // Allow all domains
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });

import express from 'express';
import fs from 'graceful-fs';
import path from 'path';
import cors from 'cors';

const app = express();
const port = 3000;
const router = express.Router();

app.use(cors());
app.use(express.json());

// Generic function to serve files from specified directories
function serveFile(directory) {
    return function (req, res, fileType) {
        const { zoomLevel, x, y } = req.params;
        const filename = `${y}.${fileType}`;
        const filePath = path.join(new URL('..', import.meta.url).pathname, 'data', directory, zoomLevel, x, filename);
        console.log("🚀 ~ filePath:", filePath)
        
        if (fs.existsSync(filePath)) {
            const contentType = (fileType === 'json') ? 'application/json' : 'model/gltf+json';
            res.type(contentType).sendFile(filePath);
        } else {
            res.status(404).send('File not found');
        }
    };
}

// Define routes for JSON and GLTF files for poles
router.get('/poles/:zoomLevel/:x/:y.json', (req, res) => serveFile('pole')(req, res, 'json'));
router.get('/poles/:zoomLevel/:x/:y.gltf', (req, res) => serveFile('pole')(req, res, 'gltf'));

// Define routes for JSON and GLTF files for conductors
router.get('/conductors/:zoomLevel/:x/:y.json', (req, res) => serveFile('conductors')(req, res, 'json'));
router.get('/conductors/:zoomLevel/:x/:y.gltf', (req, res) => serveFile('conductors')(req, res, 'gltf'));

// Apply the router to the app
app.use('/getTilesets', router);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
