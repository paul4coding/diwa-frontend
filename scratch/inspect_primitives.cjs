const fs = require('fs');

function inspectMesh(path) {
    const data = fs.readFileSync(path);
    const jsonStr = data.toString('utf8', 20); // Basic slice for JSON chunk
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}') + 1;
    const gltf = JSON.parse(jsonStr.substring(start, end));
    
    console.log("MESH PRIMITIVES COUNT:", gltf.meshes[0].primitives.length);
    gltf.meshes[0].primitives.forEach((p, i) => {
        console.log(`Primitive ${i}: Material Index ${p.material}`);
    });
}

inspectMesh(process.argv[2]);
