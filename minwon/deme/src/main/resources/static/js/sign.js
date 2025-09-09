// ===== DOM utils
const $ = (sel) => document.querySelector(sel);
function download(dataURL, filename) {
  const a = document.createElement('a');
  a.href = dataURL; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
}
function canvasToJPEG(canvas, quality = 0.92, bg = 'white') {
  const t = document.createElement('canvas');
  t.width = canvas.width; t.height = canvas.height;
  const c = t.getContext('2d');
  c.fillStyle = bg; c.fillRect(0, 0, t.width, t.height);
  c.drawImage(canvas, 0, 0);
  return t.toDataURL('image/jpeg', quality);
}

// ===== Canvas init (crisp with devicePixelRatio)
const canvas = $('#sig-canvas');
const ctx = canvas.getContext('2d');

function fitCanvasToParent() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  // keep css size, bump pixel buffer
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
}

requestAnimationFrame(() => {
  fitCanvasToParent();
  saveState();
});

// ===== State
let drawing = false;
let points = []; // stroke points: {x,y,t,pressure}
let isEraser = false;
const history = []; // ImageData

const colorEl = $('#color');
const sizeEl = $('#size');
const sizeValEl = $('#size-val');
const eraserEl = $('#eraser');

sizeEl.addEventListener('input', () => sizeValEl.textContent = `${sizeEl.value}px`);
eraserEl.addEventListener('change', () => isEraser = eraserEl.checked);

// ===== Undo stack
function saveState() {
  try {
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.push(img);
    if (history.length > 60) history.shift();
  } catch {}
}
function restoreState() {
  if (history.length <= 1) return;
  history.pop();
  const prev = history[history.length - 1];
  ctx.globalCompositeOperation = 'source-over';
  ctx.putImageData(prev, 0, 0);
}

// ===== Helpers
function now() { return performance.now(); }
function getPoint(e) {
  const r = canvas.getBoundingClientRect();
  const p = {
    x: e.clientX - r.left,
    y: e.clientY - r.top,
    t: now(),
    pressure: (e.pressure && e.pressure > 0 ? e.pressure : 1)
  };
  return p;
}
function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

// ===== Stroke rendering with interpolation + spline smoothing
// We combine: (1) Catmull-Rom to Quadratic smoothing, (2) segment interpolation for fast moves,
// and (3) pointerrawupdate to increase sampling where supported.
function drawSegmentSmooth(pts) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
  const base = parseFloat(sizeEl.value);
  ctx.strokeStyle = colorEl.value;

  ctx.beginPath();
  // Build smoothed path
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;

    // Adjust width by pressure (average of p1/p2)
    const pressure = (p1.pressure + p2.pressure) * 0.5;
    ctx.lineWidth = Math.max(0.5, base * pressure);

    // Catmull-Rom -> Quadratic approximation (midpoint method)
    const cpX = p1.x + (p2.x - p0.x) / 6;
    const cpY = p1.y + (p2.y - p0.y) / 6;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    if (i === 0) ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpX, cpY, midX, midY);

    // Handle large gaps by sub-sampling along the segment (prevents gaps at high speed)
    const segLen = dist(p1, p2);
    if (segLen > 6) { // threshold in CSS pixels
      const step = 3; // sample every ~3px
      const n = Math.floor(segLen / step);
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        const ix = p1.x + (p2.x - p1.x) * t;
        const iy = p1.y + (p2.y - p1.y) * t;
        ctx.lineTo(ix, iy);
      }
    }
  }
  ctx.stroke();
  ctx.restore();
}

// incremental redraw of only the new segment(s)
let lastDrawnIndex = 0;
function redrawNew() {
  if (points.length - lastDrawnIndex < 2) return;
  const slice = points.slice(Math.max(0, lastDrawnIndex - 2));
  drawSegmentSmooth(slice);
  lastDrawnIndex = points.length - 1;
}

// ===== Event handlers
function pointerDown(e) {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  drawing = true;
  points = [];
  lastDrawnIndex = 0;
  points.push(getPoint(e));
  redrawNew();
}
function pointerMove(e) {
  if (!drawing) return;
  points.push(getPoint(e));
  redrawNew();
}
function pointerRawUpdate(e) {
  if (!drawing) return;
  points.push(getPoint(e));
  redrawNew();
}
function pointerUp(e) {
  if (!drawing) return;
  drawing = false;
  // Finalize the stroke with a full smooth pass to clean corners
  drawSegmentSmooth(points);
  saveState();
  points = [];
  lastDrawnIndex = 0;
}

// listen with both standard and raw update for higher sampling
canvas.addEventListener('pointerdown', pointerDown);
canvas.addEventListener('pointermove', pointerMove);
canvas.addEventListener('pointerup', pointerUp);
canvas.addEventListener('pointercancel', pointerUp);
canvas.addEventListener('pointerout', pointerUp);
// Raw updates (where supported)
canvas.addEventListener('pointerrawupdate', pointerRawUpdate);

// Prevent page scroll on touch while drawing
['touchstart','touchmove','touchend','gesturestart'].forEach(t => {
  canvas.addEventListener(t, ev => ev.preventDefault(), { passive: false });
});

// Actions
$('#undo').addEventListener('click', restoreState);
$('#clear').addEventListener('click', () => { saveState(); ctx.clearRect(0,0,canvas.width, canvas.height); });

// Keyboard
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); restoreState(); }
  if (e.key.toLowerCase() === 'e') { eraserEl.checked = !eraserEl.checked; isEraser = eraserEl.checked; }
});

// Save helpers
function exportFilename(ext) {
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  return `signature-${ts}.${ext}`;
}
$('#save-png').addEventListener('click', () => {
  const url = canvas.toDataURL('image/png');
  download(url, exportFilename('png'));
});
$('#save-png-white').addEventListener('click', () => {
  const t = document.createElement('canvas');
  t.width = canvas.width; t.height = canvas.height;
  const c = t.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0,0,t.width,t.height);
  c.drawImage(canvas, 0, 0);
  download(t.toDataURL('image/png'), exportFilename('png'));
});
$('#save-jpg').addEventListener('click', () => {
  const url = canvasToJPEG(canvas, 0.95, '#ffffff');
  download(url, exportFilename('jpg'));
});

// Resize (preserve content)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const bmp = new Image();
    bmp.src = canvas.toDataURL('image/png');
    bmp.onload = () => {
      ctx.setTransform(1,0,0,1,0,0);
      fitCanvasToParent();
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      saveState();
    };
  }, 150);
});
