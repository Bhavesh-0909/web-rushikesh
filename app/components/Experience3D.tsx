// BlueprintBackground.jsx
// Architectural 3D wireframe background with:
//   • Auto-play intro: ground floor assembles on load (2.6s)
//   • Scroll: 3 more floors stack up, roof drops at 95%
//   • Window frames (cross-bar detail), interior furniture per floor
//   • Green (#25D366) dominant wireframe edges, very light fills
//
// npm install @react-three/fiber @react-three/drei three

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';

// ─── PALETTE ──────────────────────────────────────────────────────────────
const C = {
  bg:          '#f8fafc',
  grid:        '#edf2f7',
  fill:        '#ffffff',       // solid face fill (very transparent)
  edgeFaint:   '#d0dce8',       // idle structural edges
  edgeGreen:   '#25D366',       // active / window / furniture edges
  edgeGreenDim:'#1aaa52',       // slightly dimmer green for furniture
};

// ─── TYPES ────────────────────────────────────────────────────────────────
type Vector3Array = [number, number, number];

interface ElementDescriptor {
  id: string;
  pos: Vector3Array;
  scale: Vector3Array;
  phase: number;
  from: 'top' | 'left' | 'right' | 'front' | 'back' | 'grow';
  intro: boolean;
  green: boolean;
}

// ─── FLOOR LAYOUT HELPERS ─────────────────────────────────────────────────
const FH    = 5.2;                         // floor-to-floor height
const slabY = (n: number) => n * FH - 0.1;          // slab top-face Y
const wallY = (n: number) => n * FH + 2.5;          // wall mid Y
const furY  = (n: number) => n * FH + 0.13;         // furniture sits on slab

// ─── PRIMITIVE BUILDERS ───────────────────────────────────────────────────
// Each returns an array of element descriptors {pos,scale,phase,from,green}
// green=true → uses edgeGreen instead of edgeFaint

function slab(id: string, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = slabY(n);
  return [
    { id:`${id}_c`, pos:[0,  y,0],  scale:[34,0.25,22], phase, from:'top', intro, green:false },
    { id:`${id}_l`, pos:[-20,y,0],  scale:[8, 0.25,14], phase:phase+0.02, from:'top', intro, green:false },
    { id:`${id}_r`, pos:[20, y,0],  scale:[8, 0.25,14], phase:phase+0.02, from:'top', intro, green:false },
  ];
}

function outerWalls(id: string, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = wallY(n);
  return [
    { id:`${id}_f`, pos:[0,  y, 11], scale:[34,5,0.25], phase,      from:'front', intro, green:false },
    { id:`${id}_b`, pos:[0,  y,-11], scale:[34,5,0.25], phase,      from:'back',  intro, green:false },
    { id:`${id}_l`, pos:[-17,y,  0], scale:[0.25,5,22], phase:phase+0.02, from:'left',  intro, green:false },
    { id:`${id}_r`, pos:[17, y,  0], scale:[0.25,5,22], phase:phase+0.02, from:'right', intro, green:false },
  ];
}

function columns(id: string, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = wallY(n);
  return [
    { id:`${id}_fl`, pos:[-17,y,-11], scale:[0.55,5,0.55], phase, from:'grow', intro, green:false },
    { id:`${id}_fr`, pos:[17, y,-11], scale:[0.55,5,0.55], phase, from:'grow', intro, green:false },
    { id:`${id}_bl`, pos:[-17,y, 11], scale:[0.55,5,0.55], phase, from:'grow', intro, green:false },
    { id:`${id}_br`, pos:[17, y, 11], scale:[0.55,5,0.55], phase, from:'grow', intro, green:false },
  ];
}

