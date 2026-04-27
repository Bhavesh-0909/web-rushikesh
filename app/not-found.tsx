// not-found.jsx  (or not-found.tsx for TypeScript)
// Drop this into your Next.js app directory as app/not-found.jsx
// npm install three

"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as THREE from "three"

// ─── 3D Scene ──────────────────────────────────────────────────────────────
function useThreeScene(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const W = () => container.clientWidth
    const H = () => container.clientHeight

    // ── Renderer ────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(W(), H())

    // ── Scene / Camera ──────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 200)
    camera.position.set(18, 14, 22)
    camera.lookAt(0, 4, 0)

    // ── Lights ──────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 2.2))
    const dir = new THREE.DirectionalLight(0xffffff, 0.5)
    dir.position.set(10, 20, 10)
    scene.add(dir)

    // ── Helpers ─────────────────────────────────────────────────────────
    const GREEN = 0x25d366
    const FAINT = 0xc8d4e0
    const WHITE = 0xffffff

    function fillMat(opacity: number) {
      return new THREE.MeshStandardMaterial({
        color: WHITE, transparent: true, opacity, roughness: 1, metalness: 0,
      })
    }
    function edgeMat(color: number | string, opacity: number) {
      return new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    }

    function addPiece(
      parent: THREE.Group | THREE.Object3D,
      pos: [number, number, number],
      scale: [number, number, number],
      green: boolean,
      fillOp?: number
    ) {
      const geo  = new THREE.BoxGeometry(...scale)
      const edge = new THREE.EdgesGeometry(geo)
      const mesh  = new THREE.Mesh(geo, fillMat(fillOp ?? (green ? 0.05 : 0.28)))
      const lines = new THREE.LineSegments(edge, edgeMat(green ? GREEN : FAINT, green ? 0.85 : 0.30))
      const g = new THREE.Group()
      g.add(mesh)
      g.add(lines)
      g.position.set(...pos)
      parent.add(g)
      return g
    }

    // ── Grid ────────────────────────────────────────────────────────────
    const grid = new THREE.GridHelper(60, 60, 0xe2e8f0, 0xe2e8f0)
    grid.position.y = -0.14
    scene.add(grid)

    // ── Root group (orbits on drag) ─────────────────────────────────────
    const root = new THREE.Group()
    scene.add(root)

    // ── Floor builder ───────────────────────────────────────────────────
    function buildFloor(n: number) {
      const FH = 4.5
      const sy = n * FH - 0.1
      const wy = n * FH + 2.2
      const g  = new THREE.Group()

      // Slabs
      addPiece(g, [0,   sy, 0],  [20, 0.22, 14], false)
      addPiece(g, [-11, sy, 0],  [6,  0.22, 9],  false)
      addPiece(g, [11,  sy, 0],  [6,  0.22, 9],  false)

      // Outer walls
      addPiece(g, [0,    wy,  7], [20, 4.5, 0.22], false)
      addPiece(g, [0,    wy, -7], [20, 4.5, 0.22], false)
      addPiece(g, [-10,  wy,  0], [0.22, 4.5, 14], false)
      addPiece(g, [10,   wy,  0], [0.22, 4.5, 14], false)

      // Columns
      for (const p of ([[-10, wy, -7], [10, wy, -7], [-10, wy, 7], [10, wy, 7]] as [number, number, number][]))
        addPiece(g, p, [0.5, 4.5, 0.5], false)

      // Interior partition
      addPiece(g, [0, wy, 0], [0.18, 4.5, 10], false)

      // Windows (green, with cross bars)
      for (const p of ([[-5, wy + 0.3, 7.15], [2, wy + 0.3, 7.15], [8, wy + 0.3, 7.15]] as [number, number, number][])) {
        addPiece(g, p, [2.5,  2,    0.22], true)
        addPiece(g, p, [2.5 * 0.9, 0.1, 0.26], true)
        addPiece(g, p, [0.1, 2 * 0.85, 0.26], true)
      }
      for (const p of ([[10.15, wy + 0.3, -2], [10.15, wy + 0.3, 2]] as [number, number, number][])) {
        addPiece(g, p, [0.22, 2,    3],   true)
        addPiece(g, p, [0.26, 0.1,  3 * 0.9], true)
        addPiece(g, p, [0.26, 2 * 0.85, 0.1], true)
      }

      return g
    }

    // 3 complete floors
    for (let n = 0; n < 3; n++) root.add(buildFloor(n))

    // ── Missing 4th floor — broken / floating ───────────────────────────
    const missing = new THREE.Group()
    missing.position.set(0, 13.7, 0)
    missing.rotation.z = 0.08
    missing.rotation.x = 0.04

    // Partial slab pieces (with gap between them)
    addPiece(missing, [-4, 0,    0], [10, 0.22, 14], false, 0.18)
    addPiece(missing, [7,  0.3,  1], [5,  0.22,  8], false, 0.12)

    // Only two walls standing, slightly tilted
    const wLeft  = addPiece(missing, [-10, 2.2, 0],  [0.22, 4.5, 14], false, 0.15)
    wLeft.rotation.z = -0.05
    const wFront = addPiece(missing, [0,   2.2, 7],  [14, 4.5, 0.22], false, 0.12)
    wFront.rotation.x = 0.06

    // Exposed green rebar / columns (partially risen)
    const rebarHeights = [2.5, 1.8, 3.2]
    for (const [i, p] of ([[-9, 1, -6], [-9, 1, 6], [8, 1.5, -6]] as [number, number, number][]).entries())
      addPiece(missing, p, [0.4, rebarHeights[i], 0.4], true)

    // Floating slab fragment — like it fell mid-construction
    const frag = addPiece(missing, [3, 5.5, -2], [7, 0.22, 5], false, 0.10)
    frag.rotation.z = -0.14
    frag.rotation.x = 0.10

    // Pulsing green ring callout
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.08, 8, 24),
      new THREE.MeshBasicMaterial({ color: GREEN })
    )
    ring.position.set(2, 6.5, 0)
    ring.rotation.x = Math.PI / 2
    missing.add(ring)

    root.add(missing)

    // ── Blueprint annotation dots ────────────────────────────────────────
    const dotPositions: [number, number, number][] = [
      [-10, -0.1, 7], [10, -0.1, 7], [-10, -0.1, -7], [10, -0.1, -7],
      [-10, 4.4, 7], [10, 4.4, 7], [-10, 8.9, 7], [10, 8.9, 7],
    ]
    for (const p of dotPositions) {
      const dot = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.07, 8, 20),
        new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.55 })
      )
      dot.position.set(...p)
      dot.rotation.x = Math.PI / 2
      root.add(dot)
    }

    // ── Entrance canopy ──────────────────────────────────────────────────
    addPiece(root, [0,  4.2, 9.5], [8,    0.22, 3.5], false)
    addPiece(root, [-3, 2.0, 9.5], [0.22, 4.3,  0.22], false)
    addPiece(root, [3,  2.0, 9.5], [0.22, 4.3,  0.22], false)

    // ── Stair steps ─────────────────────────────────────────────────────
    for (let i = 0; i < 5; i++)
      addPiece(root, [-5.5, i * 0.9 + 0.45, -6 + i * 1.2], [1.8, 0.5, 1.8], false, 0.20)

    // ── Dashed floor level lines ─────────────────────────────────────────
    for (const y of [-0.1, 4.39, 8.89]) {
      const pts = [new THREE.Vector3(-12, y, -9), new THREE.Vector3(12, y, -9)]
      const lg  = new THREE.BufferGeometry().setFromPoints(pts)
      const lm  = new THREE.LineDashedMaterial({
        color: GREEN, dashSize: 0.5, gapSize: 0.35, transparent: true, opacity: 0.38,
      })
      const line = new THREE.Line(lg, lm)
      line.computeLineDistances()
      root.add(line)
    }

    // ── Drag to orbit ────────────────────────────────────────────────────
    let isDragging = false, prevX = 0, prevY = 0
    let rotY = 0.3, rotX = 0.15
    let targetY = rotY, targetX = rotX
    let autoRotate = true
    let idleTimer: any = null

    const resetIdle = () => {
      autoRotate = false
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => { autoRotate = true }, 2500)
    }

    const onDown = (e: any) => {
      isDragging = true
      prevX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
      prevY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
      resetIdle()
    }
    const onUp   = () => { isDragging = false }
    const onMove = (e: any) => {
      if (!isDragging) return
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0
      const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0
      targetY += (cx - prevX) * 0.008
      targetX += (cy - prevY) * 0.005
      targetX  = Math.max(-0.5, Math.min(0.7, targetX))
      prevX = cx; prevY = cy
    }
    const onWheel = (e: WheelEvent) => {
      camera.position.multiplyScalar(1 + e.deltaY * 0.001)
    }

    canvas.addEventListener("mousedown",  onDown)
    canvas.addEventListener("touchstart", onDown, { passive: true })
    window.addEventListener("mouseup",    onUp)
    window.addEventListener("touchend",   onUp)
    window.addEventListener("mousemove",  onMove)
    window.addEventListener("touchmove",  onMove, { passive: true })
    canvas.addEventListener("wheel",      onWheel, { passive: true })

    // ── Resize ───────────────────────────────────────────────────────────
    const onResize = () => {
      renderer.setSize(W(), H())
      camera.aspect = W() / H()
      camera.updateProjectionMatrix()
    }
    window.addEventListener("resize", onResize)

    // ── Render loop ──────────────────────────────────────────────────────
    let animId: number
    const t0 = performance.now()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = (performance.now() - t0) * 0.001

      if (autoRotate) targetY += 0.003
      rotY += (targetY - rotY) * 0.06
      rotX += (targetX - rotX) * 0.06
      root.rotation.y = rotY
      root.rotation.x = rotX

      // Float broken floor
      missing.position.y = 13.7 + Math.sin(t * 0.8) * 0.18
      missing.rotation.z = 0.08 + Math.sin(t * 0.5) * 0.015

      // Pulse ring
      ring.scale.setScalar(1 + Math.sin(t * 2.5) * 0.06)

      renderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(idleTimer)
      canvas.removeEventListener("mousedown",  onDown)
      canvas.removeEventListener("touchstart", onDown)
      window.removeEventListener("mouseup",    onUp)
      window.removeEventListener("touchend",   onUp)
      window.removeEventListener("mousemove",  onMove)
      window.removeEventListener("touchmove",  onMove)
      canvas.removeEventListener("wheel",      onWheel)
      window.removeEventListener("resize",     onResize)
      renderer.dispose()
    }
  }, [])
}

