import { FilesetResolver, HandLandmarker, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const viewport = document.getElementById('viewport');
const startBtn = document.getElementById('startBtn');
const flipBtn = document.getElementById('flipBtn');
const gestureBadge = document.getElementById('gestureBadge');

let handLandmarker = null;
let filesetResolver = null;
let running = false;
let facingMode = 'user';
let lastGesture = null;
let lastGestureTs = 0;
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
  drawer.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: '#00E5FF', lineWidth: 3 });
  drawer.drawLandmarks(landmarks, { color: '#FFFFFF', lineWidth: 1, radius: 2.5 });
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function isFingerExtended(landmarks, tip, dip, pip, mcp) {
  const tipToMcp = distance(landmarks[tip], landmarks[mcp]);
  const pipToMcp = distance(landmarks[pip], landmarks[mcp]);
  return tipToMcp > pipToMcp * 1.15; // heuristically extended
}

function gestureFromLandmarks(landmarks) {
  if (!landmarks || landmarks.length === 0) return null;
  const pts = landmarks[0];
  // Indices per MediaPipe: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
  const WRIST = 0;
  const THUMB_CMC = 1, THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4;
  const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_DIP = 7, INDEX_TIP = 8;
  const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_DIP = 11, MIDDLE_TIP = 12;
  const RING_MCP = 13, RING_PIP = 14, RING_DIP = 15, RING_TIP = 16;
  const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_DIP = 19, PINKY_TIP = 20;

  const indexExtended = isFingerExtended(pts, INDEX_TIP, INDEX_DIP, INDEX_PIP, INDEX_MCP);
  const middleExtended = isFingerExtended(pts, MIDDLE_TIP, MIDDLE_DIP, MIDDLE_PIP, MIDDLE_MCP);
  const ringExtended = isFingerExtended(pts, RING_TIP, RING_DIP, RING_PIP, RING_MCP);
  const pinkyExtended = isFingerExtended(pts, PINKY_TIP, PINKY_DIP, PINKY_PIP, PINKY_MCP);

  // Thumb extended if its tip is far from CMC vs IP.
  const thumbExtended = distance(pts[THUMB_TIP], pts[THUMB_CMC]) > distance(pts[THUMB_IP], pts[THUMB_CMC]) * 1.12;

  // Fist: no fingers extended significantly
  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended, thumbExtended].filter(Boolean).length;
  if (extendedCount <= 1) {
    // Ensure fingertips are close to wrist (folded)
    const avgTipToWrist = (distance(pts[INDEX_TIP], pts[WRIST]) + distance(pts[MIDDLE_TIP], pts[WRIST]) + distance(pts[RING_TIP], pts[WRIST]) + distance(pts[PINKY_TIP], pts[WRIST])) / 4;
    const palmSize = distance(pts[WRIST], pts[MIDDLE_MCP]);
    if (avgTipToWrist < palmSize * 1.6) return 'fist';
  }

  // Thumbs up: thumb extended, others not; thumb generally above wrist (y decreasing upward)
  const othersExtended = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;
  if (thumbExtended && othersExtended === 0) {
    const thumbVectorY = pts[THUMB_TIP].y - pts[THUMB_MCP].y; // negative is up
    if (thumbVectorY < -0.02) return 'thumbs_up';
  }

  return null;
}

function showGestureBadge(gesture) {
  if (!gesture) {
    gestureBadge.classList.remove('show');
    return;
  }
  const text = gesture === 'thumbs_up' ? '👍 Thumbs Up' : gesture === 'fist' ? '✊ Fist' : '—';
  gestureBadge.textContent = text;
  gestureBadge.classList.remove('hidden');
  gestureBadge.classList.add('show');
  lastGesture = gesture;
  lastGestureTs = performance.now();
}

function maybeHideBadge() {
  const now = performance.now();
  if (gestureBadge.classList.contains('show') && now - lastGestureTs > 1200) {
    gestureBadge.classList.remove('show');
  }
}

async function loop() {
  if (!running || !handLandmarker) return;
  const nowMs = performance.now();
  const result = handLandmarker.detectForVideo(video, nowMs);
  const landmarks = (result && result.landmarks && result.landmarks.length > 0) ? result.landmarks[0] : null;
  drawLandmarks(landmarks);
  const gesture = landmarks ? gestureFromLandmarks([landmarks]) : null;
  if (gesture) {
    showGestureBadge(gesture);
  } else {
    maybeHideBadge();
  }
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

