/**
 * npc.js - NPC ARDF hunters with float positions
 * WLD FoxWave ARDF
 */
"use strict";
const NPC_COLORS=['#ff8844','#44ccff','#ff44aa'];
let npcs=[];
function initNPCs(){
    npcs=[];
    const spread=walkableTiles.filter(t=>Math.hypot(t.x-CONFIG.PLAYER_START_X,t.y-CONFIG.PLAYER_START_Y)>8);
    for(let i=0;i<Math.min(CONFIG.NPC_COUNT,CONFIG.NPC_CALLSIGNS.length);i++){
        const pos=spread[Math.floor(Math.random()*spread.length)];
        npcs.push({px:pos.x+0.5,py:pos.y+0.5,get x(){return Math.floor(this.px);},get y(){return Math.floor(this.py);},facing:0,callsign:CONFIG.NPC_CALLSIGNS[i],color:NPC_COLORS[i%NPC_COLORS.length],_lastMove:0,_dir:['up','down','left','right'][i%4],_steps:0});
    }
}
function updateNPCs(now){
    for(const npc of npcs){
        if(now-npc._lastMove<CONFIG.NPC_MOVE_DELAY) continue;
        npc._steps=(npc._steps||0)+1;
        const dirs=['up','down','left','right'];
        const order=npc._steps<6?[npc._dir,...dirs.filter(d=>d!==npc._dir).sort(()=>Math.random()-0.5)]:dirs.sort(()=>Math.random()-0.5);
        for(const d of order){
            const nx=npc.px+(d==='right'?1:d==='left'?-1:0);
            const ny=npc.py+(d==='down'?1:d==='up'?-1:0);
            if(!isSolid3D(Math.floor(nx),Math.floor(ny))&&isWalkable(Math.floor(nx),Math.floor(ny))){npc.px=nx;npc.py=ny;npc.facing={up:0,right:90,down:180,left:270}[d];if(d!==npc._dir){npc._dir=d;npc._steps=0;}break;}
        }
        npc._lastMove=now;
    }
}
function getNPCs(){return npcs;}
