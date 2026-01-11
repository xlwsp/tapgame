// ==========================
// Firebase config（そのまま）
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyDUaWtZJZefUqjBs9LcEbOD6YeL9K1HjcU",
  authDomain: "tapgame-6595f.firebaseapp.com",
  projectId: "tapgame-6595f",
  storageBucket: "tapgame-6595f.firebasestorage.app",
  messagingSenderId: "6228648102",
  appId: "1:6228648102:web:32fc4035c1233dfd039467"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==========================
const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const rankingEl = document.getElementById("ranking");
const nameInput = document.getElementById("nameInput");

const MAX = 25;
let current = 1;
let startTime = null;
let playing = false;

// ==========================
// グリッド生成
// ==========================
function createGrid() {
  grid.innerHTML = "";
  current = 1;
  startTime = null;

  const nums = Array.from({ length: MAX }, (_, i) => i + 1);
  nums.sort(() => Math.random() - 0.5);

  nums.forEach(num => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = num;

    cell.addEventListener("click", () => {
      if (!playing) return;
      if (Number(cell.textContent) !== current) return;

      if (current === 1) {
        startTime = Date.now();
      }

      cell.classList.add("done");
      current++;

      if (current > MAX) {
        playing = false;
        const time = (Date.now() - startTime) / 1000;
        saveScore(time);
        alert(`クリア！ ${time.toFixed(2)} 秒`);
      }
    });

    grid.appendChild(cell);
  });
}

// ==========================
// ボタン
// ==========================
startBtn.addEventListener("click", () => {
  if (!nameInput.value.trim()) {
    alert("名前を入力して！");
    return;
  }
  createGrid();
  playing = true;
});

resetBtn.addEventListener("click", () => {
  createGrid();
  playing = false;
});

// ==========================
// Firestore（速い時だけ更新）
// ==========================
function saveScore(time) {
  const uid = getUID();
  const name = nameInput.value.trim();
  const newTime = Number(time.toFixed(2));
  const ref = db.collection("scores").doc(uid);

  ref.get().then(doc => {
    if (!doc.exists || newTime < doc.data().time) {
      ref.set({
        name,
        time: newTime,
        updatedAt: Date.now()
      }).then(loadRanking);
    } else {
      loadRanking();
    }
  });
}

// ==========================
function loadRanking() {
  rankingEl.innerHTML = "";

  db.collection("scores")
    .orderBy("time")
    .limit(10)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const d = doc.data();
        const li = document.createElement("li");
        li.textContent = `${d.name} — ${d.time} 秒`;
        rankingEl.appendChild(li);
      });
    });
}

// ==========================
function getUID() {
  let uid = localStorage.getItem("tap_uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("tap_uid", uid);
  }
  return uid;
}

// 初期表示
createGrid();
loadRanking();
