// ==========================
// Firebase config（指定通り）
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
// ゲーム設定
// ==========================
const MAX = 25;

let current = 1;
let startTime = null;
let playing = false;

// ==========================
// DOM
// ==========================
const countEl = document.getElementById("count");
const gameEl = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const rankingEl = document.getElementById("ranking");

// ==========================
// ゲーム処理
// ==========================
startBtn.onclick = () => {
  current = 1;
  countEl.textContent = current;
  startTime = null;
  playing = true;
};

resetBtn.onclick = () => {
  current = 1;
  countEl.textContent = current;
  startTime = null;
  playing = false;
};

gameEl.onclick = () => {
  if (!playing) return;

  if (current === 1) {
    startTime = Date.now();
  }

  current++;

  if (current > MAX) {
    const time = (Date.now() - startTime) / 1000;
    saveScore(time);
    playing = false;
    alert(`記録: ${time.toFixed(2)} 秒`);
  } else {
    countEl.textContent = current;
  }
};

// ==========================
// Firestore
// ==========================
function saveScore(time) {
  const uid = getUID();

  db.collection("scores").doc(uid).set({
    time: Number(time.toFixed(2)),
    updatedAt: Date.now()
  }).then(loadRanking);
}

function loadRanking() {
  rankingEl.innerHTML = "";

  db.collection("scores")
    .orderBy("time")
    .limit(10)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const li = document.createElement("li");
        li.textContent = doc.data().time + " 秒";
        rankingEl.appendChild(li);
      });
    });
}

// ==========================
// 1端末1回用ID
// ==========================
function getUID() {
  let uid = localStorage.getItem("tapgame_uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("tapgame_uid", uid);
  }
  return uid;
}

// 初回ロード
loadRanking();
