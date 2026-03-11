/**
 * map.js - Park tile map
 * WLD FoxWave ARDF
 */
"use strict";

let parkMap = [];
let walkableTiles = [];

function buildParkMap() {
    const W = CONFIG.WORLD_WIDTH, H = CONFIG.WORLD_HEIGHT;
    const grid = [];
    for (let y = 0; y < H; y++) grid.push(new Array(W).fill(TILE.GRASS));

    const set  = (x,y,t) => { if (x>=0&&x<W&&y>=0&&y<H) grid[y][x]=t; };
    const hl   = (x1,x2,y,t=TILE.PATH) => { for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++) set(x,y,t); };
    const vl   = (y1,y2,x,t=TILE.PATH) => { for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++) set(x,y,t); };
    const rect = (x1,y1,x2,y2,t)      => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) set(x,y,t); };

    // 1. Dense tree border
    rect(0,0,W-1,H-1,TILE.DENSE_TREE);
    rect(2,2,W-3,H-3,TILE.GRASS);

    // 2. Outer ring (tourist train)
    hl(3,76,5,TILE.TRAIN); hl(3,76,54,TILE.TRAIN);
    vl(5,54,3,TILE.TRAIN); vl(5,54,76,TILE.TRAIN);

    // 3. Interior path grid
    hl(3,76,16); hl(3,76,28); hl(3,76,42);
    vl(5,54,18); vl(5,54,39); vl(5,54,60);

    // 4. Feature zones — trees/hedges around features
    // Playground NW
    rect(4,6,17,15,TILE.GRASS);
    rect(4,6,17,6,TILE.SHRUB); rect(4,15,17,15,TILE.SHRUB);
    rect(4,6,4,15,TILE.SHRUB); rect(17,6,17,15,TILE.SHRUB);

    // Upper lake W
    rect(4,17,17,27,TILE.WATER);
    rect(4,17,4,27,TILE.GRASS); rect(17,17,17,27,TILE.GRASS);

    // Lower lake W
    rect(4,29,17,41,TILE.WATER);

    // Fountain plaza centre
    rect(20,17,37,27,TILE.GRASS);
    set(28,22,TILE.FOUNTAIN);

    // Zoo NE
    rect(41,6,58,15,TILE.ZOO);
    rect(61,6,75,15,TILE.ZOO);

    // Forest blocks in mid/SE quadrants (give 3D walls to navigate through)
    [[20,29,37,41],[20,43,37,53],[41,29,58,41],[41,43,58,53]].forEach(([x1,y1,x2,y2])=>{
        rect(x1,y1,x2,y2,TILE.TREE);
        // clearings inside
        rect(x1+2,y1+2,x2-2,y2-2,TILE.GRASS);
    });

    // Café/brasserie building SE
    rect(61,43,75,53,TILE.BUILDING);

    // 5. WLD Start / tent area
    hl(3,10,54,TILE.START);
    vl(53,58,3,TILE.START);
    vl(53,58,4,TILE.START);
    vl(53,58,5,TILE.START);
    set(5,56,TILE.START); set(6,56,TILE.START); set(7,56,TILE.START);
    set(5,57,TILE.START); set(6,57,TILE.START); set(7,57,TILE.START);

    // 6. Tree clusters for visual interest
    [[10,8],[11,8],[12,8],[6,20],[7,20],[30,35],[31,35],[50,45],[51,45],[65,30]].forEach(
        ([x,y])=>set(x,y,TILE.TREE)
    );

    parkMap = grid;

    // Collect walkable tiles for fox/NPC placement
    walkableTiles = [];
    for (let y=0; y<H; y++)
        for (let x=0; x<W; x++)
            if (WALKABLE_TILES.has(grid[y][x])) walkableTiles.push({x,y});
}

function getTile(x,y) {
    if (x<0||x>=CONFIG.WORLD_WIDTH||y<0||y>=CONFIG.WORLD_HEIGHT) return TILE.DENSE_TREE;
    return parkMap[y]?.[x] ?? TILE.DENSE_TREE;
}

function isWalkable(x,y) { return WALKABLE_TILES.has(getTile(x,y)); }

/** True if tile is a 3D solid wall */
function isSolid3D(x,y) {
    if (x<0||x>=CONFIG.WORLD_WIDTH||y<0||y>=CONFIG.WORLD_HEIGHT) return true;
    return SOLID3D.has(getTile(x,y));
}

/** Valid positions for fox placement */
function getValidFoxPositions(minDistFromStart, existingBeacons, minDistApart) {
    return walkableTiles.filter(t => {
        if (Math.hypot(t.x-CONFIG.PLAYER_START_X,t.y-CONFIG.PLAYER_START_Y)<minDistFromStart) return false;
        return existingBeacons.every(b=>Math.hypot(t.x-b.x,t.y-b.y)>=minDistApart);
    });
}
