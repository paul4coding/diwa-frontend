const fs = require('fs');
const { BinaryReader } = require('buffer');

function inspectGLB(path) {
    const data = fs.readFileSync(path);
    const magic = data.readUInt32LE(0);
    if (magic !== 0x46546C67) {
        console.error("Not a GLB file");
        return;
    }
    const version = data.readUInt32LE(4);
    const length = data.readUInt32LE(8);
    
    // Chunk 0 (JSON)
    const jsonChunkLength = data.readUInt32LE(12);
    const jsonChunkType = data.readUInt32LE(16);
    if (jsonChunkType !== 0x4E4F534A) {
        console.error("First chunk is not JSON");
        return;
    }
    
    const jsonStr = data.toString('utf8', 20, 20 + jsonChunkLength);
    const gltf = JSON.parse(jsonStr);
    
    console.log("=== GLTF MESHES ===");
    if (gltf.meshes) {
        gltf.meshes.forEach((m, i) => {
            console.log(`Mesh ${i}: ${m.name || 'unnamed'}`);
            m.primitives.forEach((p, j) => {
                console.log(`  Primitive ${j}: Material ${p.material !== undefined ? p.material : 'default'}`);
            });
        });
    } else {
        console.log("No meshes found at root level");
    }

    console.log("=== GLTF NODES ===");
    if (gltf.nodes) {
        gltf.nodes.forEach((n, i) => {
            console.log(`Node ${i}: ${n.name || 'unnamed'} (Mesh: ${n.mesh !== undefined ? n.mesh : 'none'})`);
        });
    }

    console.log("=== GLTF MATERIALS ===");
    if (gltf.materials) {
        gltf.materials.forEach((m, i) => {
            console.log(`Material ${i}: ${m.name || 'unnamed'}`);
        });
    }
}

inspectGLB(process.argv[2]);
