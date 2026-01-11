// Firebase config（そのまま）
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

const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const rankingEl = document.getElementById("ranking");
const nameInput = document.getElementById("nameInput");

let current = 1;
let startTime = null;
let playing = false;

const MAX = 25;

// ===== ゲーム生成 =====
function createGrid() {
  grid.innerHTML = "";
  current = 1;
  playing = false;
  startTime = null;

  const numbers = Array.from({ length: MAX }, (_, i) => i + 1);
  numbers.sort(() => Math.random() - 0.5);

  numbers.forEach(num => {
    const div = document.createElement("div");
    div.className = "cell";
    div.textContent = num;

    div.onclick = () => {
      if (!playing) return;
      if (Number(div.textContent) !== current) return;

      if (current === 1) startTime = Date.now();

      div.classList.add("disabled");
      div.textContent = "";
      current++;

      if (current > MAX) {
        const time = (Date.now() - startTime) / 1000;
        playing = false;
        saveScore(time);
        alert(`クリア！ ${time.toFixed(2)} 秒`);
      }
    };

    grid.appendChild(div);
  });
}

// ===== ボタン =====
startBtn.onclick = () => {
  if (!nameInput.value.trim()) {
    alert("名前を入力して！");
    return;
  }
  playing = true;
};

resetBtn.onclick = createGrid;

// ===== ランキング保存（速い時だけ）=====
function saveScore(time) {
  const uid = getUID();
  const newTime = Number(time.toFixed(2));
  const name = nameInput.value.trim();
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

// ===== ランキング表示 =====
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

// ===== 端末ID =====
function getUID() {
  let uid = localStorage.getItem("tap_uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("tap_uid", uid);
  }
  return uid;
}

// 初期化
createGrid();
loadRanking();
