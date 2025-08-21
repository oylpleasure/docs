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

function drawLandmarks(landmarks) {
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  if (!landmarks) return;
  const drawer = new DrawingUtils(ctx);
  // Dot-only overlay with subtle glow
  ctx.save();
  ctx.shadowColor = 'rgba(0,229,255,0.8)';
  ctx.shadowBlur = 8;
  drawer.drawLandmarks(landmarks, { color: '#00E5FF', lineWidth: 0, radius: 3.2 });
  ctx.restore();
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

async function loop() {
  if (!running || !handLandmarker) return;
  const nowMs = performance.now();
  const result = handLandmarker.detectForVideo(video, nowMs);
  const landmarks = (result && result.landmarks && result.landmarks.length > 0) ? result.landmarks[0] : null;
  drawLandmarks(landmarks);
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

// Hint: on desktop, auto-start if permissions already granted
if (navigator.permissions && navigator.permissions.query) {
  try {
    navigator.permissions.query({ name: 'camera' }).then((p) => {
      if (p.state === 'granted') startCamera();
    });
  } catch (_) {}
}

