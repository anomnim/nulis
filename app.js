// ============================================================
// 🎮 TULIS YUK! — App Logic
// ============================================================

// ── State ────────────────────────────────────────────────────
const state = {
  currentCategory: null,
  currentWord: null,
  wordIndex: 0,
  score: 0,
  stars: 0,
  attempts: 0,
  isDrawing: false,
  hasDrawn: false,
  traceMode: true, // true = lihat contoh, false = tulis sendiri
  streakCount: 0,
  totalCompleted: 0,
};

// ── Canvas Setup ─────────────────────────────────────────────
let canvas, ctx;
let traceCanvas, traceCtx;
let lastX, lastY;
let brushSize = 12;
let brushColor = "#2D3561";

function initCanvas() {
  canvas = document.getElementById("drawCanvas");
  ctx = canvas.getContext("2d");
  traceCanvas = document.getElementById("traceCanvas");
  traceCtx = traceCanvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Touch events
  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd);

  // Mouse events (desktop fallback)
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseUp);
}

function resizeCanvas() {
  const container = document.getElementById("canvasContainer");
  const rect = container.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height, 340);

  [canvas, traceCanvas].forEach((c) => {
    c.width = size;
    c.height = size;
  });

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = brushColor;
  ctx.lineWidth = brushSize;

  if (state.currentWord) drawGuide();
}

// ── Drawing Functions ─────────────────────────────────────────
function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  if (e.touches) {
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY,
    };
  }
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function handleTouchStart(e) {
  e.preventDefault();
  const pos = getPos(e, canvas);
  startDraw(pos.x, pos.y);
}
function handleTouchMove(e) {
  e.preventDefault();
  const pos = getPos(e, canvas);
  draw(pos.x, pos.y);
}
function handleTouchEnd() {
  endDraw();
}
function handleMouseDown(e) {
  const pos = getPos(e, canvas);
  startDraw(pos.x, pos.y);
}
function handleMouseMove(e) {
  if (!state.isDrawing) return;
  const pos = getPos(e, canvas);
  draw(pos.x, pos.y);
}
function handleMouseUp() {
  endDraw();
}

function startDraw(x, y) {
  state.isDrawing = true;
  state.hasDrawn = true;
  lastX = x;
  lastY = y;
  ctx.beginPath();
  ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.fillStyle = brushColor;
  ctx.fill();
  showSubmitBtn();
}

