'use strict';

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const argv = yargs
    .usage('Usage: $0 target')
    .example('node $0 ./tileset.json > ./tileset.c4u.json')
    .help('h')
    .alias('h', 'help')
    .demandCommand(1)
    .argv;

const tilesetFilename = argv._[0];
const tilesetDirname = path.dirname(tilesetFilename);
let rawdata = '';
let tileset = {};

try {
    rawdata = fs.readFileSync(tilesetFilename);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('File not found!');
    } else {
        throw err;
    }
}

try {
    tileset = JSON.parse(rawdata);
} catch (err) {
    console.log('File is not json');
    throw err;
}

function cesiumRTC2Transforms(j, d, transbase) {
    if (j.boundingVolume && j.content && j.content.boundingVolume) {
        j.transform = [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            j.content.boundingVolume.box[0] - transbase[0],j.content.boundingVolume.box[1] - transbase[1],j.content.boundingVolume.box[2] - transbase[2],1
        ];
        transbase = j.content.boundingVolume.box.slice(0, 3);
        j.boundingVolume.box[0] -= j.content.boundingVolume.box[0];
        j.boundingVolume.box[1] -= j.content.boundingVolume.box[1];
        j.boundingVolume.box[2] -= j.content.boundingVolume.box[2];
        j.content.boundingVolume.box[0] = 0;
        j.content.boundingVolume.box[1] = 0;
        j.content.boundingVolume.box[2] = 0;
    }
    if (j.children) {
         j.children = j.children.map((c)=>cesiumRTC2Transforms(c,d+1,transbase));
    }
    return j;
}

cesiumRTC2Transforms(tileset.root, 0, [0,0,0]);
console.log(JSON.stringify(tileset, null, 4));
