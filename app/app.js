import { FilesetResolver, HandLandmarker, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const viewport = document.getElementById('viewport');
const startBtn = document.getElementById('startBtn');
const flipBtn = document.getElementById('flipBtn');

let handLandmarker = null;
let filesetResolver = null;
let running = false;
let facingMode = 'user';
let stream = null;

// Exponential smoothing for landmark jitter
const smoothState = {
  landmarks: null,
  alpha: 0.35
};

async function ensureHandLandmarker() {
  if (handLandmarker) return handLandmarker;
  if (!filesetResolver) {
    filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
  }
  handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/hand_landmarker/hand_landmarker.task"
    },
    numHands: 1,
    minHandDetectionConfidence: 0.65,
    minHandPresenceConfidence: 0.65,
    minTrackingConfidence: 0.65,
    runningMode: 'VIDEO'
  });
  return handLandmarker;
}

function setMirrored(isMirrored) {
  viewport.classList.toggle('mirrored', !!isMirrored);
}

function resizeCanvas() {
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
}

async function startCamera() {
  stopCamera();
  const constraints = {
    audio: false,
    video: {
      facingMode: facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();
    await ensureHandLandmarker();
    resizeCanvas();
    setMirrored(facingMode === 'user');
    running = true;
    startBtn.classList.add('hidden');
    loop();
  } catch (err) {
    console.error(err);
    alert('Unable to access camera. Please allow camera permission.');
  }
}

function stopCamera() {
  running = false;
  if (stream) {
    for (const track of stream.getTracks()) track.stop();
  }
  stream = null;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function smoothLandmarks(raw) {
  if (!raw) return null;
  if (!smoothState.landmarks) {
    smoothState.landmarks = raw.map(p => ({ x: p.x, y: p.y, z: p.z ?? 0 }));
    return smoothState.landmarks;
  }
  const out = smoothState.landmarks;
  const a = smoothState.alpha;
  for (let i = 0; i < raw.length; i++) {
    out[i].x = lerp(out[i].x, raw[i].x, a);
    out[i].y = lerp(out[i].y, raw[i].y, a);
    out[i].z = lerp(out[i].z, raw[i].z ?? 0, a);
  }
  return out;
}

function project(pt) {
  return { x: pt.x * overlay.width, y: pt.y * overlay.height };
}

// Build a stable triangulation per frame using indices for MediaPipe's 21 points
// We'll use Delaunator on projected 2D points for a pleasant glove mesh.
function drawGloveMesh(pts) {
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  if (!pts || pts.length < 3) return;

  const points2D = pts.map(project).map(p => [p.x, p.y]);
  const delaunay = Delaunator.from(points2D);
  const tris = delaunay.triangles;

  ctx.save();
  ctx.globalAlpha = 0.85;
  // Fill
  ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
  for (let i = 0; i < tris.length; i += 3) {
    const a = points2D[tris[i]];
    const b = points2D[tris[i + 1]];
    const c = points2D[tris[i + 2]];
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.fill();
  }

  // Stroke
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.shadowColor = 'rgba(0, 229, 255, 0.7)';
  ctx.shadowBlur = 6;
  for (let i = 0; i < tris.length; i += 3) {
    const a = points2D[tris[i]];
    const b = points2D[tris[i + 1]];
    const c = points2D[tris[i + 2]];
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.stroke();
  }

  // Optional nodes for extra flair
  ctx.shadowBlur = 10;
  ctx.fillStyle = 'rgba(0, 229, 255, 0.9)';
  for (const p of points2D) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

async function loop() {
  if (!running || !handLandmarker) return;
  const nowMs = performance.now();
  const result = handLandmarker.detectForVideo(video, nowMs);
  const landmarks = (result && result.landmarks && result.landmarks.length > 0) ? result.landmarks[0] : null;
  const smoothed = smoothLandmarks(landmarks);
  drawGloveMesh(smoothed);
  requestAnimationFrame(loop);
}

startBtn.addEventListener('click', () => {
  startCamera();
});

flipBtn.addEventListener('click', async () => {
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  await startCamera();
});

window.addEventListener('orientationchange', () => {
  setTimeout(resizeCanvas, 300);
});

// Auto-start when camera permission is already granted (desktop/dev convenience)
if (navigator.permissions && navigator.permissions.query) {
  try {
    navigator.permissions.query({ name: 'camera' }).then((p) => {
      if (p.state === 'granted') startCamera();
    });
  } catch (_) {}
}