function draw(x, y) {
  if (!state.isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = brushColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  lastX = x;
  lastY = y;
}

function endDraw() {
  state.isDrawing = false;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.hasDrawn = false;
  hideSubmitBtn();
  playSound("erase");
}

function showSubmitBtn() {
  document.getElementById("submitBtn").classList.remove("opacity-0", "pointer-events-none");
  document.getElementById("submitBtn").classList.add("opacity-100");
}

function hideSubmitBtn() {
  document.getElementById("submitBtn").classList.add("opacity-0", "pointer-events-none");
  document.getElementById("submitBtn").classList.remove("opacity-100");
}

// ── Guide / Trace Drawing ─────────────────────────────────────
function drawGuide() {
  if (!state.currentWord) return;
  const word = state.currentWord.teks;

  traceCtx.clearRect(0, 0, traceCanvas.width, traceCanvas.height);

  const size = traceCanvas.width;
  const isLong = word.length > 6;
  const fontSize = isLong
    ? Math.min(size * 0.18, 48)
    : word.length === 1
    ? size * 0.65
    : Math.min(size * 0.3, 90);

  traceCtx.save();
  traceCtx.font = `bold ${fontSize}px 'Nunito', cursive`;
  traceCtx.textAlign = "center";
  traceCtx.textBaseline = "middle";

  // Dashed guide text
  traceCtx.setLineDash([8, 6]);
  traceCtx.lineWidth = 3;
  traceCtx.strokeStyle = "rgba(150, 150, 200, 0.5)";
  traceCtx.strokeText(word, size / 2, size / 2);

  // Fill with very light color
  traceCtx.setLineDash([]);
  traceCtx.fillStyle = "rgba(180, 180, 230, 0.18)";
  traceCtx.fillText(word, size / 2, size / 2);

  // Baseline guide
  const textMetrics = traceCtx.measureText(word);
  const baselineY = size / 2 + fontSize * 0.15;
  traceCtx.beginPath();
  traceCtx.setLineDash([5, 5]);
  traceCtx.strokeStyle = "rgba(200, 180, 220, 0.4)";
  traceCtx.lineWidth = 1.5;
  const x1 = size / 2 - textMetrics.width / 2 - 10;
  const x2 = size / 2 + textMetrics.width / 2 + 10;
  traceCtx.moveTo(x1, baselineY);
  traceCtx.lineTo(x2, baselineY);
  traceCtx.stroke();
  traceCtx.restore();
}

// ── Category Screen ───────────────────────────────────────────
function showCategories() {
  document.getElementById("screen-home").classList.add("hidden");
  document.getElementById("screen-category").classList.remove("hidden");
  document.getElementById("screen-game").classList.add("hidden");
  document.getElementById("screen-result").classList.add("hidden");

  renderCategories();
}

function renderCategories() {
  const grid = document.getElementById("categoryGrid");
  grid.innerHTML = "";

  Object.entries(WORD_BANK).forEach(([key, cat]) => {
    const total = cat.items.length;
    const card = document.createElement("div");
    card.className =
      "category-card rounded-3xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform shadow-lg";
    card.style.background = `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)`;
    card.style.border = `3px solid ${cat.color}`;
    card.innerHTML = `
      <div class="text-4xl">${cat.icon}</div>
      <div class="font-bold text-gray-700 text-sm text-center">${cat.label}</div>
      <div class="text-xs text-gray-500">${total} kata</div>
    `;
    card.addEventListener("click", () => startCategory(key));
    grid.appendChild(card);
  });
}

// ── Game Screen ───────────────────────────────────────────────
function startCategory(categoryKey) {
  state.currentCategory = categoryKey;
  state.wordIndex = 0;
  state.score = 0;
  state.attempts = 0;
  state.streakCount = 0;

  // Shuffle items
  const items = [...WORD_BANK[categoryKey].items];
  state.shuffledItems = shuffleArray(items).slice(0, 10); // max 10 per sesi

  document.getElementById("screen-category").classList.add("hidden");
  document.getElementById("screen-game").classList.remove("hidden");

  loadWord();
}

function loadWord() {
  if (state.wordIndex >= state.shuffledItems.length) {
    showResult();
    return;
  }

  state.currentWord = state.shuffledItems[state.wordIndex];
  state.hasDrawn = false;
  clearCanvas();

  const cat = WORD_BANK[state.currentCategory];
  const word = state.currentWord;

  // Update UI
  document.getElementById("wordEmoji").textContent = word.emoji;
  document.getElementById("wordText").textContent = word.teks;
  document.getElementById("wordHint").textContent = word.petunjuk;
  document.getElementById("progressText").textContent = `${state.wordIndex + 1} / ${state.shuffledItems.length}`;
  document.getElementById("scoreDisplay").textContent = state.score;

  // Progress bar
  const pct = (state.wordIndex / state.shuffledItems.length) * 100;
  document.getElementById("progressBar").style.width = `${pct}%`;

  // Color accent
  document.getElementById("wordCard").style.borderColor = cat.color;
  document.getElementById("progressBar").style.background = cat.color;

  drawGuide();
  hideSubmitBtn();

  // Animate in
  document.getElementById("wordCard").classList.remove("bounce-in");
  void document.getElementById("wordCard").offsetWidth;
  document.getElementById("wordCard").classList.add("bounce-in");
}

function submitAnswer() {
  if (!state.hasDrawn) {
    showToast("Tulis dulu ya! ✏️");
    return;
  }

  state.attempts++;
  state.score += 10;
  state.streakCount++;
  state.totalCompleted++;

  playSound("success");
  showStarAnimation();

  setTimeout(() => {
    state.wordIndex++;
    loadWord();
  }, 1200);
}

function skipWord() {
  state.streakCount = 0;
  state.wordIndex++;
  clearCanvas();
  playSound("skip");
  loadWord();
}

// ── Result Screen ─────────────────────────────────────────────
function showResult() {
  document.getElementById("screen-game").classList.add("hidden");
  document.getElementById("screen-result").classList.remove("hidden");

  const total = state.shuffledItems.length;
  const done = state.attempts;
  const pct = Math.round((done / total) * 100);

  let stars = 1;
  if (pct >= 60) stars = 2;
  if (pct >= 90) stars = 3;

  document.getElementById("resultScore").textContent = state.score;
  document.getElementById("resultWords").textContent = `${done} dari ${total} kata`;

  const starEl = document.getElementById("resultStars");
  starEl.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const s = document.createElement("span");
    s.textContent = i < stars ? "⭐" : "☆";
    s.className = "text-4xl";
    starEl.appendChild(s);
  }

  let msg = "Terus berlatih ya! 💪";
  if (stars === 3) msg = "Luar biasa! Kamu hebat! 🏆";
  else if (stars === 2) msg = "Bagus sekali! Terus semangat! 🌟";
  document.getElementById("resultMsg").textContent = msg;

  playSound("finish");
}

