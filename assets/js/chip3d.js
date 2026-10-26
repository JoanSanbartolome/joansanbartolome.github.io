/**
 * chip3d.js · Fondo 3D del hero
 *
 * Encapsulado QFP estilizado (estética wireframe/neón ámbar) sobre un plano de PCB sutil,
 * con pistas que salen de los pines en abanico a 45° y pulsos de luz que las recorren.
 *
 * Solo se activa en escritorio (≥ 960 px), sin prefers-reduced-motion y con WebGL.
 * Three.js se importa bajo demanda desde CDN con versión fija; si falla, el hero queda tal cual.
 * El bucle se pausa con el hero fuera de pantalla o la pestaña oculta, y todo se libera
 * (renderer, geometrías, materiales) al bajar de 960 px; se vuelve a crear si la ventana crece.
 * Si la escena falla una vez, no se reintenta en cada cruce del punto de corte.
 *
 * Contenedor: <div class="hero__bg3d" id="chip3d" aria-hidden="true"></div>
 * (posición, opacidad global y ocultación en móvil: assets/css/sections/hero.css;
 *  estilos del <canvas>, máscara y aparición: assets/css/sections/chip3d.css).
 */

// Sincronizar con la CSP de .htaccess (script-src)
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const DESKTOP_QUERY = '(width >= 960px)'; // = hero.css / base.css

const CONFIG = {
  // Colores: [variable CSS de base.css, respaldo si no se puede leer]
  colors: {
    base: ['--bg-base', '#08070a'],
    accent: ['--accent', '#f59e0b'],
    bright: ['--accent-bright', '#fbbf24'],
    deep: ['--accent-deep', '#c2410c'],
  },
  seed: 1907, // semilla fija: el trazado de pistas es siempre el mismo
  maxPixelRatio: 2,
  maxDelta: 0.05, // s; evita saltos al volver de una pausa

  // Encuadre: punto del contenedor (fracción) donde queda el centro del chip
  // (la máscara que funde el lienzo hacia la derecha está en chip3d.css)
  anchor: { x: 0.32, y: 0.5 },
  camera: { fov: 34, position: [0, 15.5, 14.5] },

  chip: {
    size: 4, // lado del cuerpo
    height: 0.42,
    standoff: 0.06, // separación cuerpo-placa
    pinsPerSide: 16,
    pinSpan: 0.82, // fracción del lado ocupada por pines
    dieInset: 0.8,
    dieCells: 6, // rejilla de bloques lógicos (guiño a FPGA)
  },
  pins: { width: 0.085, thickness: 0.035, shoulder: 0.1, drop: 0.12, foot: 0.2 },

  traces: {
    density: 0.8, // probabilidad de que un pin tenga pista
    escape: 0.5, // tramo recto antes del giro a 45°
    fanout: 0.4, // apertura del abanico (se limita para que no se crucen en las esquinas)
    minLength: 1, // tramo recto final
    maxLength: 4.6,
    viaRadius: 0.075,
    fadeStart: 2.8, // radio desde el que las pistas se funden con el fondo
    fadeEnd: 8.6,
    y: 0.004,
  },

  pulses: {
    count: 12,
    speed: [1.8, 3.2], // unidades/s
    delay: [0.3, 2.6], // espera entre recorridos (s)
    tailLength: 1.1,
    tailSegments: 8,
    size: 0.55,
    outwardRatio: 0.6, // parte de los pulsos que salen del chip (el resto entra)
  },

  // Intensidades relativas (la opacidad global la fija el CSS del hero)
  intensity: {
    edges: 0.95,
    edgeGlow: 0.28,
    top: 0.55,
    traces: 0.6,
    silk: 0.5,
    halo: 0.32,
    board: 0.07,
  },

  motion: {
    spinSpeed: 0.05, // rad/s alrededor del eje vertical
    tilt: 0.07, // inclinación lateral fija (rad)
    wobble: 0.03, // balanceo suave (rad)
    parallax: 0.1, // inclinación máxima por el ratón (rad)
    cameraShift: 0.9, // desplazamiento de cámara por el ratón
    smoothing: 2.5, // respuesta del parallax (1/s)
    breathe: 1.1, // pulso de brillo de la cara superior (rad/s)
  },
};