// Window: outer frame box + horizontal bar + vertical bar (cross detail)
// All window edges are green
function window3(id: string, pos: Vector3Array, w: number, h: number, axis: 'x' | 'y' | 'z', phase: number, intro: boolean): ElementDescriptor[] {
  const depth = 0.22;
  const [px, py, pz] = pos;
  const isX = axis === 'x';
  const frameScale: Vector3Array = isX ? [depth, h, w] : [w, h, depth];
  const hBarScale: Vector3Array  = isX ? [depth+0.05, 0.12, w * 0.95] : [w * 0.95, 0.12, depth+0.05];
  const vBarScale: Vector3Array  = isX ? [depth+0.05, h * 0.9, 0.12]  : [0.12, h * 0.9, depth+0.05];
  return [
    { id:`${id}_frame`, pos:[px,py,pz],        scale:frameScale,  phase,        from: isX?'right':'front', intro, green:true  },
    { id:`${id}_hbar`,  pos:[px,py,pz],        scale:hBarScale,   phase:phase+0.01, from:'grow', intro, green:true  },
    { id:`${id}_vbar`,  pos:[px,py,pz],        scale:vBarScale,   phase:phase+0.01, from:'grow', intro, green:true  },
  ];
}

// ─── FURNITURE PRIMITIVES ─────────────────────────────────────────────────
// Chair: seat box + 4 thin legs + back rest — all green edges
function chair(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    // Seat
    { id:`${id}_seat`, pos:[cx, y+0.55, fz],    scale:[1.1,0.12,1.0], phase, from:'grow', intro, green:true },
    // Back
    { id:`${id}_back`, pos:[cx, y+1.1,  fz-0.42], scale:[1.1,1.0,0.1],  phase:phase+0.01, from:'grow', intro, green:true },
    // Legs (4)
    { id:`${id}_l1`,   pos:[cx-0.44,y+0.27,fz+0.38], scale:[0.1,0.54,0.1], phase, from:'grow', intro, green:true },
    { id:`${id}_l2`,   pos:[cx+0.44,y+0.27,fz+0.38], scale:[0.1,0.54,0.1], phase, from:'grow', intro, green:true },
    { id:`${id}_l3`,   pos:[cx-0.44,y+0.27,fz-0.38], scale:[0.1,0.54,0.1], phase, from:'grow', intro, green:true },
    { id:`${id}_l4`,   pos:[cx+0.44,y+0.27,fz-0.38], scale:[0.1,0.54,0.1], phase, from:'grow', intro, green:true },
  ];
}

// Table: flat top + 4 legs
function table(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_top`,  pos:[cx, y+0.95, fz],        scale:[2.5,0.12,1.4], phase, from:'grow', intro, green:true },
    { id:`${id}_l1`,   pos:[cx-1.05,y+0.47,fz-0.55],scale:[0.12,0.94,0.12], phase, from:'grow', intro, green:true },
    { id:`${id}_l2`,   pos:[cx+1.05,y+0.47,fz-0.55],scale:[0.12,0.94,0.12], phase, from:'grow', intro, green:true },
    { id:`${id}_l3`,   pos:[cx-1.05,y+0.47,fz+0.55],scale:[0.12,0.94,0.12], phase, from:'grow', intro, green:true },
    { id:`${id}_l4`,   pos:[cx+1.05,y+0.47,fz+0.55],scale:[0.12,0.94,0.12], phase, from:'grow', intro, green:true },
  ];
}

// TV: tall thin slab + stand post + base
function tv(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_screen`, pos:[cx, y+2.1, fz],       scale:[3.0,1.8,0.12], phase, from:'grow', intro, green:true },
    { id:`${id}_post`,   pos:[cx, y+0.85, fz],      scale:[0.14,1.4,0.14],phase, from:'grow', intro, green:true },
    { id:`${id}_base`,   pos:[cx, y+0.12, fz],      scale:[1.0,0.12,0.5], phase, from:'grow', intro, green:true },
  ];
}