// ── Home Screen ───────────────────────────────────────────────
function showHome() {
  document.getElementById("screen-home").classList.remove("hidden");
  document.getElementById("screen-category").classList.add("hidden");
  document.getElementById("screen-game").classList.add("hidden");
  document.getElementById("screen-result").classList.add("hidden");
}

// ── Brush Controls ────────────────────────────────────────────
function setBrushSize(size) {
  brushSize = size;
  ctx.lineWidth = size;
  document.querySelectorAll(".brush-btn").forEach((b) => b.classList.remove("ring-4"));
  event.target.classList.add("ring-4");
}

function setBrushColor(color) {
  brushColor = color;
  document.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("ring-4"));
  event.target.classList.add("ring-4");
}

// ── Utilities ─────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("opacity-0", "translate-y-4");
  toast.classList.add("opacity-100", "translate-y-0");
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-4");
    toast.classList.remove("opacity-100", "translate-y-0");
  }, 2000);
}

function showStarAnimation() {
  const anim = document.getElementById("starAnim");
  anim.classList.remove("hidden");
  anim.classList.add("animate-ping-once");
  setTimeout(() => {
    anim.classList.add("hidden");
    anim.classList.remove("animate-ping-once");
  }, 900);
}

function playSound(type) {
  // Web Audio API — simple beep sounds (no file needed)
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const sounds = {
      success: { freq: [523, 659, 784], dur: 0.12 },
      erase: { freq: [300], dur: 0.08 },
      skip: { freq: [400, 350], dur: 0.1 },
      finish: { freq: [523, 659, 784, 1047], dur: 0.15 },
      tap: { freq: [600], dur: 0.06 },
    };

    const s = sounds[type] || sounds.tap;
    s.freq.forEach((f, i) => {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.connect(g2);
      g2.connect(ctx.destination);
      o2.frequency.value = f;
      o2.type = "sine";
      g2.gain.setValueAtTime(0.15, ctx.currentTime + i * s.dur);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * s.dur + s.dur);
      o2.start(ctx.currentTime + i * s.dur);
      o2.stop(ctx.currentTime + i * s.dur + s.dur + 0.05);
    });
  } catch (e) {}
}

// ── Init ─────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  initCanvas();

  // Default brush & color selection highlight
  document.querySelectorAll(".brush-btn")[1]?.classList.add("ring-4");
  document.querySelectorAll(".color-btn")[0]?.classList.add("ring-4");
});