let THREE = null; // módulo de Three.js (se reutiliza entre reinicios)
let loadFailed = false;
let sceneFailed = false; // la escena falló una vez: no se reintenta
let webglSupport = null; // resultado memorizado de hasWebGL()
let app = null; // escena activa o null
let generation = 0; // invalida arranques asíncronos que ya no proceden

/* ---------- Comprobaciones previas ---------- */
function prefersReducedMotion() {
  return Boolean(window.site?.reducedMotion) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Crea un contexto de prueba (y lo libera) solo la primera vez que se pide
function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    webglSupport = Boolean(gl);
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

async function loadThree() {
  if (THREE || loadFailed) return THREE;
  try {
    THREE = await import(THREE_URL);
  } catch {
    loadFailed = true;
    console.info('[chip3d] Three.js no disponible; se omite el fondo 3D.');
  }
  return THREE;
}

/* ---------- Utilidades ---------- */
function createRandom(seed) {
  // mulberry32: pseudoaleatorio pequeño y reproducible
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rand, [min, max]) => min + rand() * (max - min);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Brillo según la distancia al centro: las pistas se funden con el fondo
function fadeAt(point) {
  const { fadeStart, fadeEnd } = CONFIG.traces;
  return 1 - smoothstep(fadeStart, fadeEnd, Math.hypot(point.x, point.z));
}

// Colores de las variables CSS en cualquier formato que entienda Three (hex, rgb(), hsl(), nombre);
// si la variable falta o no se reconoce, setStyle deja el color de respaldo
function readColors() {
  const styles = getComputedStyle(document.documentElement);
  const colors = {};
  Object.entries(CONFIG.colors).forEach(([name, [cssVar, fallback]]) => {
    const color = new THREE.Color(fallback);
    const value = styles.getPropertyValue(cssVar).trim();
    if (value) color.setStyle(value);
    colors[name] = color;
  });
  return colors;
}

// De coordenadas de un lado del chip (u: hacia fuera, v: a lo largo del lado) al plano XZ
function sideToWorld(side, u, v, y) {
  const angle = (side * Math.PI) / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return new THREE.Vector3(u * cos + v * sin, y, -u * sin + v * cos);
}

function pinOffsets() {
  const { size, pinSpan, pinsPerSide } = CONFIG.chip;
  const span = size * pinSpan;
  return Array.from({ length: pinsPerSide }, (_, i) => -span / 2 + (i * span) / (pinsPerSide - 1));
}

// Distancia del centro al extremo exterior del pie del pin
function footReach() {
  const { shoulder, drop, foot } = CONFIG.pins;
  return CONFIG.chip.size / 2 + shoulder + drop + foot;
}

// Acumula segmentos de línea con color por vértice para un único LineSegments
function createLineBuilder() {
  const positions = [];
  const colors = [];
  return {
    segment(a, b, colorA, colorB = colorA) {
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      colors.push(colorA.r, colorA.g, colorA.b, colorB.r, colorB.g, colorB.b);
    },
    build() {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      return geometry;
    },
  };
}

function addSquare(builder, center, half, color) {
  const corners = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ].map(([dx, dz]) => new THREE.Vector3(center.x + dx, center.y, center.z + dz));
  corners.forEach((corner, i) => builder.segment(corner, corners[(i + 1) % 4], color));
}

function addCircle(builder, center, radius, segments, colorAt) {
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    const p0 = new THREE.Vector3(center.x + Math.cos(a0) * radius, center.y, center.z + Math.sin(a0) * radius);
    const p1 = new THREE.Vector3(center.x + Math.cos(a1) * radius, center.y, center.z + Math.sin(a1) * radius);
    builder.segment(p0, p1, colorAt(p0), colorAt(p1));
  }
}