// Photo frame: thin portrait rectangle on wall
function photoFrame(id: string, cx: number, wy: number, fz: number, phase: number, intro: boolean): ElementDescriptor[] {
  return [
    { id:`${id}_frame`, pos:[cx, wy+0.6, fz],   scale:[1.0,1.4,0.08], phase, from:'grow', intro, green:true },
    { id:`${id}_inner`, pos:[cx, wy+0.6, fz],   scale:[0.7,1.0,0.10], phase:phase+0.01, from:'grow', intro, green:true },
  ];
}

// Sofa: wide seat + back + arm rests
function sofa(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_seat`,  pos:[cx, y+0.48, fz],        scale:[3.2,0.35,1.2], phase, from:'grow', intro, green:true },
    { id:`${id}_back`,  pos:[cx, y+1.1,  fz-0.50],   scale:[3.2,0.9,0.22], phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_arm_l`, pos:[cx-1.5,y+0.75, fz],     scale:[0.2,0.65,1.2], phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_arm_r`, pos:[cx+1.5,y+0.75, fz],     scale:[0.2,0.65,1.2], phase:phase+0.01, from:'grow', intro, green:true },
  ];
}

// Bookshelf: vertical cabinet + 3 shelf lines
function shelf(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_body`,  pos:[cx, y+1.2, fz],         scale:[1.8,2.4,0.4],  phase, from:'grow', intro, green:true },
    { id:`${id}_sh1`,   pos:[cx, y+0.55,fz],         scale:[1.65,0.08,0.35],phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_sh2`,   pos:[cx, y+1.15,fz],         scale:[1.65,0.08,0.35],phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_sh3`,   pos:[cx, y+1.75,fz],         scale:[1.65,0.08,0.35],phase:phase+0.01, from:'grow', intro, green:true },
  ];
}