// ─── Page Component ────────────────────────────────────────────────────────
export default function NotFound() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useThreeScene(canvasRef, containerRef)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault()
        router.push("/youcantseeme")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 3D Canvas — fills entire screen */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor: "grab",
        }}
      />

      {/* Overlay content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "2rem 1.5rem",
          maxWidth: 480,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "monospace",
            color: "#25D366",
            padding: "5px 12px",
            borderRadius: 99,
            background: "rgba(37,211,102,0.10)",
            border: "0.5px solid rgba(37,211,102,0.30)",
          }}
        >
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#25D366", display:"inline-block" }}/>
          Blueprint not found
        </div>

        {/* 404 */}
        <div
          style={{
            fontSize: "clamp(72px, 14vw, 110px)",
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-4px",
            color: "#111827",
            fontFamily: "var(--font-sans, sans-serif)",
          }}
        >
          4<span style={{ color: "#25D366" }}>0</span>4
        </div>

        {/* Headings */}
        <div
          style={{
            background: "rgba(248,250,252,0.82)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 16,
            padding: "20px 28px",
            border: "0.5px solid rgba(0,0,0,0.07)",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 500, color: "#111827", marginBottom: 8 }}>
            This floor is missing
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.65, margin: 0 }}>
            The architectural blueprint you're looking for hasn't been
            constructed yet — or was demolished. Let us navigate you back.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "11px 24px",
              borderRadius: 99,
              background: "#25D366",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              border: "1.5px solid #25D366",
              transition: "opacity .15s",
            }}
          >
            <HomeIcon /> Back to home
          </Link>
          <Link
            href="/projects"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "11px 24px",
              borderRadius: 99,
              background: "transparent",
              color: "#25D366",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              border: "1.5px solid #25D366",
              transition: "opacity .15s",
            }}
          >
            <BuildingIcon /> View projects
          </Link>
        </div>

        {/* Hint */}
        <p style={{ fontSize: 11, color: "#9ca3af", letterSpacing: ".04em", margin: 0 }}>
          drag to orbit &nbsp;·&nbsp; scroll to zoom
        </p>
      </div>
    </div>
  )
}

// ─── Inline SVG icons (no external deps) ──────────────────────────────────
function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L1 6.5V13h4V9h4v4h4V6.5L7 1z" stroke="white" strokeWidth="1.2"/>
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="7" width="4" height="6" stroke="#25D366" strokeWidth="1.2"/>
      <rect x="6" y="4" width="6" height="9" stroke="#25D366" strokeWidth="1.2"/>
    </svg>
  )
}