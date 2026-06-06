const canvas = document.querySelector("#drawingCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const brushSize = document.querySelector("#brushSize");
const sizeValue = document.querySelector("#sizeValue");
const colorButtons = document.querySelectorAll(".color-button");
const undoButton = document.querySelector("#undoButton");
const clearButton = document.querySelector("#clearButton");

const state = {
  color: "#111111",
  size: Number(brushSize.value),
  drawing: false,
  activePointerId: null,
  lastPoint: null,
  history: [],
  maxHistory: 24,
};

function setupCanvas() {
  const snapshot = canvas.width > 0 && canvas.height > 0 ? canvas.toDataURL("image/png") : null;
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = "#f9f6ef";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (snapshot) {
    const image = new Image();
    image.onload = () => ctx.drawImage(image, 0, 0, window.innerWidth, window.innerHeight);
    image.src = snapshot;
  }
}

function saveHistory() {
  state.history.push(canvas.toDataURL("image/png"));
  if (state.history.length > state.maxHistory) {
    state.history.shift();
  }
}

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const pressure = event.pressure && event.pressure > 0 ? event.pressure : 0.65;

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    pressure,
  };
}

function drawLine(from, to) {
  const pressureSize = state.size * (0.35 + to.pressure * 0.9);

  ctx.strokeStyle = state.color;
  ctx.lineWidth = pressureSize;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function startDrawing(event) {
  if (state.drawing) return;

  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  saveHistory();
  state.drawing = true;
  state.activePointerId = event.pointerId;
  state.lastPoint = pointFromEvent(event);
}

function continueDrawing(event) {
  if (!state.drawing || event.pointerId !== state.activePointerId) return;

  event.preventDefault();
  const events = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [event];

  for (const currentEvent of events) {
    const point = pointFromEvent(currentEvent);
    drawLine(state.lastPoint, point);
    state.lastPoint = point;
  }
}

function stopDrawing(event) {
  if (!state.drawing || event.pointerId !== state.activePointerId) return;

  event.preventDefault();
  state.drawing = false;
  state.activePointerId = null;
  state.lastPoint = null;
}

function restoreImage(dataUrl) {
  const image = new Image();
  image.onload = () => {
    ctx.fillStyle = "#f9f6ef";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.drawImage(image, 0, 0, window.innerWidth, window.innerHeight);
  };
  image.src = dataUrl;
}

function clearCanvas() {
  saveHistory();
  ctx.fillStyle = "#f9f6ef";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

brushSize.addEventListener("input", () => {
  state.size = Number(brushSize.value);
  sizeValue.textContent = brushSize.value;
});

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.color = button.dataset.color;
    colorButtons.forEach((item) => item.classList.toggle("active", item === button));
  });
});

undoButton.addEventListener("click", () => {
  const previous = state.history.pop();
  if (previous) restoreImage(previous);
});

clearButton.addEventListener("click", clearCanvas);

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", continueDrawing);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);

window.addEventListener("resize", setupCanvas);

setupCanvas();