// ─── FULL ELEMENT LIST ────────────────────────────────────────────────────
const ELEMENTS: ElementDescriptor[] = [

  // ══════════════════════════════════════════════════════════════════
  //  GROUND FLOOR  (intro auto-play 0 → 0.30)
  // ══════════════════════════════════════════════════════════════════
  ...slab('s0', 0, 0.08, true),
  ...outerWalls('w0', 0, 0.16, true),
  ...columns('col0', 0, 0.19, true),

  // Partitions
  { id:'p0_1', pos:[0,  wallY(0), 0],  scale:[0.2,5,14],  phase:0.21, from:'left',  intro:true, green:false },
  { id:'p0_2', pos:[-6, wallY(0),-3],  scale:[10, 5,0.2], phase:0.21, from:'back',  intro:true, green:false },

  // Ground floor windows (green framed)
  ...window3('wg_f1', [-8,  wallY(0)+0.2, 11.15], 3.5, 2.2, 'z', 0.23, true),
  ...window3('wg_f2', [0,   wallY(0)+0.2, 11.15], 3.5, 2.2, 'z', 0.23, true),
  ...window3('wg_f3', [8,   wallY(0)+0.2, 11.15], 3.5, 2.2, 'z', 0.23, true),
  ...window3('wg_r1', [17.15,wallY(0)+0.2,-3],    4.0, 2.2, 'x', 0.24, true),

  // Entrance canopy
  { id:'canopy',   pos:[0,  5.8,  14],   scale:[14,0.25,5],   phase:0.26, from:'top',  intro:true, green:false },
  { id:'can_c1',   pos:[-5, 3.1,  14],   scale:[0.3,5.4,0.3], phase:0.27, from:'grow', intro:true, green:false },
  { id:'can_c2',   pos:[5,  3.1,  14],   scale:[0.3,5.4,0.3], phase:0.27, from:'grow', intro:true, green:false },

  // Stairs
  { id:'st0', pos:[-9,0.3,-5],   scale:[2,0.6,2], phase:0.27, from:'grow', intro:true, green:false },
  { id:'st1', pos:[-9,0.8,-6.5], scale:[2,0.6,2], phase:0.28, from:'grow', intro:true, green:false },
  { id:'st2', pos:[-9,1.3,-8.0], scale:[2,0.6,2], phase:0.28, from:'grow', intro:true, green:false },
  { id:'st3', pos:[-9,1.8,-9.5], scale:[2,0.6,2], phase:0.29, from:'grow', intro:true, green:false },
  { id:'st4', pos:[-9,2.3,-11],  scale:[2,0.6,2], phase:0.29, from:'grow', intro:true, green:false },
  { id:'st_r',pos:[-9,4.0,-8.0], scale:[0.15,2.5,9],phase:0.30,from:'grow',intro:true, green:false },

  // Ground floor furniture — living room left side
  ...sofa(    'sf0',   -7,   6,  0, 0.28, true),
  ...tv(      'tv0',   -7,  -6,  0, 0.28, true),
  ...photoFrame('pf0', -10, wallY(0),-10.8, 0.29, true),
  ...photoFrame('pf1', -5,  wallY(0),-10.8, 0.29, true),
  // Right side: dining
  ...table(   'tb0',   6,   4,  0, 0.28, true),
  ...chair(   'ch0a',  4,   5.2,0, 0.29, true),
  ...chair(   'ch0b',  8,   5.2,0, 0.29, true),
  ...chair(   'ch0c',  6,   6.6,0, 0.29, true),
  ...shelf(   'sh0',   11, -8,  0, 0.29, true),

  // ══════════════════════════════════════════════════════════════════
  //  FLOOR 1  (scroll 0.30–0.50)
  // ══════════════════════════════════════════════════════════════════
  ...slab('s1', 1, 0.40, false),
  ...outerWalls('w1', 1, 0.46, false),
  ...columns('col1', 1, 0.47, false),

  { id:'p1_1', pos:[5,  wallY(1), 0],  scale:[0.2,5,16], phase:0.49, from:'right', intro:false, green:false },
  { id:'p1_2', pos:[-4, wallY(1), 3],  scale:[12, 5,0.2],phase:0.49, from:'front', intro:false, green:false },

  ...window3('w1_f1', [-8,  wallY(1)+0.2, 11.15], 3.5,2.2,'z', 0.50, false),
  ...window3('w1_f2', [8,   wallY(1)+0.2, 11.15], 3.5,2.2,'z', 0.50, false),
  ...window3('w1_r1', [17.15,wallY(1)+0.2,-3],    4.0,2.2,'x', 0.51, false),
  ...window3('w1_b1', [-5,  wallY(1)+0.2,-11.15], 4.0,2.2,'z', 0.51, false),
  ...window3('w1_b2', [5,   wallY(1)+0.2,-11.15], 4.0,2.2,'z', 0.51, false),

  // Floor 1 furniture — office / workspace
  ...table(   'tb1a',  -6,   2,  1, 0.51, false),
  ...table(   'tb1b',   4,  -4,  1, 0.51, false),
  ...chair(   'ch1a',  -8,   2,  1, 0.52, false),
  ...chair(   'ch1b',  -4,   2,  1, 0.52, false),
  ...chair(   'ch1c',   4,  -6,  1, 0.52, false),
  ...chair(   'ch1d',   6,  -2,  1, 0.52, false),
  ...tv(      'tv1',    10, -8,  1, 0.52, false),
  ...photoFrame('pf1a',-14, wallY(1), 5,  0.53, false),
  ...photoFrame('pf1b',-14, wallY(1),-5,  0.53, false),
  ...shelf(   'sh1',   -12,  8,  1, 0.52, false),

  // ══════════════════════════════════════════════════════════════════
  //  FLOOR 2  (scroll 0.50–0.72)
  // ══════════════════════════════════════════════════════════════════
  ...slab('s2', 2, 0.60, false),
  ...outerWalls('w2', 2, 0.66, false),
  ...columns('col2', 2, 0.67, false),

  { id:'p2_1', pos:[-5, wallY(2), 0],  scale:[0.2,5,16], phase:0.69, from:'left',  intro:false, green:false },
  { id:'p2_2', pos:[4,  wallY(2),-3],  scale:[10, 5,0.2],phase:0.69, from:'back',  intro:false, green:false },

  ...window3('w2_f1', [-8,  wallY(2)+0.2, 11.15], 5.0,2.2,'z', 0.70, false),
  ...window3('w2_f2', [8,   wallY(2)+0.2, 11.15], 5.0,2.2,'z', 0.70, false),
  ...window3('w2_l1', [-17.15,wallY(2)+0.2,-3],   4.0,2.2,'x', 0.71, false),
  ...window3('w2_b1', [0,    wallY(2)+0.2,-11.15],6.0,2.2,'z', 0.71, false),

  // Floor 2 furniture — lounge / meeting
  ...sofa(    'sf2a',  -6,   7,  2, 0.71, false),
  ...sofa(    'sf2b',   6,  -7,  2, 0.71, false),
  ...table(   'tb2',    0,   0,  2, 0.72, false),
  ...chair(   'ch2a',  -2,   1,  2, 0.72, false),
  ...chair(   'ch2b',   2,  -1,  2, 0.72, false),
  ...tv(      'tv2',   -10, -8,  2, 0.72, false),
  ...photoFrame('pf2a',  9, wallY(2), 10.8, 0.73, false),
  ...photoFrame('pf2b', -9, wallY(2), 10.8, 0.73, false),
  ...photoFrame('pf2c',  0, wallY(2),-10.8, 0.73, false),
  ...shelf(   'sh2a',   12,  8,  2, 0.72, false),
  ...shelf(   'sh2b',  -12, -8,  2, 0.72, false),

  // Stair run 2 (floor 1 → 2)
  { id:'st2_0',pos:[-9,slabY(1)+0.3,-5],   scale:[2,0.6,2],  phase:0.63,from:'grow',intro:false,green:false},
  { id:'st2_1',pos:[-9,slabY(1)+0.8,-6.5], scale:[2,0.6,2],  phase:0.64,from:'grow',intro:false,green:false},
  { id:'st2_2',pos:[-9,slabY(1)+1.3,-8.0], scale:[2,0.6,2],  phase:0.65,from:'grow',intro:false,green:false},
  { id:'st2_3',pos:[-9,slabY(1)+1.8,-9.5], scale:[2,0.6,2],  phase:0.66,from:'grow',intro:false,green:false},
  { id:'st2_r',pos:[-9,slabY(1)+4.0,-8.0], scale:[0.15,2.5,9],phase:0.67,from:'grow',intro:false,green:false},

  // ══════════════════════════════════════════════════════════════════
  //  FLOOR 3  (scroll 0.72–0.88)
  // ══════════════════════════════════════════════════════════════════
  ...slab('s3', 3, 0.78, false),
  ...outerWalls('w3', 3, 0.83, false),
  ...columns('col3', 3, 0.84, false),

  { id:'p3_1', pos:[0,  wallY(3), 0],  scale:[0.2,5,14], phase:0.85, from:'right', intro:false, green:false },
  { id:'p3_2', pos:[-6, wallY(3), 3],  scale:[8,  5,0.2],phase:0.85, from:'front', intro:false, green:false },

  ...window3('w3_f1', [-8,  wallY(3)+0.2, 11.15], 5.0,2.2,'z', 0.86, false),
  ...window3('w3_f2', [8,   wallY(3)+0.2, 11.15], 5.0,2.2,'z', 0.86, false),
  ...window3('w3_b1', [0,   wallY(3)+0.2,-11.15], 8.0,2.2,'z', 0.87, false),
  ...window3('w3_r1', [17.15,wallY(3)+0.2, 3],    5.0,2.2,'x', 0.87, false),

  // Floor 3 furniture — studio / creative
  ...table(   'tb3a',  -7,   5,  3, 0.87, false),
  ...table(   'tb3b',   5,  -5,  3, 0.87, false),
  ...chair(   'ch3a',  -7,   7,  3, 0.88, false),
  ...chair(   'ch3b',  -5,   3,  3, 0.88, false),
  ...chair(   'ch3c',   5,  -3,  3, 0.88, false),
  ...sofa(    'sf3',    6,   7,  3, 0.87, false),
  ...tv(      'tv3',    0,  -9,  3, 0.88, false),
  ...photoFrame('pf3a', 12, wallY(3), 0,  0.88, false),
  ...photoFrame('pf3b',-12, wallY(3), 0,  0.88, false),
  ...photoFrame('pf3c',  0, wallY(3),-10.8,0.88, false),
  ...shelf(   'sh3',   13, -6,  3, 0.88, false),

  // ══════════════════════════════════════════════════════════════════
  //  ROOF  (scroll 0.88–0.98)
  // ══════════════════════════════════════════════════════════════════
  { id:'rf_main', pos:[0,   slabY(4),  0],   scale:[35,0.35,23], phase:0.92, from:'top', intro:false, green:false },
  { id:'rf_el',   pos:[-20, slabY(4),  0],   scale:[9, 0.25,15], phase:0.94, from:'top', intro:false, green:false },
  { id:'rf_er',   pos:[20,  slabY(4),  0],   scale:[9, 0.25,15], phase:0.94, from:'top', intro:false, green:false },
  { id:'rf_ov1',  pos:[-6,  slabY(4)+1.2,-3],scale:[18,0.25,14], phase:0.96, from:'top', intro:false, green:false },
  { id:'rf_ov2',  pos:[9,   slabY(4)+2.0, 2],scale:[12,0.2, 9],  phase:0.98, from:'top', intro:false, green:false },
];

