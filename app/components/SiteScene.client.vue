<script setup lang="ts">
// Procedural fuel-station construction site. Client-only (.client.vue): WebGL never runs on the server.
import * as THREE from 'three'

const canvas = useTemplateRef<HTMLCanvasElement>('scene')
let stop = () => {}

onMounted(async () => {
  await nextTick() // .client components render their template only after mount
  if (!canvas.value) return
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  let renderer: THREE.WebGLRenderer
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas.value!, antialias: true, alpha: true }) }
  catch { canvas.value?.remove(); return }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x0a0a0a, 90, 190)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300)
  const VIS = 0xf5e400, INK = 0x6f757c
  scene.add(new THREE.HemisphereLight(0xdfe6ee, 0x1a1608, 1.6))
  const sun = new THREE.DirectionalLight(0xfff4d6, 1.8); sun.position.set(25, 40, 15); scene.add(sun)
  // Topographic survey terrain: contour lines only (transparent between them), flattened to a levelled pad
  // under the station, with a survey-laser ring sweeping out from the site.
  const terrainMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying float vH; varying vec2 vXZ;
      float terrain(vec2 p) {
        float h = 3.6 * sin(p.x * .045 + 1.3) * cos(p.y * .05)
                + 2.4 * sin((p.x + p.y) * .03 + .7)
                + 1.3 * sin(p.x * .11) * sin(p.y * .09)
                + .02 * length(p);                       // land rises away from the site
        // levelled pad (cut/fill) around the station footprint
        float pad = smoothstep(26., 40., abs(p.x)) + smoothstep(44., 60., abs(p.y));
        return h * clamp(pad, 0., 1.);
      }
      void main() {
        vec3 pos = position;
        vXZ = vec2(pos.x, -pos.y);
        vH = terrain(vXZ);
        pos.z = vH - .06;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
      }`,
    fragmentShader: `
      varying float vH; varying vec2 vXZ;
      uniform float uTime;
      // flat ground (the levelled pad) has no slope, so no contour: skip it instead of filling it
      float contour(float v) { float w = fwidth(v); if (w < 1e-4) return 0.; return 1. - smoothstep(0., w * 1.3, abs(fract(v + .37) - .5)); }
      void main() {
        float minor = contour(vH * 1.2);
        float major = contour(vH * .24);
        float d = length(vXZ);
        float fade = 1. - smoothstep(50., 130., d);
        float scan = smoothstep(6., 0., abs(d - mod(uTime * 18., 160.)));
        vec3 col = mix(vec3(.42, .46, .5), vec3(.96, .89, 0.), major * .75 + scan * .8);
        float a = (minor * .6 + major * .8 + scan * minor * .9) * fade;
        if (a < .01) discard;
        gl_FragColor = vec4(col, a);
      }`
  })
  const terrain = new THREE.Mesh(new THREE.PlaneGeometry(280, 280, 220, 220), terrainMat)
  terrain.rotation.x = -Math.PI / 2
  scene.add(terrain)

  const parts: THREE.Object3D[] = []
  const mat = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.15, ...extra })
  const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number) => (o.position.set(x, y, z), o)
  const box = (w: number, h: number, d: number, m: THREE.Material, edge = INK) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: edge })))
    return mesh
  }
  const lattice = (w: number, h: number, d: number, sx: number, sy: number, sz: number) =>
    new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.BoxGeometry(w, h, d, sx, sy, sz)), new THREE.LineBasicMaterial({ color: VIS }))
  // order = build sequence: 0 excavation/tanks/crane, 1 slab, 2 columns, 3 canopy+building, 4 dispensers
  const place = (o: THREE.Object3D, order: number, x: number, y: number, z: number) => { o.position.set(x, y, z); o.userData = { y, order }; scene.add(o); parts.push(o) }

  ;[[-6, 3.4], [-1, 2.4], [3, 2.4], [7, 2.4]].forEach(([z, r]) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r! / 2, r! / 2, 7, 20, 1), mat(0x3a3d40, { wireframe: true }))
    t.rotation.z = Math.PI / 2; place(t, 0, -12, -1.8, z! * 1.6)
  })
  place(box(34, 0.4, 50, mat(0x1c1d1f, { transparent: true, opacity: 0.72 })), 1, 0, 0.2, 0)
  ;[-14, -4.5, 4.5, 14].forEach(z => [-3.5, 3.5].forEach(x => place(box(0.6, 7, 0.6, mat(0xa4a9ae)), 2, x + 2, 3.5, z)))
  place(box(12, 1, 36, mat(0x3c4046), VIS), 3, 2, 7.5, 0)
  ;[-12, -4, 4, 12].forEach((z) => {
    const g = new THREE.Group()
    g.add(box(1.4, 0.3, 3.4, mat(0x6b7075)))
    g.add(at(box(0.7, 1.8, 1.2, mat(VIS, { emissive: VIS, emissiveIntensity: 0.25 })), 0, 1.05, 0))
    place(g, 4, 2, 0.4, z)
  })
  const bld = new THREE.Group()
  bld.add(at(box(22, 8, 6, mat(0x3a3e43)), 0, 4, 0))
  ;[2.2, 6].forEach(y => bld.add(at(new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 0.1), mat(0xfff1a0, { emissive: 0xffe066, emissiveIntensity: 0.9 })), 0, y, 3.05)))
  place(bld, 3, -2, 0, -32)
  const crane = new THREE.Group()
  crane.add(at(lattice(1.2, 30, 1.2, 1, 15, 1), 0, 15, 0))
  const jib = at(new THREE.Group(), 0, 30, 0); crane.add(jib)
  jib.add(at(lattice(30, 1.2, 1.2, 15, 1, 1), 9, 0, 0))
  jib.add(at(box(3, 1.6, 1.6, mat(0x3a3d40)), -7, -0.2, 0))
  jib.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(16, 0, 0), new THREE.Vector3(16, -14, 0)]), new THREE.LineBasicMaterial({ color: INK })))
  jib.add(at(box(1.6, 1, 1.6, mat(VIS)), 16, -14.5, 0))
  place(crane, 0, 20, 0, -18)

  let mx = 0, my = 0, scrollP = 0, cx = 0, cy = 0
  const onMove = (e: PointerEvent) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5 }
  const onScroll = () => { scrollP = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) }
  const onResize = () => {
    const w = innerWidth, h = innerHeight
    renderer.setSize(w, h, false); camera.aspect = w / h
    // Push the model right on wide screens so the hero text stays readable.
    w > 900 ? camera.setViewOffset(w, h, -w * 0.2, 0, w, h) : camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }
  addEventListener('pointermove', onMove)
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onResize)
  onResize(); onScroll()

  const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)
  const t0 = performance.now()
  renderer.setAnimationLoop(() => {
    const t = (performance.now() - t0) / 1000
    terrainMat.uniforms.uTime!.value = still ? 2 : t
    for (const o of parts) {
      const e = still ? 1 : ease((t - o.userData.order * 0.55) / 1.1)
      o.scale.y = Math.max(0.001, e); o.position.y = o.userData.y * e
    }
    if (!still) jib.rotation.y = Math.sin(t * 0.15) * 0.8
    cx += (mx - cx) * 0.05; cy += (my - cy) * 0.05
    const a = 0.7 + (still ? 0 : t * 0.03) + scrollP * Math.PI * 1.6 + cx * 0.5
    const r = 92 - scrollP * 24, h = 38 + cy * 8 - scrollP * 12
    camera.position.set(Math.sin(a) * r, h, Math.cos(a) * r)
    camera.lookAt(0, 9, -8)
    renderer.render(scene, camera)
  })

  stop = () => {
    renderer.setAnimationLoop(null)
    removeEventListener('pointermove', onMove); removeEventListener('scroll', onScroll); removeEventListener('resize', onResize)
    scene.traverse((o: any) => { o.geometry?.dispose(); o.material?.dispose() })
    renderer.dispose()
  }
})
onBeforeUnmount(() => stop())
</script>

<template>
  <canvas ref="scene" class="scene" aria-hidden="true" />
</template>

<style scoped>
.scene{position:fixed;inset:0;width:100%;height:100%;z-index:0;display:block}
</style>