function additiveLineMaterial(opacity, extra = {}) {
  return new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    ...extra,
  });
}

// Textura de brillo radial (blanca, se tiñe con el color del material)
function createGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/* ---------- Trazado de pistas ---------- */
function createPath(points) {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + points[i].distanceTo(points[i - 1]));
  return { points, lengths, length: lengths[lengths.length - 1] };
}

function pointOnPath(path, distance, target) {
  const { points, lengths } = path;
  let i = 1;
  while (i < lengths.length - 1 && lengths[i] < distance) i++;
  const span = lengths[i] - lengths[i - 1] || 1;
  return target.lerpVectors(points[i - 1], points[i], clamp((distance - lengths[i - 1]) / span, 0, 1));
}

/*
 * Cada pista: tramo recto, giro a 45° que abre el abanico y tramo recto final de longitud variable.
 * Con el abanico limitado, la anchura de cada grupo no supera la distancia a la que empiezan
 * las pistas, así que los grupos de lados contiguos nunca se cruzan en las esquinas.
 */
function buildTracePaths(rand) {
  const { density, escape, fanout, minLength, maxLength, y } = CONFIG.traces;
  const start = footReach();
  const offsets = pinOffsets();
  const halfSpan = offsets[offsets.length - 1];
  const spread = Math.min(fanout, start / halfSpan - 1.05);
  const paths = [];

  for (let side = 0; side < 4; side++) {
    offsets.forEach((v) => {
      if (rand() > density) return;
      const u1 = start + escape;
      const u2 = u1 + spread * Math.abs(v);
      const u3 = u2 + between(rand, [minLength, maxLength]);
      const local = [
        [start, v],
        [u1, v],
        [u2, v * (1 + spread)],
        [u3, v * (1 + spread)],
      ];
      const points = local
        .map(([u, w]) => sideToWorld(side, u, w, y))
        .filter((point, i, all) => i === 0 || point.distanceTo(all[i - 1]) > 1e-4);
      paths.push(createPath(points));
    });
  }
  return paths;
}

/* ---------- Piezas de la escena ---------- */
function buildBoard(colors, glowTexture) {
  const group = new THREE.Group();
  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.rotateX(-Math.PI / 2);

  // Plano de placa muy tenue y halo cálido bajo el chip
  const layers = [
    { color: colors.deep, opacity: CONFIG.intensity.board, scale: 22, y: -0.02 },
    { color: colors.accent, opacity: CONFIG.intensity.halo, scale: 10, y: -0.01 },
  ];
  layers.forEach(({ color, opacity, scale, y }) => {
    const material = new THREE.MeshBasicMaterial({
      color,
      map: glowTexture,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(scale);
    mesh.position.y = y;
    group.add(mesh);
  });
  return group;
}

function buildTraces(paths, colors) {
  const builder = createLineBuilder();
  const { viaRadius, y } = CONFIG.traces;
  const tint = (point) => colors.accent.clone().multiplyScalar(fadeAt(point));

  paths.forEach(({ points }) => {
    for (let i = 1; i < points.length; i++) builder.segment(points[i - 1], points[i], tint(points[i - 1]), tint(points[i]));
    addCircle(builder, points[points.length - 1], viaRadius, 10, tint);
  });

  // Serigrafía: escuadras en las esquinas de la huella del chip
  const silk = colors.deep.clone().multiplyScalar(CONFIG.intensity.silk / CONFIG.intensity.traces);
  const corner = footReach() + 0.12;
  const arm = 0.22;
  [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ].forEach(([sx, sz]) => {
    const tip = new THREE.Vector3(sx * corner, y, sz * corner);
    builder.segment(tip, new THREE.Vector3(sx * (corner - arm), y, sz * corner), silk);
    builder.segment(tip, new THREE.Vector3(sx * corner, y, sz * (corner - arm)), silk);
  });

  return new THREE.LineSegments(builder.build(), additiveLineMaterial(CONFIG.intensity.traces));
}

function buildBody(colors) {
  const { size, height, standoff } = CONFIG.chip;
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(size, height, size);
  geometry.translate(0, standoff + height / 2, 0);

  // Cuerpo opaco y oscuro: tapa lo que queda detrás y escribe profundidad
  const bodyColor = colors.base.clone().lerp(colors.accent, 0.05);
  group.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: bodyColor })));

  // Aristas brillantes y una copia algo mayor y aditiva a modo de resplandor
  const edges = new THREE.EdgesGeometry(geometry);
  group.add(
    new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: colors.bright, transparent: true, opacity: CONFIG.intensity.edges }))
  );
  const glow = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: colors.accent,
      transparent: true,
      opacity: CONFIG.intensity.edgeGlow,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.scale.set(1.025, 1.08, 1.025);
  group.add(glow);
  return group;
}