// ─── TRAVEL DISTANCE ──────────────────────────────────────────────────────
const TRAVEL = 60;

function startPos(el: ElementDescriptor): Vector3Array {
  const [x,y,z] = el.pos;
  switch(el.from) {
    case 'top':   return [x, y+TRAVEL, z];
    case 'left':  return [x-TRAVEL, y, z];
    case 'right': return [x+TRAVEL, y, z];
    case 'front': return [x, y, z+TRAVEL];
    case 'back':  return [x, y, z-TRAVEL];
    default:      return [x, y, z]; // grow
  }
}

// ─── GRID ────────────────────────────────────────────────────────────────
function Grid() {
  return <gridHelper args={[150,150, C.grid, C.grid]} position={[0,-0.14,0]} />;
}

// ─── PIECE ───────────────────────────────────────────────────────────────
function Piece({ data, progRef }: { data: ElementDescriptor, progRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);
  const sp0     = useMemo(() => startPos(data), [data]);

  const [w,h,d] = data.scale;
  const boxGeo  = useMemo(() => new THREE.BoxGeometry(w,h,d), [w,h,d]);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo]);

  // target edge color
  const targetEdge = data.green ? C.edgeGreen : C.edgeFaint;
  const flashEdge  = C.edgeGreen;

  useFrame(() => {
    if (!meshRef.current) return;

    const p = progRef.current;
    const W = 0.09;
    const t = THREE.MathUtils.clamp((p-(data.phase-W))/W, 0, 1);
    const e = 1 - Math.pow(1-t, 3);

    // Position
    const [sx,sy,sz] = sp0;
    const [fx,fy,fz] = data.pos;
    meshRef.current.position.set(
      sx+(fx-sx)*e, sy+(fy-sy)*e, sz+(fz-sz)*e
    );

    // Grow: scale Y from base
    if (data.from==='grow') {
      const s = Math.max(0.001,e);
      meshRef.current.scale.set(1,s,1);
      meshRef.current.position.y = data.pos[1] - (data.scale[1]*(1-s))/2;
    }

    // Fill: very subtle
    if (meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = e * (data.green ? 0.06 : 0.30);
    }

    // Edge: green flash on land, then settle to target color
    if (edgeRef.current?.material) {
      const fresh = Math.max(0, 1 - Math.abs(p-data.phase)*18);
      const col = new THREE.Color().lerpColors(
        new THREE.Color(targetEdge),
        new THREE.Color(flashEdge),
        fresh
      );
      (edgeRef.current.material as THREE.LineBasicMaterial).color.copy(col);
      // Green elements stay bright; structural fades to gentle
      (edgeRef.current.material as THREE.LineBasicMaterial).opacity = e * (data.green
        ? 0.70 + fresh*0.30
        : 0.22 + fresh*0.60
      );
    }
  });

  return (
    <mesh ref={meshRef} position={sp0 as [number, number, number]}>
      <primitive object={boxGeo} attach="geometry" />
      <meshStandardMaterial
        color={C.fill}
        transparent opacity={0}
        roughness={1} metalness={0}
      />
      <lineSegments ref={edgeRef}>
        <primitive object={edgeGeo} attach="geometry" />
        <lineBasicMaterial
          color={targetEdge}
          transparent opacity={0}
        />
      </lineSegments>
    </mesh>
  );
}

