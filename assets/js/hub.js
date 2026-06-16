/* ============================================================
   SITE MODEL — hub.js
   The crit review table. Raw Three.js lives ONLY here.
   Renders one massing model per project from projects.json,
   layered OVER the flat site-plan fallback. Click a model to
   "step into" that project's world.
   ============================================================ */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadProjects, initCommandPalette, initReveals, reducedMotion } from "./kernel.js";

const data = await loadProjects("");
const projects = data.projects;

initReveals();
const palette = initCommandPalette(projects, "");
// expose the palette to the "Index" button in the masthead
document.querySelector("[data-open-index]")?.addEventListener("click", () => palette.open());

/* ---- bail out gracefully if WebGL is unavailable ---- */
let renderer;
try {
  const test = document.createElement("canvas");
  if (!(test.getContext("webgl2") || test.getContext("webgl"))) throw new Error("no webgl");
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch (err) {
  console.info("[hub] WebGL unavailable — flat site-plan retained.", err);
  // flat fallback already in the DOM; nothing more to do.
}

if (renderer) buildScene(renderer);

function buildScene(renderer) {
  const canvas = document.getElementById("scene");
  const labelsLayer = document.querySelector(".hub__labels");

  const scene = new THREE.Scene();
  const fogColor = new THREE.Color("#0e0f13");
  scene.fog = new THREE.Fog(fogColor, 8, 22);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2.4, 8.2);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.appendChild(renderer.domElement);

  /* lighting — a single raking key + soft fill */
  scene.add(new THREE.HemisphereLight(0x9aa6c0, 0x0a0a0d, 0.5));
  const key = new THREE.DirectionalLight(0xfff2e0, 2.1);
  key.position.set(-6, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = key.shadow.camera.bottom = -12;
  key.shadow.camera.right = key.shadow.camera.top = 12;
  scene.add(key);

  /* the review table */
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.4, 7),
    new THREE.MeshStandardMaterial({ color: 0x2b2c31, roughness: 0.9, metalness: 0 })
  );
  table.position.y = -0.2;
  table.receiveShadow = true;
  scene.add(table);

  /* models, one per project */
  const models = projects.map((p) => {
    const group = buildMassing(p.silhouette?.kind, new THREE.Color(p.accent || "#d8743f"));
    group.position.set(p.x ?? 0, 0, 0);
    group.userData.project = p;
    group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(group);

    const label = document.createElement("div");
    label.className = "hub-label";
    label.innerHTML = `${p.title} <small>↵</small>`;
    labelsLayer.appendChild(label);
    group.userData.label = label;
    group.userData.baseY = 0;
    return group;
  });

  /* controls */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.6, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 4.5;
  controls.maxDistance = 13;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.enablePan = false;
  controls.autoRotate = !reducedMotion();
  controls.autoRotateSpeed = 0.55;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  document.body.classList.add("has-3d");

  /* establishing shot */
  if (!reducedMotion() && window.gsap) {
    camera.position.set(0, 5.5, 12);
    window.gsap.to(camera.position, { x: 0, y: 2.4, z: 8.2, duration: 4.2, ease: "power2.out" });
  }

  /* hover + click via raycaster */
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  let entering = false;

  function setPointer(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  function pick() {
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(models, true);
    if (!hits.length) return null;
    let g = hits[0].object;
    while (g.parent && !g.userData.project) g = g.parent;
    return g.userData.project ? g : null;
  }
  renderer.domElement.addEventListener("pointermove", (e) => {
    setPointer(e);
    const g = pick();
    if (g !== hovered) {
      if (hovered) liftModel(hovered, false);
      hovered = g;
      if (hovered) liftModel(hovered, true);
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
    }
  });
  renderer.domElement.addEventListener("pointerdown", (e) => {
    setPointer(e);
    const g = pick();
    if (g) enter(g.userData.project);
  });

  function liftModel(group, on) {
    const y = on ? 0.28 : 0;
    if (window.gsap && !reducedMotion()) window.gsap.to(group.position, { y, duration: 0.45, ease: "power2.out" });
    else group.position.y = y;
    group.userData.label?.classList.toggle("is-hover", on);
  }

  /* threshold transition → navigate into the world */
  const veil = document.querySelector(".veil");
  function enter(project) {
    if (entering) return;
    entering = true;
    const url = `projects/${project.slug}/index.html`;
    if (veil) veil.style.background = mixDark(project.accent);
    if (reducedMotion() || !window.gsap) { window.location.href = url; return; }
    controls.autoRotate = false;
    const target = models.find((m) => m.userData.project === project);
    const tl = window.gsap.timeline({ onComplete: () => (window.location.href = url) });
    tl.to(controls.target, { x: target.position.x, y: 0.6, z: 0, duration: 0.9, ease: "power2.inOut" }, 0);
    tl.to(camera.position, { x: target.position.x, y: 1.1, z: 3.2, duration: 0.9, ease: "power2.inOut" }, 0);
    tl.to(veil, { opacity: 1, duration: 0.55, ease: "power1.in", onStart: () => veil.classList.add("is-on") }, 0.45);
  }

  /* project a world point to screen px for the floating labels */
  const tmp = new THREE.Vector3();
  function updateLabels() {
    models.forEach((g) => {
      tmp.set(g.position.x, g.position.y + 1.7, g.position.z).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-tmp.y * 0.5 + 0.5) * window.innerHeight;
      const label = g.userData.label;
      const visible = tmp.z < 1;
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      label.classList.toggle("is-on", visible);
    });
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize);

  renderer.setAnimationLoop(() => {
    controls.update();
    updateLabels();
    renderer.render(scene, camera);
  });
}

/* ---- generated massing primitives (replaced later by real .glb) ---- */
function concrete(tint) {
  const c = new THREE.Color(0x6f7178).lerp(tint, 0.12);
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.78, metalness: 0.0 });
}
function buildMassing(kind, tint) {
  const g = new THREE.Group();
  const mat = concrete(tint);
  const accentMat = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.5 });

  if (kind === "rowhouse") {
    // tall, narrow infill block with a parapet cap and an entry notch
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.4), mat);
    body.position.y = 1.1; g.add(body);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 1.5), accentMat);
    cap.position.y = 2.26; g.add(cap);
    const entry = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.7, 0.2), new THREE.MeshStandardMaterial({ color: 0x111114 }));
    entry.position.set(0, 0.35, 0.72); g.add(entry);
  } else {
    // "library" — stepped horizontal civic massing with a clerestory
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.7, 1.9), mat);
    base.position.y = 0.35; g.add(base);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 1.3), mat);
    upper.position.y = 1.1; g.add(upper);
    const clerestory = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 0.9), accentMat);
    clerestory.position.y = 1.6; g.add(clerestory);
  }
  return g;
}

function mixDark(hex) {
  try {
    const c = new THREE.Color(hex).lerp(new THREE.Color(0x0a0a0d), 0.78);
    return `#${c.getHexString()}`;
  } catch { return "#0e0f13"; }
}