// Cara superior: contorno del die, rejilla de bloques lógicos y círculo del pin 1
function buildTopMarkings(colors) {
  const { size, height, standoff, dieInset, dieCells } = CONFIG.chip;
  const builder = createLineBuilder();
  const top = standoff + height + 0.003;
  const dieHalf = size / 2 - dieInset;
  const cell = (dieHalf * 2) / dieCells;
  const strong = colors.bright;
  const faint = colors.accent.clone().multiplyScalar(0.45);

  addSquare(builder, new THREE.Vector3(0, top, 0), dieHalf, strong);
  for (let row = 0; row < dieCells; row++) {
    for (let col = 0; col < dieCells; col++) {
      const center = new THREE.Vector3(-dieHalf + cell * (col + 0.5), top, -dieHalf + cell * (row + 0.5));
      addSquare(builder, center, cell / 2 - 0.07, faint);
    }
  }

  const pin1 = new THREE.Vector3(-size / 2 + dieInset * 0.6, top, -size / 2 + dieInset * 0.6);
  addCircle(builder, pin1, 0.15, 24, () => strong);
  addCircle(builder, pin1, 0.07, 16, () => strong);

  return new THREE.LineSegments(builder.build(), additiveLineMaterial(CONFIG.intensity.top));
}

// Pines en ala de gaviota: hombro, pata inclinada y pie (3 cajas por pin en un InstancedMesh)
function buildPins(colors) {
  const { size, height, standoff, pinsPerSide } = CONFIG.chip;
  const { width, thickness, shoulder, drop, foot } = CONFIG.pins;
  const half = size / 2;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: colors.accent.clone().multiplyScalar(0.85) });
  const mesh = new THREE.InstancedMesh(geometry, material, pinsPerSide * 4 * 3);

  const sideMatrix = new THREE.Matrix4();
  const partMatrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
  const yShoulder = standoff + height * 0.4;
  const yFoot = thickness / 2;
  const legLength = Math.hypot(drop, yShoulder - yFoot);
  const legAngle = -Math.atan2(yShoulder - yFoot, drop);
  let index = 0;

  const addPart = (u, y, v, length, tilt) => {
    rotation.setFromAxisAngle(zAxis, tilt);
    partMatrix.compose(new THREE.Vector3(u, y, v), rotation, new THREE.Vector3(length, thickness, width));
    mesh.setMatrixAt(index++, partMatrix.premultiply(sideMatrix));
  };

  for (let side = 0; side < 4; side++) {
    sideMatrix.makeRotationY((side * Math.PI) / 2);
    pinOffsets().forEach((v) => {
      addPart(half + shoulder / 2, yShoulder, v, shoulder, 0);
      addPart(half + shoulder + drop / 2, (yShoulder + yFoot) / 2, v, legLength, legAngle);
      addPart(half + shoulder + drop + foot / 2, yFoot, v, foot, 0);
    });
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

// Condensadores de desacoplo en las esquinas (zona libre de pistas)
function buildCapacitors(colors) {
  const group = new THREE.Group();
  const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.36, 0.14, 0.18));
  const material = new THREE.LineBasicMaterial({ color: colors.accent, transparent: true, opacity: 0.55 });
  const distance = footReach() + 0.55;
  [0, 1, 2, 3].forEach((i) => {
    const angle = Math.PI / 4 + (i * Math.PI) / 2;
    const cap = new THREE.LineSegments(geometry, material);
    cap.position.set(Math.cos(angle) * distance * Math.SQRT2, 0.07, Math.sin(angle) * distance * Math.SQRT2);
    cap.rotation.y = -angle + Math.PI / 2;
    group.add(cap);
  });
  return group;
}