// ─── ANNOTATION DOTS ─────────────────────────────────────────────────────
function Dots() {
  const pts: Vector3Array[] = [
    [-17,0,11],[17,0,11],[-17,0,-11],[17,0,-11],
    [-17,slabY(1),11],[17,slabY(1),11],
    [-17,slabY(2),11],[17,slabY(2),11],
    [-17,slabY(3),11],[17,slabY(3),11],
    [0,  slabY(4), 0],
  ];
  return <>
        {pts.map((p, i)=>(
      <mesh key={i} position={p} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[0.20,0.35,24]}/>
        <meshBasicMaterial color={C.edgeGreen} transparent opacity={0.55} side={THREE.DoubleSide}/>
      </mesh>
    ))}
  </>;
}

// ─── FLOOR LEVEL LINES ────────────────────────────────────────────────────
function FloorLines({ progRef }: { progRef: React.MutableRefObject<number> }) {
  const FLOORS = [
    { y:slabY(0), t:0.10 },
    { y:slabY(1), t:0.42 },
    { y:slabY(2), t:0.62 },
    { y:slabY(3), t:0.80 },
  ];
  const refs = FLOORS.map(()=>useRef<any>(null));

  useFrame(()=>{
    FLOORS.forEach((f,i)=>{
      const a = THREE.MathUtils.clamp((progRef.current-f.t)/0.06,0,1);
      if(refs[i].current?.material) (refs[i].current.material as THREE.LineBasicMaterial).opacity = a*0.45;
    });
  });

  return <>
    {FLOORS.map((f,i)=>(
      <Line key={i} ref={refs[i]}
        points={[[-21,f.y,-13],[21,f.y,-13]]}
        color={C.edgeGreen} lineWidth={0.8}
        transparent opacity={0}
        dashed dashSize={0.5} gapSize={0.35}
      />
    ))}
  </>;
}

