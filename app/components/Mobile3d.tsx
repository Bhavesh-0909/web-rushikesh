// BlueprintBackground.mobile.jsx
// Architectural 3D wireframe background — MOBILE OPTIMISED (portrait ~380px)
//   • Narrower building footprint (16×10 vs 34×22)
//   • Portrait-friendly camera (FOV 68, tighter orbit, higher initial angle)
//   • No mouse parallax — gyroscope tilt instead (falls back to static)
//   • Reduced element count per floor for 60fps on mid-range phones
//   • Touch scroll drives construction sequence identically to desktop
//
// npm install @react-three/fiber @react-three/drei three

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';

// ─── PALETTE ──────────────────────────────────────────────────────────────
const C = {
  bg:           '#f8fafc',
  grid:         '#edf2f7',
  fill:         '#ffffff',
  edgeFaint:    '#d0dce8',
  edgeGreen:    '#25D366',
  edgeGreenDim: '#1aaa52',
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

// ─── MOBILE LAYOUT CONSTANTS ─────────────────────────────────────────────
const W    = 8;     // half-width  (desktop was 17)
const D    = 5;     // half-depth  (desktop was 11)
const FH   = 4.5;   // floor height (desktop was 5.2)

const slabY = (n: number) => n * FH - 0.1;
const wallY = (n: number) => n * FH + 2.5;
const furY  = (n: number) => n * FH + 0.13;

// ─── PRIMITIVE BUILDERS ───────────────────────────────────────────────────

function slab(id: string, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = slabY(n);
  return [
    { id:`${id}_c`, pos:[0, y, 0], scale:[W*2, 0.25, D*2], phase, from:'top', intro, green:false },
  ];
}

function outerWalls(id: string, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = wallY(n);
  return [
    { id:`${id}_f`, pos:[0,  y,  D], scale:[W*2, 5, 0.25], phase,        from:'front', intro, green:false },
    { id:`${id}_b`, pos:[0,  y, -D], scale:[W*2, 5, 0.25], phase,        from:'back',  intro, green:false },
    { id:`${id}_l`, pos:[-W, y,  0], scale:[0.25,5, D*2],  phase:phase+0.02, from:'left',  intro, green:false },
    { id:`${id}_r`, pos:[ W, y,  0], scale:[0.25,5, D*2],  phase:phase+0.02, from:'right', intro, green:false },
  ];
}

function columns(id: string, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = wallY(n);
  return [
    { id:`${id}_fl`, pos:[-W, y, -D], scale:[0.45,5,0.45], phase, from:'grow', intro, green:false },
    { id:`${id}_fr`, pos:[ W, y, -D], scale:[0.45,5,0.45], phase, from:'grow', intro, green:false },
    { id:`${id}_bl`, pos:[-W, y,  D], scale:[0.45,5,0.45], phase, from:'grow', intro, green:false },
    { id:`${id}_br`, pos:[ W, y,  D], scale:[0.45,5,0.45], phase, from:'grow', intro, green:false },
  ];
}

// Window: frame + cross bars — all green
function window3(id: string, pos: Vector3Array, w: number, h: number, axis: 'x' | 'y' | 'z', phase: number, intro: boolean): ElementDescriptor[] {
  const depth = 0.22;
  const [px, py, pz] = pos;
  const isX = axis === 'x';
  const frameScale: Vector3Array = isX ? [depth, h, w] : [w, h, depth];
  const hBarScale: Vector3Array  = isX ? [depth+0.05, 0.1, w*0.92] : [w*0.92, 0.1, depth+0.05];
  const vBarScale: Vector3Array  = isX ? [depth+0.05, h*0.88, 0.1] : [0.1, h*0.88, depth+0.05];
  return [
    { id:`${id}_frame`, pos:[px,py,pz], scale:frameScale,  phase,           from: isX?'right':'front', intro, green:true },
    { id:`${id}_hbar`,  pos:[px,py,pz], scale:hBarScale,   phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_vbar`,  pos:[px,py,pz], scale:vBarScale,   phase:phase+0.01, from:'grow', intro, green:true },
  ];
}

// ─── LIGHT FURNITURE (fewer pieces, same primitives) ──────────────────────

function chair(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_seat`, pos:[cx, y+0.55, fz],      scale:[0.9,0.10,0.8],  phase,        from:'grow', intro, green:true },
    { id:`${id}_back`, pos:[cx, y+1.0,  fz-0.35], scale:[0.9,0.8,0.08],  phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_l1`,   pos:[cx-0.36,y+0.27,fz+0.30], scale:[0.08,0.50,0.08], phase, from:'grow', intro, green:true },
    { id:`${id}_l2`,   pos:[cx+0.36,y+0.27,fz+0.30], scale:[0.08,0.50,0.08], phase, from:'grow', intro, green:true },
    { id:`${id}_l3`,   pos:[cx-0.36,y+0.27,fz-0.30], scale:[0.08,0.50,0.08], phase, from:'grow', intro, green:true },
    { id:`${id}_l4`,   pos:[cx+0.36,y+0.27,fz-0.30], scale:[0.08,0.50,0.08], phase, from:'grow', intro, green:true },
  ];
}

function table(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_top`, pos:[cx, y+0.85, fz],          scale:[1.8,0.10,1.0],  phase,        from:'grow', intro, green:true },
    { id:`${id}_l1`,  pos:[cx-0.75,y+0.42,fz-0.42],  scale:[0.10,0.84,0.10], phase, from:'grow', intro, green:true },
    { id:`${id}_l2`,  pos:[cx+0.75,y+0.42,fz-0.42],  scale:[0.10,0.84,0.10], phase, from:'grow', intro, green:true },
    { id:`${id}_l3`,  pos:[cx-0.75,y+0.42,fz+0.42],  scale:[0.10,0.84,0.10], phase, from:'grow', intro, green:true },
    { id:`${id}_l4`,  pos:[cx+0.75,y+0.42,fz+0.42],  scale:[0.10,0.84,0.10], phase, from:'grow', intro, green:true },
  ];
}

function tv(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_scr`,  pos:[cx, y+1.8, fz],  scale:[2.0,1.3,0.10], phase,        from:'grow', intro, green:true },
    { id:`${id}_post`, pos:[cx, y+0.8, fz],  scale:[0.10,1.2,0.10], phase,        from:'grow', intro, green:true },
    { id:`${id}_base`, pos:[cx, y+0.10,fz],  scale:[0.7,0.10,0.4],  phase,        from:'grow', intro, green:true },
  ];
}

function sofa(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_seat`,  pos:[cx, y+0.42, fz],       scale:[2.2,0.28,0.9],  phase,        from:'grow', intro, green:true },
    { id:`${id}_back`,  pos:[cx, y+0.9,  fz-0.38],  scale:[2.2,0.72,0.18], phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_arm_l`, pos:[cx-1.04,y+0.6,fz],     scale:[0.16,0.52,0.9], phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_arm_r`, pos:[cx+1.04,y+0.6,fz],     scale:[0.16,0.52,0.9], phase:phase+0.01, from:'grow', intro, green:true },
  ];
}