/* ---------- Pulsos de luz ---------- */
function createPulses(paths, colors, glowTexture, rand) {
  const { count, tailSegments, size } = CONFIG.pulses;

  const tailGeometry = new THREE.BufferGeometry();
  tailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * tailSegments * 6), 3));
  tailGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * tailSegments * 6), 3));
  const tail = new THREE.LineSegments(tailGeometry, additiveLineMaterial(1));
  tail.frustumCulled = false;

  const headGeometry = new THREE.BufferGeometry();
  headGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  headGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const heads = new THREE.Points(
    headGeometry,
    new THREE.PointsMaterial({
      size,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  heads.frustumCulled = false;

  const items = Array.from({ length: count }, () => resetPulse({}, paths, rand, false));
  return { items, tail, heads, paths, rand, color: colors.bright, scratch: new THREE.Vector3() };
}

function resetPulse(pulse, paths, rand, afterRun) {
  const { speed, delay, outwardRatio } = CONFIG.pulses;
  pulse.path = paths[Math.floor(rand() * paths.length)];
  pulse.distance = 0;
  pulse.speed = between(rand, speed);
  pulse.outward = rand() < outwardRatio;
  pulse.wait = afterRun ? between(rand, delay) : rand() * delay[1];
  return pulse;
}

function writeVertex(array, index, point) {
  array[index * 3] = point.x;
  array[index * 3 + 1] = point.y;
  array[index * 3 + 2] = point.z;
}

function writeColor(array, index, color, level) {
  array[index * 3] = color.r * level;
  array[index * 3 + 1] = color.g * level;
  array[index * 3 + 2] = color.b * level;
}

// Punto del pulso a una distancia recorrida, con su brillo (0 si está fuera de la pista)
function samplePulse(pulse, travelled, target) {
  const { length } = pulse.path;
  const inside = travelled >= 0 && travelled <= length;
  const along = clamp(travelled, 0, length);
  pointOnPath(pulse.path, pulse.outward ? along : length - along, target);
  return inside ? fadeAt(target) : 0;
}

function updatePulses(pulses, dt) {
  const { tailLength, tailSegments } = CONFIG.pulses;
  const step = tailLength / tailSegments;
  const tailPositions = pulses.tail.geometry.attributes.position.array;
  const tailColors = pulses.tail.geometry.attributes.color.array;
  const headPositions = pulses.heads.geometry.attributes.position.array;
  const headColors = pulses.heads.geometry.attributes.color.array;
  const point = pulses.scratch;

  pulses.items.forEach((pulse, p) => {
    pulse.wait -= dt;
    if (pulse.wait <= 0) pulse.distance += pulse.speed * dt;
    const { length } = pulse.path;
    if (pulse.distance - tailLength > length) resetPulse(pulse, pulses.paths, pulses.rand, true);
    const active = pulse.wait <= 0;

    // Cabeza: al llegar al final se queda en el extremo y se apaga mientras pasa la cola
    const arrival = active ? 1 - clamp((pulse.distance - length) / tailLength, 0, 1) : 0;
    const headLevel = samplePulse(pulse, Math.min(pulse.distance, length), point) * arrival;
    writeVertex(headPositions, p, point);
    writeColor(headColors, p, pulses.color, headLevel);

    // Cola: segmentos que se apagan hacia atrás
    for (let s = 0; s < tailSegments; s++) {
      const base = (p * tailSegments + s) * 2;
      for (let end = 0; end < 2; end++) {
        const k = s + end;
        const level = active ? samplePulse(pulse, pulse.distance - k * step, point) * (1 - k / tailSegments) : 0;
        writeVertex(tailPositions, base + end, point);
        writeColor(tailColors, base + end, pulses.color, level);
      }
    }
  });

  pulses.tail.geometry.attributes.position.needsUpdate = true;
  pulses.tail.geometry.attributes.color.needsUpdate = true;
  pulses.heads.geometry.attributes.position.needsUpdate = true;
  pulses.heads.geometry.attributes.color.needsUpdate = true;
}

/* ---------- Escena completa ---------- */
// Solo crea el renderer: el tamaño y el pixel ratio se fijan en cada resize.
// Los estilos del <canvas> (tamaño, máscara, aparición) están en chip3d.css.
function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

function buildScene(colors) {
  const rand = createRandom(CONFIG.seed);
  const glowTexture = createGlowTexture();
  const paths = buildTracePaths(rand);

  const scene = new THREE.Scene();
  const tiltGroup = new THREE.Group(); // inclinación y parallax
  const spinGroup = new THREE.Group(); // giro lento
  scene.add(tiltGroup);
  tiltGroup.add(spinGroup);

  const pulses = createPulses(paths, colors, glowTexture, rand);
  const topMarkings = buildTopMarkings(colors);
  spinGroup.add(
    buildBoard(colors, glowTexture),
    buildTraces(paths, colors),
    pulses.tail,
    pulses.heads,
    buildBody(colors),
    topMarkings,
    buildPins(colors),
    buildCapacitors(colors)
  );

  return { scene, tiltGroup, spinGroup, pulses, topMarkings, glowTexture };
}

function disposeScene(scene, extraTextures) {
  const disposed = new Set();
  const once = (resource) => {
    if (!resource || disposed.has(resource)) return;
    disposed.add(resource);
    resource.dispose();
  };
  scene.traverse((object) => {
    if (object.isInstancedMesh) object.dispose();
    once(object.geometry);
    [].concat(object.material || []).forEach((material) => {
      once(material.map);
      once(material);
    });
  });
  extraTextures.forEach(once);
}

/*
 * Bucle de animación: solo pide fotogramas si el hero se ve y la pestaña está activa.
 * step(dt) recibe los segundos transcurridos, limitados para no saltar tras una pausa.
 */
function createLoop(step) {
  let frameId = 0;
  let lastTime = 0;
  let visible = true;

  function frame(time) {
    frameId = 0;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, CONFIG.maxDelta) : 0;
    lastTime = time;
    step(dt);
    schedule();
  }

  function schedule() {
    if (frameId || !visible || document.hidden) return;
    frameId = requestAnimationFrame(frame);
  }

  return {
    // Tras una pausa se reinicia el reloj para que dt no acumule el tiempo parado
    resume() {
      lastTime = 0;
      schedule();
    },
    setVisible(value) {
      visible = value;
      this.resume();
    },
    stop() {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    },
  };
}

// Posición normalizada del ratón (-1..1) en `target`; vuelve al centro al salir de la ventana
function bindPointer(target, signal) {
  window.addEventListener(
    'pointermove',
    (event) => target.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1),
    { passive: true, signal }
  );
  document.documentElement.addEventListener('pointerleave', () => target.set(0, 0), { signal });
}

