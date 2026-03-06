import { useEffect, useRef } from 'react'

/**
 * LegoScene — Three.js LEGO scéna s animovanou montáží
 * Komponenty letí ze stolu do skříně při výběru, a zpět při odebrání
 */
export default function LegoScene({ sel = {}, activeCat = null }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const prevSelRef = useRef({})

  useEffect(() => {
    const prev = prevSelRef.current
    const api  = sceneRef.current

    if (api) {
      const allKeys = new Set([...Object.keys(prev), ...Object.keys(sel)])
      allKeys.forEach(key => {
        const wasOn = !!prev[key]
        const isOn  = !!sel[key]
        if (!wasOn && isOn)  api.mountComponent(key)
        if (wasOn  && !isOn) api.unmountComponent(key)
      })
      api.setActive(activeCat)
    }

    prevSelRef.current = { ...sel }
  }, [sel, activeCat])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return
    let cleanup = null

    const init = () => {
      cleanup = buildScene(container, sel, activeCat, api => {
        sceneRef.current = api
        Object.keys(sel).forEach(k => { if (sel[k]) api.mountComponent(k, true) })
        if (activeCat) api.setActive(activeCat)
      })
    }

    if (window.THREE) { init() }
    else {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      s.onload = init
      document.head.appendChild(s)
    }

    return () => { cleanup?.(); sceneRef.current = null }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: 'clamp(300px, 44vw, 520px)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────
function buildScene(container, _initialSel, initialActiveCat, onReady) {
  const THREE = window.THREE
  const W = container.clientWidth
  const H = container.clientHeight

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const d = 11, asp = W / H
  const camera = new THREE.OrthographicCamera(-d*asp, d*asp, d, -d, 0.1, 100)
  camera.position.set(15, 15, 15)
  camera.lookAt(0, 0, 0)

  // Světla
  scene.add(new THREE.AmbientLight(0xfff5e0, 0.55))
  const sun = new THREE.DirectionalLight(0xffcc88, 1.1)
  sun.position.set(10, 14, 8); sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = sun.shadow.camera.bottom = -15
  sun.shadow.camera.right = sun.shadow.camera.top = 15
  scene.add(sun)
  scene.add(Object.assign(new THREE.DirectionalLight(0xaaccff, 0.3), { position: new THREE.Vector3(-8,6,-6) }))
  const lamp = new THREE.PointLight(0xff9944, 0.8, 20)
  lamp.position.set(-5, 7, -2); scene.add(lamp)

  const mat  = (c, r=0.7, m=0) => new THREE.MeshStandardMaterial({ color:c, roughness:r, metalness:m })
  const mbox = (w, h, d, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material)
    mesh.castShadow = true; mesh.receiveShadow = true; return mesh
  }
  const legoBrick = (w, h, d, color, sx=1, sz=1) => {
    const g = new THREE.Group()
    g.add(mbox(w,h,d, mat(color,0.65)))
    for (let xi=0;xi<sx;xi++) for (let zi=0;zi<sz;zi++) {
      const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.21,0.13,10), mat(color,0.6))
      stub.castShadow = true
      stub.position.set(-w/2+(xi+.5)*(w/sx), h/2+.065, -d/2+(zi+.5)*(d/sz))
      g.add(stub)
    }
    return g
  }

  // ── STŮL ──
  const desk = new THREE.Group(); scene.add(desk)
  const deskTop = mbox(18,0.28,12, mat(0x7a5230,0.8))
  deskTop.position.y=-0.14; deskTop.receiveShadow=true; desk.add(deskTop)
  const deskSurf = mbox(17.7,0.05,11.7, mat(0x9b6b3f,0.75))
  deskSurf.position.y=0.025; desk.add(deskSurf)
  ;[[-8.4,-5.4],[8.4,-5.4],[-8.4,5.4],[8.4,5.4]].forEach(([x,z]) => {
    const leg = mbox(0.45,3.2,0.45, mat(0x4a2f15,0.9)); leg.position.set(x*.95,-1.74,z*.95); desk.add(leg)
  })
  const drw = mbox(4.2,0.65,0.22, mat(0x5a3a1a,0.85)); drw.position.set(5.5,-0.9,5.88); desk.add(drw)
  const drwH = mbox(1.3,0.12,0.12, mat(0xb87333,0.4,0.7)); drwH.position.set(5.5,-0.9,6.08); desk.add(drwH)

  // ── PC SKŘÍŇ ──
  const CASE_POS = new THREE.Vector3(5.2, 0.08, -1.0)
  const pcCase = new THREE.Group()
  pcCase.position.copy(CASE_POS); scene.add(pcCase)

  legoBrick(3.0,5.8,2.4,0x252530,3,2).position.set(0,2.9,0) && pcCase.add(
    Object.assign(legoBrick(3.0,5.8,2.4,0x252530,3,2), { position: new THREE.Vector3(0,2.9,0) })
  )
  // Oprav — přidej shell správně
  const caseShell = legoBrick(3.0,5.8,2.4,0x252530,3,2)
  caseShell.position.set(0,2.9,0); pcCase.add(caseShell)

  const glassMat = new THREE.MeshStandardMaterial({ color:0x88aaff, transparent:true, opacity:0.13, roughness:0.0, metalness:0.15 })
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.07,5.6,2.2), glassMat)
  glass.position.set(-1.55,2.9,0); pcCase.add(glass)

  ;[1.4,3.4].forEach(y => {
    const ff = legoBrick(1.0,0.1,1.0,0x1a1a24,1,1); ff.position.set(0,y,1.28); pcCase.add(ff)
  })

  const pwrLed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1,0.1,0.06,10),
    new THREE.MeshStandardMaterial({ color:0x00ff88, emissive:0x00ff88, emissiveIntensity:0.5 })
  )
  pwrLed.position.set(1.1,5.7,1.22); pwrLed.rotation.x=Math.PI/2; pcCase.add(pwrLed)

  const rgbStrips = []
  ;[0xff2222,0x2222ff,0x22ff22,0xff8800].forEach((c,i) => {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.04,0.09,2.0),
      new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:0 })
    )
    strip.position.set(-1.48,0.9+i*1.1,0); pcCase.add(strip); rgbStrips.push(strip)
  })

  // ── CÍLE UVNITŘ SKŘÍNĚ (relativní k CASE_POS, v absolutních Y) ──
  const TARGETS = {
    mb:   { x:0,   y:1.8,  z:0     },
    cpu:  { x:0.1, y:2.55, z:0.1   },
    cool: { x:0.1, y:3.3,  z:0.1   },
    gpu:  { x:0,   y:1.8,  z:0,    ry: Math.PI/2 },
    ram:  { x:0.5, y:2.55, z:0.05  },
    ssd:  { x:0.2, y:1.4,  z:0.2   },
    psu:  { x:0,   y:0.55, z:0     },
  }

  // ── STARTOVNÍ POZICE NA STOLE ──
  const DESK_POS = {
    mb:   [-4.5, 0.15, -1.5],
    cpu:  [-2.2, 0.15,  2.8],
    gpu:  [-4.5, 0.15,  2.0],
    ram:  [ 0.2, 0.15,  3.2],
    cool: [ 0.8, 0.15,  1.2],
    psu:  [ 3.0, 0.15, -2.5],
    ssd:  [ 1.8, 0.15,  3.0],
  }

  // ── BUILDEŘI KOMPONENT ──
  const MAKE = {
    mb: () => {
      const g = new THREE.Group()
      g.add(legoBrick(3.5,0.24,3.0,0x1a3a18,4,3))
      const sock = legoBrick(0.8,0.13,0.8,0x2a4a28,1,1); sock.position.set(0.4,0.185,-0.3); g.add(sock)
      ;[-0.27,0.27].forEach(x=>{ const rs=legoBrick(0.17,0.34,1.2,0x111a11,1,1); rs.position.set(1.5+x,0.29,-0.3); g.add(rs) })
      const p=legoBrick(2.4,0.11,0.17,0x111a11,2,1); p.position.set(-0.2,0.175,0.85); g.add(p)
      return g
    },
    cpu: () => {
      const g = new THREE.Group()
      g.add(legoBrick(1.2,0.17,1.2,0x888899,1,1))
      const die=mbox(0.7,0.11,0.7,mat(0x222230,0.25,0.85)); die.position.y=0.14; g.add(die)
      return g
    },
    gpu: () => {
      const g = new THREE.Group()
      g.add(legoBrick(3.3,0.28,1.1,0x1e1e2a,3,1))
      const sh=legoBrick(2.9,0.5,0.95,0x2d2d3a,3,1); sh.position.y=0.39; g.add(sh)
      ;[-0.85,0.85].forEach(x=>{
        const fr=new THREE.Mesh(new THREE.TorusGeometry(0.31,0.05,8,14),mat(0xf59e0b,0.5))
        fr.position.set(x,0.68,0); fr.rotation.x=Math.PI/2; g.add(fr)
        const hu=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.11,8),mat(0x111118,0.8))
        hu.position.set(x,0.68,0); hu.rotation.x=Math.PI/2; g.add(hu)
      })
      return g
    },
    ram: () => {
      const g = new THREE.Group()
      ;[-0.33,0.33].forEach((x,i)=>{
        const s=legoBrick(0.24,0.75,1.8,i?0x1a8833:0x22aa44,1,2); s.position.set(x,0.375,0); g.add(s)
      })
      return g
    },
    cool: () => {
      const g = new THREE.Group()
      for(let i=0;i<7;i++){
        const f=mbox(0.95,1.3,0.05,mat(0xaaaacc,0.35,0.65)); f.position.set(0,0.65,-0.28+i*0.095); g.add(f)
      }
      const cf=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,0.08,10),mat(0xf59e0b,0.5))
      cf.position.set(0,0.65,0.52); cf.rotation.x=Math.PI/2; g.add(cf)
      return g
    },
    psu: () => {
      const g = new THREE.Group()
      g.add(legoBrick(2.2,0.95,1.6,0x1a1a22,2,1))
      const f=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.06,12),mat(0x333344,0.7))
      f.position.set(0,0.505,0); f.rotation.x=Math.PI/2; g.add(f)
      ;[-0.5,0,0.5].forEach(x=>{
        const c=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.2,6),mat(0x111118,0.9))
        c.position.set(x,0.475,-1.4); c.rotation.x=Math.PI/3.5; g.add(c)
      })
      return g
    },
    ssd: () => {
      const g = new THREE.Group()
      g.add(legoBrick(1.6,0.12,0.5,0x222233,1,1))
      ;[0.38,0,-0.38].forEach(x=>{ const c=mbox(0.27,0.065,0.26,mat(0x111111,0.2,0.8)); c.position.set(x,0.105,0); g.add(c) })
      return g
    },
  }

  // ── STAV ──
  const compState  = {}  // 'desk' | 'flying_in' | 'inside' | 'flying_out'
  const compGroups = {}
  const animations = {}

  Object.keys(DESK_POS).forEach(key => {
    const g = MAKE[key](); const [x,y,z] = DESK_POS[key]
    g.position.set(x,y,z); scene.add(g)
    compGroups[key] = g; compState[key] = 'desk'
  })

  // Nářadí
  const tools = new THREE.Group(); tools.position.set(0.5,0.06,-3.8); scene.add(tools)
  const sh=mbox(0.26,0.14,1.9,mat(0xcc2222,0.7)); sh.position.set(-1.2,0.07,0); tools.add(sh)
  const sb=mbox(0.08,0.08,0.9,mat(0xaaaacc,0.25,0.85)); sb.position.set(-1.2,0.07,1.4); tools.add(sb)
  const wr=mbox(0.14,0.09,1.7,mat(0xaaaacc,0.3,0.8)); wr.position.set(0.6,0.045,0); wr.rotation.z=0.25; tools.add(wr)

  // Kočka
  const cat=new THREE.Group(); cat.position.set(6.8,0.06,3.2); scene.add(cat)
  const catM=mat(0xd4994a,0.8)
  const cb=new THREE.Mesh(new THREE.SphereGeometry(0.58,14,10),catM); cb.scale.set(1,.72,1.15); cat.add(cb)
  const ch=new THREE.Mesh(new THREE.SphereGeometry(0.4,14,10),catM); ch.position.set(0,.47,.4); cat.add(ch)
  ;[-0.19,0.19].forEach(x=>{const e=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.22,5),catM); e.position.set(x,.85,.4); cat.add(e)})
  ;[-0.12,0.12].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(0.055,8,6),mat(0x33bb66,0.3)); e.position.set(x,.5,.77); cat.add(e)})
  const ctail=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.04,1.3,8),catM)
  ctail.position.set(.45,.3,-.6); ctail.rotation.z=-.65; ctail.rotation.x=.35; cat.add(ctail)

  // ── HIGHLIGHT ──
  const setActive = (key) => {
    Object.values(compGroups).forEach(grp => {
      grp.traverse(c => {
        if (c.isMesh) {
          if (!c.material._pcf) { c.material=c.material.clone(); c.material._pcf=true }
          c.material.emissive.set(0x000000); c.material.emissiveIntensity=0
        }
      })
    })
    if (!key || !compGroups[key]) return
    compGroups[key].traverse(c => {
      if (c.isMesh) {
        if (!c.material._pcf) { c.material=c.material.clone(); c.material._pcf=true }
        c.material.emissive.set(0xf59e0b); c.material.emissiveIntensity=0.3
      }
    })
  }

  const easeInOut = t => t<.5 ? 2*t*t : -1+(4-2*t)*t

  const getTargetWorldPos = key => {
    const T = TARGETS[key]
    if (!T) return CASE_POS.clone()
    return new THREE.Vector3(CASE_POS.x + T.x, T.y, CASE_POS.z + T.z)
  }

  const updateRgb = () => {
    const n = Object.values(compState).filter(s=>s==='inside').length
    rgbStrips.forEach(s=>{ s.material.emissiveIntensity = n>0 ? Math.min(n/3,1)*1.0 : 0 })
    pwrLed.material.emissiveIntensity = n>0 ? 2.0 : 0.4
  }

  const mountComponent = (key, instant=false) => {
    const g = compGroups[key]; if (!g) return
    if (compState[key]==='inside') return
    compState[key]='flying_in'
    const fromP=g.position.clone(), toP=getTargetWorldPos(key)
    const fromR=g.rotation.clone(), toRY=TARGETS[key]?.ry||0
    if (instant) {
      g.position.copy(toP); g.rotation.set(0,toRY,0)
      compState[key]='inside'; updateRgb(); return
    }
    animations[key]={ t:0, dur:0.75, fromP, toP, fromR, toRY,
      onDone:()=>{ compState[key]='inside'; updateRgb() } }
  }

  const unmountComponent = key => {
    const g=compGroups[key]; if(!g) return
    if(compState[key]==='desk') return
    compState[key]='flying_out'
    const fromP=g.position.clone()
    const [dx,dy,dz]=DESK_POS[key], toP=new THREE.Vector3(dx,dy,dz)
    const fromR=g.rotation.clone()
    animations[key]={ t:0, dur:0.65, fromP, toP, fromR, toRY:0,
      onDone:()=>{ compState[key]='desk'; updateRgb() } }
  }

  let frameId, tGlobal=0

  const animate = () => {
    frameId=requestAnimationFrame(animate)
    tGlobal+=0.004

    const dt=0.016
    Object.entries(animations).forEach(([key,anim])=>{
      if(!anim) return
      anim.t+=dt/anim.dur
      const p=Math.min(anim.t,1), e=easeInOut(p)
      const g=compGroups[key]
      if(g){
        // Parabolická dráha — výška oblouku závisí na vzdálenosti
        const arch=Math.sin(p*Math.PI)*4.0
        g.position.lerpVectors(anim.fromP, anim.toP, e)
        g.position.y+=arch
        // Lehká rotace během letu (barrel roll efekt)
        g.rotation.x=anim.fromR.x*(1-e)
        g.rotation.y=anim.fromR.y+(anim.toRY-anim.fromR.y)*e + Math.sin(p*Math.PI)*0.8
        g.rotation.z=anim.fromR.z*(1-e)
      }
      if(p>=1){
        anim.onDone?.(); delete animations[key]
        if(g){
          if(compState[key]==='inside'){
            g.position.copy(getTargetWorldPos(key))
            g.rotation.set(0,TARGETS[key]?.ry||0,0)
          } else {
            const [dx,dy,dz]=DESK_POS[key]; g.position.set(dx,dy,dz); g.rotation.set(0,0,0)
          }
        }
      }
    })

    // Kočka — dýchání
    cat.position.y=0.06+Math.sin(tGlobal*1.1)*0.018

    // Lamp flicker
    lamp.intensity=0.8+Math.sin(tGlobal*0.7)*0.06

    // RGB pulzování
    const n=Object.values(compState).filter(s=>s==='inside').length
    if(n>0){
      rgbStrips.forEach((s,i)=>{
        s.material.emissiveIntensity=Math.min(n/3,1)*(0.7+Math.sin(tGlobal*2+i*1.2)*0.35)
      })
    }

    renderer.render(scene,camera)
  }
  animate()

  const onResize=()=>{
    if(!container) return
    const W=container.clientWidth,H=container.clientHeight,a=W/H
    camera.left=-d*a; camera.right=d*a; camera.updateProjectionMatrix()
    renderer.setSize(W,H)
  }
  window.addEventListener('resize',onResize)

  onReady({ mountComponent, unmountComponent, setActive })

  return ()=>{
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize',onResize)
    renderer.dispose()
    if(container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
  }
}
