// ===============================
// Firebase 初期化
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUaWtZJZefUqjBs9LcEbOD6YeL9K1HjcU",
  authDomain: "tapgame-6595f.firebaseapp.com",
  projectId: "tapgame-6595f",
  storageBucket: "tapgame-6595f.firebasestorage.app",
  messagingSenderId: "6228648102",
  appId: "1:6228648102:web:32fc4035c1233dfd039467"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// 要素取得
// ===============================
const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const rankingEl = document.getElementById("ranking");

// ===============================
// ゲーム用変数
// ===============================
let current = 1;
let startTime = null;
let timer = null;
let playing = false;

// ===============================
// 端末ID（1人1回）
// ===============================
const deviceIdKey = "tapgame_device_id";
let deviceId = localStorage.getItem(deviceIdKey);

if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem(deviceIdKey, deviceId);
}

// ===============================
// 共通関数
// ===============================
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createGrid() {
  grid.innerHTML = "";
  const numbers = shuffle([...Array(25)].map((_, i) => i + 1));

  numbers.forEach(num => {
    const cell = document.createElement("div");
    cell.textContent = num;
    cell.className = "cell";
    cell.onclick = () => clickNumber(cell, num);
    grid.appendChild(cell);
  });
}

function clickNumber(cell, num) {
  if (!playing || num !== current) return;

  cell.classList.add("disabled");
  current++;

  if (current === 26) {
    finishGame();
  }
}

// ===============================
// ゲーム制御
// ===============================
function startGame() {
  createGrid();
  current = 1;
  playing = true;
  startTime = performance.now();

  startBtn.disabled = true;
  resetBtn.disabled = false;

  timer = setInterval(() => {
    const t = (performance.now() - startTime) / 1000;
    timeEl.textContent = t.toFixed(2);
  }, 10);
}

function resetGame() {
  clearInterval(timer);
  playing = false;
  grid.innerHTML = "";
  timeEl.textContent = "0.00";
  startBtn.disabled = false;
  resetBtn.disabled = true;
}

// ===============================
// 終了処理 & Firebase保存
// ===============================
async function finishGame() {
  clearInterval(timer);
  playing = false;
  startBtn.disabled = false;

  const time = Number(((performance.now() - startTime) / 1000).toFixed(2));
  timeEl.textContent = time.toFixed(2);

  const ref = doc(db, "scores", deviceId);
  const snap = await getDoc(ref);

  if (!snap.exists() || time < snap.data().time) {
    await setDoc(ref, {
      time: time,
      updatedAt: Date.now()
    });
    bestEl.textContent = time.toFixed(2) + " 秒";
  }

  loadRanking();
}

// ===============================
// ランキング表示（上位10人）
// ===============================
async function loadRanking() {
  rankingEl.innerHTML = "";

  const q = query(
    collection(db, "scores"),
    orderBy("time", "asc"),
    limit(10)
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().time.toFixed(2) + " 秒";
    rankingEl.appendChild(li);
  });
}

// ===============================
// ボタン設定
// ===============================
startBtn.onclick = startGame;
resetBtn.onclick = resetGame;

// ===============================
// 初期表示
// ===============================
(async () => {
  const ref = doc(db, "scores", deviceId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    bestEl.textContent = snap.data().time.toFixed(2) + " 秒";
  }
  loadRanking();
})();