// ─── SCENE ────────────────────────────────────────────────────────────────
const INTRO_MS = 2600;

function Scene() {
  const { mouse } = useThree();
  const groupRef  = useRef<THREE.Group>(null);

  const introStart = useRef<number | null>(null);
  const introDone  = useRef(false);
  const introRaw   = useRef(0);
  const scrollRaw  = useRef(0);
  const progSmooth = useRef(0);

  useEffect(()=>{
    introStart.current = performance.now();
    const onScroll=()=>{
      const max = document.body.scrollHeight - window.innerHeight;
      scrollRaw.current = max>0 ? window.scrollY/max : 0;
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    return ()=>window.removeEventListener('scroll', onScroll);
  },[]);

  useFrame(state=>{
    if(!groupRef.current) return;

    // Intro 0→1 over INTRO_MS
    if(!introDone.current && introStart.current !== null){
      introRaw.current = Math.min(1,(performance.now()-introStart.current)/INTRO_MS);
      if(introRaw.current>=1) introDone.current=true;
    }

    // Blend: intro covers 0→0.30, scroll covers 0.30→1.0
    const introPart  = introRaw.current * 0.30;
    const scrollPart = scrollRaw.current * 0.70;
    const target = Math.max(introPart, (introDone.current?1:0)*0.30 + scrollPart);

    progSmooth.current = THREE.MathUtils.lerp(progSmooth.current, target, 0.042);
    const p = progSmooth.current;

    // Camera: starts high (watch pieces fall from sky), orbits+descends on scroll
    const angle  = -0.5 + p*Math.PI*0.30;
    const dist   = 54 - p*20;
    const height = 42 - p*28;
    state.camera.position.set(Math.sin(angle)*dist, height, Math.cos(angle)*dist);
    state.camera.lookAt(0, p*12+1, 0);

    // Parallax
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouse.x*1.8, 0.04);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, mouse.y*1.0, 0.04);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x*0.04, 0.07);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={2.4}/>
      <directionalLight position={[15,35,15]} intensity={0.35}/>

      <group position={[0,-4,0]}>
        <Grid/>
        {ELEMENTS.map((el)=>(
          <Piece key={el.id} data={el} progRef={progSmooth}/>
        ))}
        <FloorLines progRef={progSmooth}/>
        <Dots/>
      </group>
    </group>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────
export default function BlueprintBackground() {
  return (
    <div style={{
      position:'fixed', inset:0, width:'100%', height:'100%',
      pointerEvents:'none', zIndex:0, background:C.bg, overflow:'hidden',
    }}>
      <Canvas dpr={[1,2]} gl={{antialias:true, alpha:true}}>
        <PerspectiveCamera makeDefault fov={52} position={[40,36,40]}/>
        <Scene/>
      </Canvas>
    </div>
  );
}

/**
 * ─── USAGE ────────────────────────────────────────────────────────────────
 * npm install @react-three/fiber @react-three/drei three
 *
 * export default function App() {
 *   return (
 *     <>
 *       <BlueprintBackground />
 *       <main style={{ position:'relative', zIndex:1 }}>
 *         <section style={{height:'100vh'}}>Hero — auto-intro plays</section>
 *         <section style={{height:'100vh'}}>About — Floor 1 drops</section>
 *         <section style={{height:'100vh'}}>Projects — Floor 2 drops</section>
 *         <section style={{height:'100vh'}}>Team — Floor 3 drops</section>
 *         <section style={{height:'100vh'}}>Contact — Roof seals it</section>
 *       </main>
 *     </>
 *   );
 * }
 *
 * ─── CONSTRUCTION SEQUENCE ────────────────────────────────────────────────
 * PAGE LOAD (auto 2.6s):
 *   Ground slab falls → outer walls slide in → columns grow up →
 *   window frames (cross-bar detail) protrude → sofa/TV/table/chairs appear →
 *   photo frames hang on walls → canopy drops → stairs step up
 *
 * SCROLL 0–35%:  Floor 1 slab drops → walls + office furniture (tables, chairs, shelf)
 * SCROLL 35–55%: Floor 2 slab drops → walls + lounge furniture (sofas, TV, frames)
 * SCROLL 55–75%: Floor 3 slab drops → walls + studio furniture (tables, chairs, sofa)
 * SCROLL 75–100%: Roof panels fall one by one → building fully assembled ✓
 *
 * ─── DESIGN NOTES ─────────────────────────────────────────────────────────
 * • Structural elements (walls, slabs, columns): light grey edges (#c8d4e0), 30% opacity fill
 * • Window frames + ALL furniture: green edges (#25D366), 70% opacity, 6% fill
 * • Green flash on every element as it lands, then settles to target color
 * • 4 green dashed floor-level lines appear after each slab drops
 * • Annotation dots (ring circles) at all corner/floor intersections
 */