function shelf(id: string, cx: number, fz: number, n: number, phase: number, intro: boolean): ElementDescriptor[] {
  const y = furY(n);
  return [
    { id:`${id}_body`, pos:[cx, y+1.0, fz],  scale:[1.2,2.0,0.3],   phase,        from:'grow', intro, green:true },
    { id:`${id}_sh1`,  pos:[cx, y+0.45,fz],  scale:[1.1,0.06,0.26], phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_sh2`,  pos:[cx, y+0.95,fz],  scale:[1.1,0.06,0.26], phase:phase+0.01, from:'grow', intro, green:true },
    { id:`${id}_sh3`,  pos:[cx, y+1.5, fz],  scale:[1.1,0.06,0.26], phase:phase+0.01, from:'grow', intro, green:true },
  ];
}

function photoFrame(id: string, cx: number, wy: number, fz: number, phase: number, intro: boolean): ElementDescriptor[] {
  return [
    { id:`${id}_frame`, pos:[cx, wy+0.5, fz], scale:[0.7,1.0,0.07], phase,        from:'grow', intro, green:true },
    { id:`${id}_inner`, pos:[cx, wy+0.5, fz], scale:[0.5,0.7,0.09], phase:phase+0.01, from:'grow', intro, green:true },
  ];
}

// ─── ELEMENTS ─────────────────────────────────────────────────────────────
const ELEMENTS: ElementDescriptor[] = [

  // ══════════════════════════════════════════════════════════════════
  //  GROUND FLOOR  (auto-play 0 → 0.30)
  // ══════════════════════════════════════════════════════════════════
  ...slab('s0', 0, 0.08, true),
  ...outerWalls('w0', 0, 0.16, true),
  ...columns('col0', 0, 0.19, true),

  // Centre partition
  { id:'p0_1', pos:[0, wallY(0), 0], scale:[0.18,5,D*2*0.55], phase:0.21, from:'left', intro:true, green:false },

  // 2 front windows, 1 side window
  ...window3('wg_f1', [-3.5, wallY(0)+0.2, D+0.13], 2.4,2.0,'z', 0.23, true),
  ...window3('wg_f2', [ 3.5, wallY(0)+0.2, D+0.13], 2.4,2.0,'z', 0.23, true),
  ...window3('wg_r1', [ W+0.13, wallY(0)+0.2, -1.5], 2.8,2.0,'x', 0.24, true),

  // Entrance canopy
  { id:'canopy', pos:[0, 5.0, D+3.2], scale:[8,0.20,3.5], phase:0.26, from:'top',  intro:true, green:false },
  { id:'can_c1', pos:[-3.4, 3.0, D+3.2], scale:[0.25,4.5,0.25], phase:0.27, from:'grow', intro:true, green:false },
  { id:'can_c2', pos:[ 3.4, 3.0, D+3.2], scale:[0.25,4.5,0.25], phase:0.27, from:'grow', intro:true, green:false },

  // Stairs (compact)
  { id:'st0', pos:[-5.5,0.3,-2.0], scale:[1.4,0.5,1.4], phase:0.27, from:'grow', intro:true, green:false },
  { id:'st1', pos:[-5.5,0.7,-3.2], scale:[1.4,0.5,1.4], phase:0.28, from:'grow', intro:true, green:false },
  { id:'st2', pos:[-5.5,1.2,-4.4], scale:[1.4,0.5,1.4], phase:0.28, from:'grow', intro:true, green:false },
  { id:'st3', pos:[-5.5,1.7,-5.6], scale:[1.4,0.5,1.4], phase:0.29, from:'grow', intro:true, green:false },
  { id:'st_r',pos:[-5.5,3.2,-4.0], scale:[0.12,2.2,5.5],phase:0.30, from:'grow', intro:true, green:false },

  // Ground floor furniture (living / reception)
  ...sofa(        'sf0',  -4.2,  2.5, 0, 0.28, true),
  ...tv(          'tv0',  -4.2, -3.5, 0, 0.28, true),
  ...table(       'tb0',   3.8,  2.0, 0, 0.28, true),
  ...chair(       'ch0a',  2.5,  3.2, 0, 0.29, true),
  ...chair(       'ch0b',  5.2,  3.2, 0, 0.29, true),
  ...photoFrame(  'pf0',  -6.2, wallY(0), -4.8, 0.29, true),

  // ══════════════════════════════════════════════════════════════════
  //  FLOOR 1  (scroll 0.30–0.52)
  // ══════════════════════════════════════════════════════════════════
  ...slab('s1', 1, 0.40, false),
  ...outerWalls('w1', 1, 0.46, false),
  ...columns('col1', 1, 0.47, false),

  { id:'p1_1', pos:[2, wallY(1), 0], scale:[0.18,5,D*2*0.6], phase:0.49, from:'right', intro:false, green:false },

  ...window3('w1_f1', [-3.0, wallY(1)+0.2, D+0.13], 2.4,2.0,'z', 0.50, false),
  ...window3('w1_f2', [ 3.6, wallY(1)+0.2, D+0.13], 2.4,2.0,'z', 0.50, false),
  ...window3('w1_b1', [ 0,   wallY(1)+0.2,-D-0.13], 3.2,2.0,'z', 0.51, false),

  // Floor 1 furniture — office
  ...table(       'tb1a',  -4.0,  1.5, 1, 0.51, false),
  ...table(       'tb1b',   3.0, -2.5, 1, 0.51, false),
  ...chair(       'ch1a',  -5.5,  1.5, 1, 0.52, false),
  ...chair(       'ch1b',  -2.5,  1.5, 1, 0.52, false),
  ...tv(          'tv1',    6.0, -4.0, 1, 0.52, false),
  ...shelf(       'sh1',   -6.5,  3.5, 1, 0.52, false),
  ...photoFrame(  'pf1a',   5.5, wallY(1), 3.0, 0.53, false),

  // Stair run F1→F2
  { id:'s1_0',pos:[-5.5,slabY(1)+0.3,-2.0], scale:[1.4,0.5,1.4], phase:0.43, from:'grow', intro:false, green:false },
  { id:'s1_1',pos:[-5.5,slabY(1)+0.7,-3.2], scale:[1.4,0.5,1.4], phase:0.44, from:'grow', intro:false, green:false },
  { id:'s1_2',pos:[-5.5,slabY(1)+1.2,-4.4], scale:[1.4,0.5,1.4], phase:0.45, from:'grow', intro:false, green:false },
  { id:'s1_3',pos:[-5.5,slabY(1)+1.7,-5.6], scale:[1.4,0.5,1.4], phase:0.46, from:'grow', intro:false, green:false },
  { id:'s1_r',pos:[-5.5,slabY(1)+3.2,-4.0], scale:[0.12,2.2,5.5],phase:0.47, from:'grow', intro:false, green:false },

  // ══════════════════════════════════════════════════════════════════
  //  FLOOR 2  (scroll 0.52–0.74)
  // ══════════════════════════════════════════════════════════════════
  ...slab('s2', 2, 0.60, false),
  ...outerWalls('w2', 2, 0.66, false),
  ...columns('col2', 2, 0.67, false),

  { id:'p2_1', pos:[-2, wallY(2), 0], scale:[0.18,5,D*2*0.55], phase:0.69, from:'left', intro:false, green:false },

  ...window3('w2_f1', [-3.5, wallY(2)+0.2, D+0.13], 3.0,2.0,'z', 0.70, false),
  ...window3('w2_f2', [ 3.5, wallY(2)+0.2, D+0.13], 3.0,2.0,'z', 0.70, false),
  ...window3('w2_b1', [ 0,   wallY(2)+0.2,-D-0.13], 4.0,2.0,'z', 0.71, false),
  ...window3('w2_l1', [-W-0.13, wallY(2)+0.2, 0],   3.0,2.0,'x', 0.71, false),

  // Floor 2 furniture — lounge
  ...sofa(        'sf2a',  -4.0,  2.5, 2, 0.71, false),
  ...sofa(        'sf2b',   3.5, -2.5, 2, 0.71, false),
  ...table(       'tb2',    0,    0,   2, 0.72, false),
  ...tv(          'tv2',   -5.5, -4.0, 2, 0.72, false),
  ...photoFrame(  'pf2a',   5.5, wallY(2),  3.5, 0.73, false),
  ...photoFrame(  'pf2b',  -5.5, wallY(2), -4.8, 0.73, false),
  ...shelf(       'sh2',    6.2,  3.5, 2, 0.72, false),

  // ══════════════════════════════════════════════════════════════════
  //  FLOOR 3  (scroll 0.74–0.90)
  // ══════════════════════════════════════════════════════════════════
  ...slab('s3', 3, 0.78, false),
  ...outerWalls('w3', 3, 0.83, false),
  ...columns('col3', 3, 0.84, false),

  { id:'p3_1', pos:[1, wallY(3), 0], scale:[0.18,5,D*2*0.5], phase:0.85, from:'right', intro:false, green:false },

  ...window3('w3_f1', [-3.5, wallY(3)+0.2, D+0.13], 3.0,2.0,'z', 0.86, false),
  ...window3('w3_f2', [ 3.5, wallY(3)+0.2, D+0.13], 3.0,2.0,'z', 0.86, false),
  ...window3('w3_b1', [ 0,   wallY(3)+0.2,-D-0.13], 4.5,2.0,'z', 0.87, false),

  // Floor 3 furniture — studio
  ...table(       'tb3a',  -4.0,  2.0, 3, 0.87, false),
  ...table(       'tb3b',   3.5, -2.5, 3, 0.87, false),
  ...chair(       'ch3a',  -5.5,  2.0, 3, 0.88, false),
  ...chair(       'ch3b',   3.5, -0.8, 3, 0.88, false),
  ...sofa(        'sf3',    5.0,  3.0, 3, 0.87, false),
  ...photoFrame(  'pf3a',  -6.2, wallY(3), 0, 0.88, false),
  ...photoFrame(  'pf3b',   6.2, wallY(3), 0, 0.88, false),
  ...shelf(       'sh3',   -6.5, -3.5, 3, 0.88, false),

  // ══════════════════════════════════════════════════════════════════
  //  ROOF  (scroll 0.90–0.98)
  // ══════════════════════════════════════════════════════════════════
  { id:'rf_main', pos:[0,  slabY(4),  0], scale:[W*2+1, 0.3, D*2+1], phase:0.93, from:'top', intro:false, green:false },
  { id:'rf_ov1',  pos:[-3, slabY(4)+0.9,-1.5], scale:[10,0.2,7],    phase:0.96, from:'top', intro:false, green:false },
  { id:'rf_ov2',  pos:[ 4, slabY(4)+1.6, 1.0], scale:[ 6,0.18,4],   phase:0.98, from:'top', intro:false, green:false },
];

// ─── TRAVEL DISTANCE ──────────────────────────────────────────────────────
const TRAVEL = 40;   // reduced from 60 — pieces don't fly as far on small screen

function startPos(el: ElementDescriptor): Vector3Array {
  const [x,y,z] = el.pos;
  switch(el.from) {
    case 'top':   return [x, y+TRAVEL, z];
    case 'left':  return [x-TRAVEL, y, z];
    case 'right': return [x+TRAVEL, y, z];
    case 'front': return [x, y, z+TRAVEL];
    case 'back':  return [x, y, z-TRAVEL];
    default:      return [x, y, z];
  }
}

// ─── GRID ────────────────────────────────────────────────────────────────
function Grid() {
  return <gridHelper args={[80,80, C.grid, C.grid]} position={[0,-0.14,0]} />;
}

// ─── PIECE ───────────────────────────────────────────────────────────────
function Piece({ data, progRef }: { data: ElementDescriptor, progRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);
  const sp0     = useMemo(() => startPos(data), [data]);

  const [w,h,d] = data.scale;
  const boxGeo  = useMemo(() => new THREE.BoxGeometry(w,h,d), [w,h,d]);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo]);

  const targetEdge = data.green ? C.edgeGreen : C.edgeFaint;
  const flashEdge  = C.edgeGreen;

  useFrame(() => {
    if (!meshRef.current) return;

    const p = progRef.current;
    const WINDOW = 0.09;
    const t = THREE.MathUtils.clamp((p - (data.phase - WINDOW)) / WINDOW, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);

    const [sx,sy,sz] = sp0;
    const [fx,fy,fz] = data.pos;
    meshRef.current.position.set(
      sx+(fx-sx)*e, sy+(fy-sy)*e, sz+(fz-sz)*e
    );

    if (data.from === 'grow') {
      const s = Math.max(0.001, e);
      meshRef.current.scale.set(1, s, 1);
      meshRef.current.position.y = data.pos[1] - (data.scale[1]*(1-s))/2;
    }

    if (meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = e * (data.green ? 0.06 : 0.28);
    }

    if (edgeRef.current?.material) {
      const fresh = Math.max(0, 1 - Math.abs(p - data.phase)*18);
      const col = new THREE.Color().lerpColors(
        new THREE.Color(targetEdge),
        new THREE.Color(flashEdge),
        fresh
      );
      (edgeRef.current.material as THREE.LineBasicMaterial).color.copy(col);
      (edgeRef.current.material as THREE.LineBasicMaterial).opacity = e * (data.green
        ? 0.72 + fresh*0.28
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
        <lineBasicMaterial color={targetEdge} transparent opacity={0} />
      </lineSegments>
    </mesh>
  );
}

// ─── ANNOTATION DOTS ─────────────────────────────────────────────────────
function Dots() {
  const pts: Vector3Array[] = [
    [-W,0,D],[ W,0,D],[-W,0,-D],[ W,0,-D],
    [-W,slabY(1),D],[ W,slabY(1),D],
    [-W,slabY(2),D],[ W,slabY(2),D],
    [-W,slabY(3),D],[ W,slabY(3),D],
    [0, slabY(4), 0],
  ];
  return <>
    {pts.map((p,i) => (
      <mesh key={i} position={p} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[0.14,0.26,20]}/>
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
  const refs = FLOORS.map(() => useRef<any>(null));

  useFrame(() => {
    FLOORS.forEach((f,i) => {
      const a = THREE.MathUtils.clamp((progRef.current - f.t)/0.06, 0, 1);
      if (refs[i].current?.material) (refs[i].current.material as THREE.LineBasicMaterial).opacity = a * 0.45;
    });
  });

  return <>
    {FLOORS.map((f,i) => (
      <Line key={i} ref={refs[i]}
        points={[[-W-2, f.y, -D-2],[W+2, f.y, -D-2]]}
        color={C.edgeGreen} lineWidth={0.7}
        transparent opacity={0}
        dashed dashSize={0.4} gapSize={0.28}
      />
    ))}
  </>;
}

// ─── SCENE ────────────────────────────────────────────────────────────────
const INTRO_MS = 2600;

function Scene() {
  const groupRef    = useRef<THREE.Group>(null);
  const gyroRef     = useRef({ x: 0, y: 0 });   // device tilt for parallax

  const introStart  = useRef<number | null>(null);
  const introDone   = useRef(false);
  const introRaw    = useRef(0);
  const scrollRaw   = useRef(0);
  const progSmooth  = useRef(0);

  useEffect(() => {
    introStart.current = performance.now();

    // Scroll listener (touch scroll works identically)
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollRaw.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Gyroscope tilt — subtle parallax on mobile
    const onGyro = (e: DeviceOrientationEvent) => {
      // gamma = left/right tilt (-90→90), beta = fwd/back tilt
      gyroRef.current.x = THREE.MathUtils.clamp((e.gamma || 0) / 45, -1, 1);
      gyroRef.current.y = THREE.MathUtils.clamp(((e.beta || 0) - 45) / 45, -1, 1);
    };
    window.addEventListener('deviceorientation', onGyro, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('deviceorientation', onGyro);
    };
  }, []);

  useFrame(state => {
    if (!groupRef.current) return;

    // Intro counter
    if (!introDone.current && introStart.current !== null) {
      introRaw.current = Math.min(1, (performance.now() - introStart.current) / INTRO_MS);
      if (introRaw.current >= 1) introDone.current = true;
    }

    // Progress: intro drives 0→0.30, scroll drives 0.30→1.0
    const introPart  = introRaw.current * 0.30;
    const scrollPart = scrollRaw.current * 0.70;
    const target = Math.max(introPart, (introDone.current ? 1 : 0) * 0.30 + scrollPart);
    progSmooth.current = THREE.MathUtils.lerp(progSmooth.current, target, 0.042);
    const p = progSmooth.current;

    // ── MOBILE CAMERA ──────────────────────────────────────────────
    // Portrait framing: narrow horizontal FOV (68), moderate distance.
    // Orbit angle stays tighter so building stays centred in portrait.
    // Camera rises with scroll to keep upper floors visible.
    const angle  = -0.3 + p * Math.PI * 0.22;   // tighter swing (was 0.30)
    const dist   = 30 - p * 12;                  // 30 → 18  (was 54→34)
    const height = 26 - p * 16;                  // 26 → 10  (was 42→14)
    state.camera.position.set(
      Math.sin(angle) * dist,
      height,
      Math.cos(angle) * dist
    );
    state.camera.lookAt(0, p * 9 + 1, 0);

    // Gyroscope parallax (negligible on desktop fallback — gyro stays 0)
    const gx = gyroRef.current.x;
    const gy = gyroRef.current.y;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, gx * 1.2, 0.05);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, gy * 0.7, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, gx * 0.03, 0.07);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={2.6}/>
      <directionalLight position={[10,25,10]} intensity={0.30}/>

      <group position={[0,-4,0]}>
        <Grid/>
        {ELEMENTS.map(el => (
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
      position: 'fixed', inset: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
      background: C.bg, overflow: 'hidden',
    }}>
      {/* dpr capped at 1.5 — avoids GPU overload on high-DPI phones */}
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault fov={68} position={[22, 24, 22]}/>
        <Scene/>
      </Canvas>
    </div>
  );
}

/**
 * ─── USAGE ────────────────────────────────────────────────────────────────
 * Same setup as desktop version — just swap the import:
 *
 * import BlueprintBackground from './BlueprintBackground.mobile';
 *
 * export default function App() {
 *   return (
 *     <>
 *       <BlueprintBackground />
 *       <main style={{ position:'relative', zIndex:1 }}>
 *         <section style={{height:'100vh'}}>Hero — intro plays</section>
 *         <section style={{height:'100vh'}}>About — Floor 1</section>
 *         <section style={{height:'100vh'}}>Projects — Floor 2</section>
 *         <section style={{height:'100vh'}}>Team — Floor 3</section>
 *         <section style={{height:'100vh'}}>Contact — Roof</section>
 *       </main>
 *     </>
 *   );
 * }
 *
 * ─── MOBILE CHANGES vs DESKTOP ────────────────────────────────────────────
 * Building         34×22 footprint → 16×10 (fits portrait viewport)
 * Camera FOV       52° → 68°       (wider for portrait framing)
 * Camera distance  54–34           → 30–18  (closer, less dead space)
 * Camera height    42–14           → 26–10
 * Orbit swing      π×0.30          → π×0.22 (tighter, building stays centred)
 * Travel distance  60              → 40     (pieces fly shorter distance)
 * Parallax         Mouse XY        → DeviceOrientation gamma/beta (gyro)
 * DPR cap          2               → 1.5    (60fps on mid-range phones)
 * Elements         ~350            → ~180   (half, same visual rhythm)
 * Furniture / floor 6–8 items      → 3–4 items
 * Windows / floor  3–4             → 2–3
 * Stair runs       5 steps + rail  → 4 steps + rail
 *
 * ─── CONSTRUCTION SEQUENCE ────────────────────────────────────────────────
 * PAGE LOAD (auto 2.6 s):
 *   Ground slab → outer walls → columns → windows (cross-bar detail) →
 *   sofa / TV / table / chairs → photo frames → canopy → stairs
 *
 * SCROLL 0–35%:  Floor 1 slab + walls + office desk set + stair run
 * SCROLL 35–55%: Floor 2 slab + walls + lounge sofas + TV
 * SCROLL 55–75%: Floor 3 slab + walls + studio tables + shelf
 * SCROLL 75–100%: Roof panels drop → building fully assembled ✓
 */