function createChipScene(container) {
  // 1. Escena: solo objetos en memoria (nada se sube a la GPU hasta el primer render),
  //    así que si falla aquí no hay renderer ni contexto WebGL que liberar.
  const world = buildScene(readColors());
  const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, 1, 0.1, 100);
  const cameraBase = new THREE.Vector3(...CONFIG.camera.position);
  const pointer = new THREE.Vector2();
  const parallax = new THREE.Vector2();
  let elapsed = 0;

  const ac = new AbortController(); // retira todos los listeners de golpe
  let renderer = null;
  let loop = null;
  let resizeObserver = null;
  let intersectionObserver = null;

  function dispose() {
    ac.abort();
    loop?.stop();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    disposeScene(world.scene, [world.glowTexture]);
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    // El pixel ratio puede cambiar con el zoom o al mover la ventana a otra pantalla
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Desplaza el encuadre para que el chip quede en el punto de anclaje sin girar la cámara
    camera.setViewOffset(width, height, (0.5 - CONFIG.anchor.x) * width, (0.5 - CONFIG.anchor.y) * height, width, height);
  }

  function update(dt) {
    const { spinSpeed, tilt, wobble, parallax: parallaxAmount, cameraShift, smoothing, breathe } = CONFIG.motion;
    elapsed += dt;
    parallax.lerp(pointer, 1 - Math.exp(-smoothing * dt));

    world.spinGroup.rotation.y = elapsed * spinSpeed;
    world.tiltGroup.rotation.x = Math.sin(elapsed * 0.23) * wobble + parallax.y * parallaxAmount;
    world.tiltGroup.rotation.z = tilt + Math.sin(elapsed * 0.17) * wobble - parallax.x * parallaxAmount * 0.6;

    camera.position.set(cameraBase.x + parallax.x * cameraShift, cameraBase.y - parallax.y * cameraShift * 0.5, cameraBase.z);
    camera.lookAt(0, 0, 0);

    world.topMarkings.material.opacity = CONFIG.intensity.top * (0.75 + 0.25 * Math.sin(elapsed * breathe));
    updatePulses(world.pulses, dt);
  }

  function renderStep(dt) {
    update(dt);
    renderer.render(world.scene, camera);
  }

  // 2. Renderer, observadores y listeners; ante cualquier fallo se libera todo lo creado
  try {
    renderer = createRenderer();
    container.appendChild(renderer.domElement);
    loop = createLoop(renderStep);

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resize, { signal: ac.signal });
    }

    if ('IntersectionObserver' in window) {
      // En un mismo lote puede haber varias entradas: manda la más reciente
      intersectionObserver = new IntersectionObserver((entries) => {
        loop.setVisible(entries[entries.length - 1].isIntersecting);
      });
      intersectionObserver.observe(container);
    }

    bindPointer(pointer, ac.signal);
    document.addEventListener('visibilitychange', () => loop.resume(), { signal: ac.signal });

    // Primer fotograma síncrono; la clase is-ready (chip3d.css) dispara el fundido.
    // Doble rAF: garantiza que el navegador pinte antes la opacidad 0 y la transición se vea.
    resize();
    renderStep(0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!ac.signal.aborted) renderer.domElement.classList.add('is-ready');
      })
    );
    loop.resume();
  } catch (error) {
    dispose();
    throw error;
  }

  return { dispose };
}

/* ---------- Ciclo de vida ---------- */
async function start(container, desktop) {
  // WebGL se comprueba aquí (solo en escritorio) y el resultado queda memorizado
  if (app || sceneFailed || loadFailed || !hasWebGL()) return;
  const token = ++generation;
  const three = await loadThree();
  // La ventana pudo cambiar de tamaño mientras se descargaba Three.js
  if (!three || token !== generation || !desktop.matches || app) return;
  try {
    app = createChipScene(container);
  } catch (error) {
    sceneFailed = true;
    console.info('[chip3d] No se pudo crear la escena 3D; se omite el fondo.', error);
  }
}

function stop() {
  generation++;
  app?.dispose();
  app = null;
}

function init() {
  const container = document.getElementById('chip3d');
  if (!container || prefersReducedMotion()) return;

  const desktop = window.matchMedia(DESKTOP_QUERY);
  const sync = () => (desktop.matches ? start(container, desktop) : stop());
  desktop.addEventListener('change', sync);
  sync();
}

init();
