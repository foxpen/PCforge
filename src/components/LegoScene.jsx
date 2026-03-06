import { useEffect, useRef } from 'react'

/**
 * LegoScene — Three.js izometrická LEGO scéna pro PCForge EZ Mode
 * Pracovní stůl s komponentami, teplé amber osvětlení, kočka 🐱
 */
export default function LegoScene({ sel = {}, activeCat = null }) {
  const mountRef  = useRef(null)
  const sceneRef  = useRef(null)
  const selRef    = useRef(sel)

  // Průběžně aktualizuj ref (bez remount)
  useEffect(() => {
    selRef.current = sel
    sceneRef.current?.updateHighlights(sel, activeCat)
  }, [sel, activeCat])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let cleanup = null

    // Three.js načítáme přes CDN — pokud už je načteno, rovnou inicializuj
    const init = () => {
      cleanup = buildScene(container, selRef.current, activeCat, (api) => {
        sceneRef.current = api
      })
    }

    if (window.THREE) {
      init()
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      script.onload = init
      document.head.appendChild(script)
    }

    return () => {
      cleanup?.()
      sceneRef.current = null
    }
  }, []) // pouze mount

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: 'clamp(280px, 42vw, 500px)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        background: 'transparent',
      }}
    />
  )
}

// ─────────────────────────────────────────────
//  HLAVNÍ BUILDER SCÉNY
// ─────────────────────────────────────────────
function buildScene(container, initialSel, initialActiveCat, onReady) {
  const THREE = window.THREE
  const W = container.clientWidth
  const H = container.clientHeight

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  // ── Scene ──
  const scene = new THREE.Scene()

  // ── Izometrická kamera ──
  const d = 11
  const aspect = W / H
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100)
  camera.position.set(15, 15, 15)
  camera.lookAt(0, 0, 0)

  // ── Světla ──
  scene.add(new THREE.AmbientLight(0xfff5e0, 0.55))

  const sun = new THREE.DirectionalLight(0xffcc88, 1.1)
  sun.position.set(10, 14, 8)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 0.1
  sun.shadow.camera.far = 60
  ;[-15, 15, 15, -15].forEach((v, i) => {
    const c = sun.shadow.camera
    if (i === 0) c.left = v
    if (i === 1) c.right = v
    if (i === 2) c.top = v
    if (i === 3) c.bottom = v
  })
  scene.add(sun)

  const fill = new THREE.DirectionalLight(0xaaccff, 0.3)
  fill.position.set(-8, 6, -6)
  scene.add(fill)

  // Teplé světlo zboku (lampička)
  const lamp = new THREE.PointLight(0xff9944, 0.8, 18)
  lamp.position.set(-5, 6, -2)
  scene.add(lamp)

  // ── Materiál helper ──
  const mat = (color, rough = 0.7, metal = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })

  const mbox = (w, h, d, m) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  // LEGO brick — tělo + studs
  const legoBrick = (w, h, d, color, sx = 1, sz = 1) => {
    const g = new THREE.Group()
    const m = mat(color, 0.65)
    const body = mbox(w, h, d, m)
    g.add(body)
    for (let xi = 0; xi < sx; xi++) {
      for (let zi = 0; zi < sz; zi++) {
        const stub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.21, 0.21, 0.13, 12),
          mat(color, 0.6)
        )
        stub.castShadow = true
        stub.position.set(
          -w / 2 + (xi + 0.5) * (w / sx),
          h / 2 + 0.065,
          -d / 2 + (zi + 0.5) * (d / sz)
        )
        g.add(stub)
      }
    }
    return g
  }

  // ── STŮL ──
  const desk = new THREE.Group()
  scene.add(desk)

  // Deska
  const deskTop = mbox(18, 0.28, 12, mat(0x7a5230, 0.8))
  deskTop.position.y = -0.14
  deskTop.receiveShadow = true
  desk.add(deskTop)

  // Povrch — světlejší
  const deskSurf = mbox(17.7, 0.05, 11.7, mat(0x9b6b3f, 0.75))
  deskSurf.position.y = 0.025
  desk.add(deskSurf)

  // Nožičky
  ;[[-8.4, -5.4], [8.4, -5.4], [-8.4, 5.4], [8.4, 5.4]].forEach(([x, z]) => {
    const leg = mbox(0.45, 3.2, 0.45, mat(0x4a2f15, 0.9))
    leg.position.set(x * 0.95, -1.74, z * 0.95)
    desk.add(leg)
  })

  // Zásuvka
  const drw = mbox(4.2, 0.65, 0.22, mat(0x5a3a1a, 0.85))
  drw.position.set(5.5, -0.9, 5.88)
  desk.add(drw)
  const drwH = mbox(1.3, 0.12, 0.12, mat(0xb87333, 0.4, 0.7))
  drwH.position.set(5.5, -0.9, 6.08)
  desk.add(drwH)

  // ── KOMPONENTY NA STOLE ──
  const compGroups = {}

  // ── ZÁKLADNÍ DESKA ──
  const mb = new THREE.Group()
  mb.position.set(-4.5, 0.08, -1.5)
  const mbBase = legoBrick(4.2, 0.28, 3.6, 0x1a3a18, 4, 3)
  mb.add(mbBase)
  // CPU socket area
  const sock = legoBrick(0.85, 0.14, 0.85, 0x2a4a28, 1, 1)
  sock.position.set(0.4, 0.21, -0.3)
  mb.add(sock)
  // RAM sloty
  ;[-0.28, 0.28].forEach(x => {
    const rs = legoBrick(0.18, 0.38, 1.4, 0x111a11, 1, 1)
    rs.position.set(1.55 + x, 0.33, -0.3)
    mb.add(rs)
  })
  // PCIe
  const pcie = legoBrick(2.8, 0.13, 0.18, 0x111a11, 2, 1)
  pcie.position.set(-0.2, 0.205, 0.9)
  mb.add(pcie)
  // Konektory vzadu
  const io = legoBrick(0.3, 0.5, 1.8, 0x2a2a3c, 1, 2)
  io.position.set(-1.85, 0.39, -0.3)
  mb.add(io)
  compGroups.mb = mb
  scene.add(mb)

  // ── CPU ──
  const cpu = new THREE.Group()
  cpu.position.set(-2.2, 0.08, 2.8)
  const cpuBase = legoBrick(1.3, 0.18, 1.3, 0x888899, 1, 1)
  cpu.add(cpuBase)
  const cpuDie = mbox(0.75, 0.13, 0.75, mat(0x222230, 0.25, 0.85))
  cpuDie.position.y = 0.155
  cpu.add(cpuDie)
  // Piny (naznačené)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.1, 4),
      mat(0xaaaacc, 0.3, 0.9)
    )
    pin.position.set(-0.45 + i * 0.45, -0.14, -0.45 + j * 0.45)
    cpu.add(pin)
  }
  compGroups.cpu = cpu
  scene.add(cpu)

  // ── GPU ──
  const gpu = new THREE.Group()
  gpu.position.set(-4.5, 0.08, 2.0)
  const gpuPCB = legoBrick(3.8, 0.32, 1.3, 0x1e1e2a, 3, 1)
  gpu.add(gpuPCB)
  // Shroud — oranžový kryt
  const shroud = legoBrick(3.4, 0.55, 1.1, 0x2d2d3a, 3, 1)
  shroud.position.y = 0.435
  gpu.add(shroud)
  // Ventilátory
  ;[-1.1, 0, 1.1].forEach(x => {
    const fanRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.06, 8, 16),
      mat(0xf59e0b, 0.5)
    )
    fanRing.position.set(x, 0.75, 0)
    fanRing.rotation.x = Math.PI / 2
    gpu.add(fanRing)
    const fanHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.14, 8),
      mat(0x111118, 0.8)
    )
    fanHub.position.set(x, 0.75, 0)
    fanHub.rotation.x = Math.PI / 2
    gpu.add(fanHub)
    // Lopatky (6x)
    for (let b = 0; b < 6; b++) {
      const blade = mbox(0.28, 0.05, 0.07, mat(0x555566, 0.6))
      blade.position.set(
        x + Math.cos((b / 6) * Math.PI * 2) * 0.22,
        0.75,
        Math.sin((b / 6) * Math.PI * 2) * 0.22
      )
      blade.rotation.y = (b / 6) * Math.PI * 2
      gpu.add(blade)
    }
  })
  // PCIe konektor
  const pcieConn = legoBrick(0.35, 0.3, 1.0, 0xf59e0b, 1, 1)
  pcieConn.position.set(1.75, 0.05, 0)
  gpu.add(pcieConn)
  compGroups.gpu = gpu
  scene.add(gpu)

  // ── RAM ──
  const ram = new THREE.Group()
  ram.position.set(0.2, 0.08, 3.2)
  ;[-0.38, 0.38].forEach((x, i) => {
    const stick = legoBrick(0.26, 0.85, 2.0, i === 0 ? 0x22aa44 : 0x1a8833, 1, 2)
    stick.position.set(x, 0.425, 0)
    ram.add(stick)
    // Čipy na stick
    for (let c = 0; c < 4; c++) {
      const chip = mbox(0.15, 0.06, 0.25, mat(0x111111, 0.2, 0.8))
      chip.position.set(x + 0.16, 0.88, -0.7 + c * 0.45)
      ram.add(chip)
    }
  })
  compGroups.ram = ram
  scene.add(ram)

  // ── CPU COOLER ──
  const cool = new THREE.Group()
  cool.position.set(0.8, 0.08, 1.2)
  // Heatsink žebra
  for (let i = 0; i < 8; i++) {
    const fin = mbox(1.1, 1.5, 0.055, mat(0xaaaacc, 0.35, 0.65))
    fin.position.set(0, 0.75, -0.35 + i * 0.1)
    cool.add(fin)
  }
  // Heatpipes
  ;[-0.28, 0, 0.28].forEach(x => {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8),
      mat(0xb87333, 0.3, 0.8)
    )
    pipe.position.set(x, 0.75, 0)
    cool.add(pipe)
  })
  // Ventilátor
  const cfFrm = legoBrick(1.05, 0.14, 1.05, 0x333344, 1, 1)
  cfFrm.position.set(0, 0.75, 0.6)
  cool.add(cfFrm)
  const cfFan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.1, 10),
    mat(0xf59e0b, 0.5)
  )
  cfFan.position.set(0, 0.75, 0.72)
  cfFan.rotation.x = Math.PI / 2
  cool.add(cfFan)
  compGroups.cool = cool
  scene.add(cool)

  // ── PSU ──
  const psu = new THREE.Group()
  psu.position.set(3.0, 0.08, -2.5)
  const psuBody = legoBrick(2.5, 1.05, 1.8, 0x1a1a22, 2, 1)
  psu.add(psuBody)
  // Ventilátor
  const psuFan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.08, 12),
    mat(0x333344, 0.7)
  )
  psuFan.position.set(0, 0.565, 0)
  psuFan.rotation.x = Math.PI / 2
  psu.add(psuFan)
  // 80+ nálepka
  const sticker = mbox(0.7, 0.03, 0.35, mat(0xf5c842, 0.6))
  sticker.position.set(-0.7, 0.545, 0.5)
  psu.add(sticker)
  // Kabely
  ;[-0.55, 0, 0.55].forEach(x => {
    const cab = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 1.4, 6),
      mat(0x111118, 0.9)
    )
    cab.position.set(x, 0.52, -1.5)
    cab.rotation.x = Math.PI / 3.5
    psu.add(cab)
  })
  compGroups.psu = psu
  scene.add(psu)

  // ── SSD ──
  const ssd = new THREE.Group()
  ssd.position.set(1.8, 0.08, 3.0)
  const ssdBody = legoBrick(1.8, 0.13, 0.55, 0x222233, 1, 1)
  ssd.add(ssdBody)
  ;[0.4, 0.0, -0.4].forEach(x => {
    const chip = mbox(0.3, 0.07, 0.3, mat(0x111111, 0.2, 0.8))
    chip.position.set(x, 0.115, 0)
    ssd.add(chip)
  })
  compGroups.ssd = ssd
  scene.add(ssd)

  // ── PC SKŘÍŇ (na stole vpravo) ──
  const pcCase = new THREE.Group()
  pcCase.position.set(5.0, 0.08, -1.0)
  // Tělo
  const caseBody = legoBrick(3.0, 5.8, 2.4, 0x252530, 3, 2)
  caseBody.position.y = 2.9
  pcCase.add(caseBody)
  // Skleněná bočnice
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88aaff, transparent: true, opacity: 0.13,
    roughness: 0.0, metalness: 0.15,
  })
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.07, 5.6, 2.2), glassMat)
  glass.position.set(-1.55, 2.9, 0)
  pcCase.add(glass)
  // RGB pásky (svítící)
  ;[0xff2222, 0x2222ff, 0x22ff22, 0xff8800].forEach((c, i) => {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.09, 2.0),
      new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.2 })
    )
    strip.position.set(-1.48, 0.9 + i * 1.1, 0)
    pcCase.add(strip)
  })
  // Ventilátory vpředu
  ;[1.4, 3.4].forEach(y => {
    const ff = legoBrick(1.05, 0.1, 1.05, 0x1a1a24, 1, 1)
    ff.position.set(0, y, 1.28)
    pcCase.add(ff)
    const fbl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.06, 10),
      mat(0x555566, 0.7)
    )
    fbl.position.set(0, y, 1.36)
    fbl.rotation.x = Math.PI / 2
    pcCase.add(fbl)
  })
  // Power LED
  const pwrLed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10),
    new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 2.0 })
  )
  pwrLed.position.set(1.1, 5.7, 1.22)
  pwrLed.rotation.x = Math.PI / 2
  pcCase.add(pwrLed)
  compGroups.case = pcCase
  scene.add(pcCase)

  // ── NÁŘADÍ ──
  const tools = new THREE.Group()
  tools.position.set(0.5, 0.06, -3.8)
  // Šroubovák
  const scrH = mbox(0.26, 0.14, 1.9, mat(0xcc2222, 0.7))
  scrH.position.set(-1.2, 0.07, 0)
  tools.add(scrH)
  const scrB = mbox(0.08, 0.08, 0.9, mat(0xaaaacc, 0.25, 0.85))
  scrB.position.set(-1.2, 0.07, 1.4)
  tools.add(scrB)
  // Klíč
  const wrH = mbox(0.14, 0.09, 1.7, mat(0xaaaacc, 0.3, 0.8))
  wrH.position.set(0.6, 0.045, 0)
  wrH.rotation.z = 0.25
  tools.add(wrH)
  const wrEnd1 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 6, 12), mat(0xaaaacc, 0.3, 0.8))
  wrEnd1.position.set(0.8, 0.045, 0.9)
  wrEnd1.rotation.x = Math.PI / 2
  tools.add(wrEnd1)
  scene.add(tools)

  // ── KOČKA 🐱 ──
  const cat = new THREE.Group()
  cat.position.set(6.8, 0.06, 3.2)
  const catMat = mat(0xd4994a, 0.8)
  // Tělo
  const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.58, 14, 10), catMat)
  catBody.scale.set(1.0, 0.72, 1.15)
  cat.add(catBody)
  // Hlava
  const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 10), catMat)
  catHead.position.set(0, 0.47, 0.4)
  cat.add(catHead)
  // Uši
  ;[-0.19, 0.19].forEach(x => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 5), catMat)
    ear.position.set(x, 0.85, 0.4)
    cat.add(ear)
    const innerEar = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.14, 5),
      mat(0xf0a070, 0.9)
    )
    innerEar.position.set(x, 0.85, 0.4)
    cat.add(innerEar)
  })
  // Oči
  ;[-0.12, 0.12].forEach(x => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 6),
      mat(0x33bb66, 0.3)
    )
    eye.position.set(x, 0.5, 0.77)
    cat.add(eye)
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 6, 5),
      mat(0x050505, 0.1)
    )
    pupil.position.set(x, 0.5, 0.8)
    cat.add(pupil)
  })
  // Ocas
  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.04, 1.3, 8),
    catMat
  )
  tail.position.set(0.45, 0.3, -0.6)
  tail.rotation.z = -0.65
  tail.rotation.x = 0.35
  cat.add(tail)
  scene.add(cat)

  // ── PRICE TAG ──
  const tag = new THREE.Group()
  tag.position.set(6.6, 0.045, 1.4)
  const tagBase = mbox(2.4, 0.04, 1.0, mat(0xf5f0e8, 0.75))
  tag.add(tagBase)
  // Drátěný rámeček
  const tagFrame = new THREE.Mesh(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(2.42, 0.05, 1.02)),
    new THREE.LineBasicMaterial({ color: 0xb87333 })
  )
  tag.add(tagFrame)
  scene.add(tag)

  // ── HIGHLIGHT SYSTÉM ──
  // Každé compGroup dostane originální barvy uložené
  const origEmissive = {}
  Object.entries(compGroups).forEach(([key, group]) => {
    origEmissive[key] = []
    group.traverse(child => {
      if (child.isMesh && child.material) {
        origEmissive[key].push({ mesh: child, e: child.material.emissive?.clone?.() || new THREE.Color(0) })
      }
    })
  })

  const updateHighlights = (sel, activeCat) => {
    Object.entries(compGroups).forEach(([key, group]) => {
      const selected  = !!sel?.[key]
      const isActive  = activeCat === key
      const entries   = origEmissive[key] || []
      entries.forEach(({ mesh }) => {
        if (!mesh.material) return
        if (!mesh.material._pcforgeCloned) {
          mesh.material = mesh.material.clone()
          mesh.material._pcforgeCloned = true
        }
        if (isActive) {
          mesh.material.emissive = new THREE.Color(0xf59e0b)
          mesh.material.emissiveIntensity = 0.25
        } else if (selected) {
          mesh.material.emissive = new THREE.Color(0x88cc44)
          mesh.material.emissiveIntensity = 0.12
        } else {
          mesh.material.emissive = new THREE.Color(0x000000)
          mesh.material.emissiveIntensity = 0
        }
      })
    })
  }

  // První vykreslení
  updateHighlights(initialSel, initialActiveCat)

  // ── ANIMACE ──
  let frameId
  let t = 0
  let fanAngle = 0

  // Ref na ventilátor lopatky pro animaci
  const fanBlades = []
  scene.traverse(child => {
    if (
      child.isMesh &&
      child.geometry?.type === 'CylinderGeometry' &&
      child.material?.emissive?.r === 0 &&
      child.material?.color?.r < 0.5
    ) {
      // pravděpodobně ventilátor (tmavý disk)
    }
  })

  const animate = () => {
    frameId = requestAnimationFrame(animate)
    t += 0.004
    fanAngle += 0.03

    // Kočka — jemné dýchání
    cat.position.y = 0.06 + Math.sin(t * 1.1) * 0.018

    // Mírné kolísání lampy
    lamp.intensity = 0.8 + Math.sin(t * 0.7) * 0.06

    renderer.render(scene, camera)
  }
  animate()

  // ── RESIZE ──
  const onResize = () => {
    if (!container) return
    const W = container.clientWidth
    const H = container.clientHeight
    const asp = W / H
    camera.left   = -d * asp
    camera.right  =  d * asp
    camera.updateProjectionMatrix()
    renderer.setSize(W, H)
  }
  window.addEventListener('resize', onResize)

  // ── API ──
  onReady({ updateHighlights })

  // ── CLEANUP ──
  return () => {
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
  }
}
