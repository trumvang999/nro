const CHAT_API = "https://index.nro2024.workers.dev";

function getAvatar(planet) {
  switch (planet) {
    case "Trái Đất": return "https://forum.ngocrongonline.com/avatar/small1475.png";
    case "Namek": return "https://forum.ngocrongonline.com/avatar/small3932.png";
    case "Xayda": return "https://forum.ngocrongonline.com/avatar/small5339.png";
    default: return "https://www.pngplay.com/wp-content/uploads/12/Goku-No-Background.png";
  }
}

async function sendChat() {
  const input = document.getElementById("chatText");
  const msg = input.value.trim();
  if (!msg) return;

  const userId = localStorage.getItem("accountId");
  const name = localStorage.getItem("characterName");
  const planet = localStorage.getItem("characterPlanet");

  if (!userId || !name) {
    alert("Vui lòng đăng nhập hoặc tạo nhân vật");
    return;
  }

  const chatObj = {
    userId,
    name,
    planet,
    msg,
    time: new Date().toLocaleTimeString()
  };

  await fetch(`${CHAT_API}/chat/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chatObj)
  });

  input.value = "";
  loadChat();
}

async function loadChat() {
  const res = await fetch(`${CHAT_API}/chat/load`);
  const data = await res.json();

  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = "";
  const myId = localStorage.getItem("accountId");

const chats = (Array.isArray(data.chat) ? data.chat : []).sort(
  (a, b) => a.created_at - b.created_at
);

chats.forEach(c => {
  const isSelf = c.user === myId; // <- dùng c.user thay vì c.userId
  const div = document.createElement("div");
  div.className = "msg " + (isSelf ? "self" : "other");
  div.innerHTML = `
    <div class="avatar">
      <img src="${getAvatar(c.planet)}" alt="${c.planet}" />
    </div>
    <div id="msg-self">
      <div class="sender">${c.name}</div>
      <div>${c.msg}</div>
      <span class="time">${c.time}</span>
    </div>
  `;
  chatMessages.appendChild(div);
});

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById("chatSendBtn").addEventListener("click", sendChat);
document.getElementById("chatText").addEventListener("keypress", e => {
  if (e.key === "Enter") sendChat();
});
setInterval(loadChat, 5000); // tự động refresh chat


  function toggleBox(id) {
  document.querySelectorAll(".popup-box").forEach(box => box.classList.add("hidden"));
  document.getElementById(id).classList.toggle("hidden");
}

  function toggleGuideItem(id) {
  document.getElementById("guide-" + id).classList.toggle("hidden");
}

let goldHidden = false;

function updateGold(goldBalance) {
  document.getElementById("goldAmount").textContent = fmt(goldBalance);
  // Khi ẩn thì chỉ update số thật, span *** vẫn giữ nguyên
}

document.getElementById("toggleGoldBtn").addEventListener("click", () => {
  const show = document.getElementById("goldAmount");
  const hide = document.getElementById("goldAmountHide");
  const icon = document.querySelector("#toggleGoldBtn i");

  goldHidden = !goldHidden;

  if (goldHidden) {
    show.style.display = "none";
    hide.style.display = "inline";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    show.style.display = "inline";
    hide.style.display = "none";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});



(function(){
  // DOM base (HTML bạn đã có)
  const disk = document.querySelector('.disk');
  const resultEl = document.getElementById('result');
  const betButtons = document.querySelectorAll('.bet-btn');
  const numButtons = document.querySelectorAll('.num');
  const betAmountEl = document.getElementById('betAmount');
  const placeBetBtn = document.getElementById('placeBet');
  const container = document.querySelector('.container');
  const API_URL = "https://doan-so.nro2024.workers.dev";


 function createAuxUI() {
  // status bar (countdown + roundName + kết quả trước)
  if (!document.getElementById('statusBar').hasChildNodes()) {
    const sb = document.getElementById('statusBar');
    sb.style.display = 'flex';
    sb.style.justifyContent = 'center';
    sb.style.gap = '12px';
    sb.style.alignItems = 'center';
    sb.style.marginTop = '20px';

    sb.innerHTML = `
      <div class="stabar">
        <div style="font-size:12px;color:#8fb4c9">Mã phiên</div>
        <div id="roundName" style="font-weight:700">—</div>
      </div>
      <div class="stabar">
        <div style="font-size:12px;color:#8fb4c9">Đếm ngược</div>
        <div id="countdown" style="font-weight:800;color:#00fc0a">00:60</div>
      </div>
      <div class="stabar">
        <div style="font-size:12px;color:#8fb4c9">Kết quả trước</div>
        <div id="fetchedNumberSmall" style="font-weight:700;color:#ffba00">—</div>
      </div>
    `;
  }

  // bảng kết quả gần đây
  if (!document.getElementById('resultsTableWrapper').hasChildNodes()) {
    const wrap = document.getElementById('resultsTableWrapper');
    wrap.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px">Kết quả gần đây</div>
      <table id="resultTable">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 10px">Mã phiên</th>
            <th style="text-align:left;padding:8px 10px">Kết quả</th>
            <th style="text-align:left;padding:8px 10px">Số cuối</th>
            <th style="text-align:left;padding:8px 10px">Loại</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
  }
}

// chạy khi load trang
createAuxUI();

// internal state (only temporary UI state)
let goldBalance = 0; // chỉ dùng để hiển thị UI hiện tại
const API_WORKER = "https://doan-so.nro2024.workers.dev"; // không có slash cuối
const API_MAIN = "https://index.nro2024.workers.dev"; 


 async function persistToServer(accountId, username, password, key, value) {
  try {
    const res = await fetch(`${API_MAIN}/persist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId,
        username,
        password,
        key,
        value
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Persist failed");
    }

    console.log(`[SYNC OK] ${key} synced to server`);
  } catch (e) {
    console.warn(`[SYNC ERROR] ${key}:`, e.message);
  }
}

async function syncAllData() {
  const accountId = localStorage.getItem("accountId");
  const currentUser = localStorage.getItem("currentUser");
  const currentPass = localStorage.getItem("currentPass");

  if (!accountId || !currentUser || !currentPass) {
    console.warn("Sai thông tin");
    return;
  }

  try {
    const keys = ["goldBalance", "giftUsed"];

    for (const key of keys) {
      let value;
      try {
        const raw = localStorage.getItem(`${key}_${accountId}`);
        value = raw ? JSON.parse(raw) : null;
      } catch {
        value = null;
      }

      if (value !== null) {
        await persistToServer(accountId, currentUser, currentPass, key, value);
      }
    }
  } catch (err) {
    console.warn("syncAllData error:", err);
  }
}

// lấy round trực tiếp từ backend
async function loadRoundName() {
  try {
    const resp = await fetch(`${API_WORKER}/random`, { cache: "no-cache" });
    const data = await resp.json();
    if (data && data.round) {
      roundName = data.round;
      return roundName;
    }
  } catch (e) {
    console.error("Load roundName failed", e);
  }
  // fallback nếu lỗi

}

  // helpers
  function makeId(){ return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8); }
  function fmt(n){ return new Intl.NumberFormat().format(n); }

// --- persist ---
const currentUser = localStorage.getItem("currentUser");

async function loadgoldBalance() {
  const accountId = localStorage.getItem("accountId");
  if (!accountId) {
    goldBalance = 0;
    rendergoldBalance();
    return;
  }

  try {
    const res = await fetch(`${API_MAIN}/character/load?account=${accountId}`);
    const data = await res.json();

    goldBalance = data.character?.balance ?? 0;
  } catch (e) {
    console.warn("loadgoldBalance error:", e);
    goldBalance = 0;
  }

  rendergoldBalance();
}


// 💾 Cập nhật goldBalance của user lên server (bỏ localStorage)
async function savegoldBalance() {
  const accountId = localStorage.getItem("accountId");
  if (!accountId) return;

  try {
    // Gửi lên server để cập nhật (nguồn dữ liệu thật)
    await fetch(`${API_MAIN}/character/update-goldBalance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, goldBalance })
    });
  } catch (e) {
    console.warn("Server update goldBalance failed", e);
  }

  // Cập nhật lại hiển thị UI
  rendergoldBalance();
}

// 💡 Hiển thị goldBalance ra UI
function rendergoldBalance() {
  const span = document.getElementById("goldAmount");
  if (span) span.textContent = fmt(goldBalance);
}


// mở popup
document.getElementById("exchangeGoldBtn").addEventListener("click", () => {
  document.getElementById("exchangePopup").style.display = "block";
});

// đóng popup
document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("exchangePopup").style.display = "none";
});

// chuyển tab
document.querySelectorAll(".tab-link").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(tab => tab.style.display = "none");
    document.getElementById("tab-" + btn.dataset.tab).style.display = "block";
  });
});

async function loadResultHistory() {
  const res = await fetch(`${API_WORKER}/history`);
  const data = await res.json();
  resultHistory = Array.isArray(data) ? data.slice(-5) : [];
  renderResultTable();
}

function showBetNotice(msg, success = true) {
  const notice = document.getElementById("betNotice");
  if (!notice) return;

  notice.textContent = msg;
  notice.style.background = success ? "#4caf50" : "#f44336"; // xanh nếu ok, đỏ nếu lỗi
  notice.style.display = "block";

  setTimeout(() => {
    notice.style.display = "none";
  }, 2500); // tự ẩn sau 2.5s
}

  function renderResultTable(){
    const tbody = document.querySelector('#resultTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    for(const r of resultHistory.slice().reverse()){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        				<td style="padding:8px 10px;font-weight:600">${r.round || '—'}</td>
                      <td style="padding:8px 10px;">${r.number}</td>
                      <td style="padding:8px 10px;">${r.lastDigit}</td>
                      <td style="padding:8px 10px;color:#8fb4c9">${r.classification}</td>`;
      tbody.appendChild(tr);
    }
  }


  function labelType(code, digit=null){
    if(code === 'big') return 'Tài';
    if(code === 'small') return 'Xỉu';
    if(code === 'odd') return 'Lẻ';
    if(code === 'even') return 'Chẵn';
    if(code === 'digit' || code === 'number') return 'Số ' + digit;
    return code;
  }

  // classify & check
  function classifyLastDigit(d){
    const bigSmall = d >= 5 ? 'Tài' : 'Xỉu';
    const oddEven = (d % 2 === 0) ? 'Chẵn' : 'Lẻ';
    return {bigSmall, oddEven};
  }
  function checkBet(betType, lastDigit, digit = null){
    const cls = classifyLastDigit(lastDigit);
    if(betType === 'big') return cls.bigSmall === 'Tài';
    if(betType === 'small') return cls.bigSmall === 'Xỉu';
    if(betType === 'odd') return cls.oddEven === 'Lẻ';
    if(betType === 'even') return cls.oddEven === 'Chẵn';
    if(betType === 'digit' || betType === 'number') return lastDigit === digit;
    return false;
  }

  // fetch or simulate result
async function fetchResult() {
  const resp = await fetch(`${API_WORKER}/random`, {cache:"no-cache"});
  const data = await resp.json();
  return { number: data.number, round: data.round, time: data.time };
}

// Tab switching logic
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    // toggle active button
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    // ẩn/hiện bảng
    const target = btn.dataset.target;
    document.getElementById("pendingTableWrapper").style.display = "none";
    document.getElementById("betHistoryWrapper").style.display = "none";
    document.getElementById(target).style.display = "block";
  });
});


function showResultOnDisk(value){
  disk.classList.add('spin');
  setTimeout(()=>{
    resultEl.textContent = value; // cập nhật số trong đĩa
    disk.classList.remove('spin');
  }, 1200);
}
function renderRound(){
  const rn = document.getElementById('roundName');
  if(rn) rn.textContent = roundName || '—';
}

// ---------- Handle new round ----------
async function handleNewResult(res) {
  if (!res) res = await fetchResult();
  if (!res || !res.number || !res.round) {
    console.warn("null");
    return;
  }

  const numStr = String(res.number).replace(/[^0-9]/g, '');
  const lastDigit = numStr ? Number(numStr.slice(-1)) : null;
  const cls = lastDigit != null 
    ? classifyLastDigit(lastDigit) 
    : { bigSmall: '—', oddEven: '—' };

  setTimeout(() => {
    showResultOnDisk(res.number);
    setTimeout(() => { canOpen = true; }, 1200);
  }, 0);

  resultHistory.push({
    time: res.time,
    round: res.round,
    number: res.number,
    lastDigit,
    classification: `${cls.bigSmall}/${cls.oddEven}`
  });
  while (resultHistory.length > 5) resultHistory.shift();
  renderResultTable();

  roundName = res.round;
  renderRound();

  try {
    const resp = await fetch(`${API_MAIN}/settle-round`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        round: res.round,
        lastDigit,
        classification: `${cls.bigSmall}/${cls.oddEven}`
      })
    });
    const data = await resp.json();

    if (data.ok) {
      console.log(`✅ Settle ok`);
    } else {
      console.warn("⚠️ Settle failed:", data.error);
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi settle-round:", err);
  }
}

function statusClass(status) {
  if (!status) return "status-cho";
  const s = status.toLowerCase();
  if (s.includes("won")) return "status-thang";
  if (s.includes("lost")) return "status-thua";
  return "status-cho";
}

function statusText(status) {
  if (!status) return "Chờ";
  const s = status.toLowerCase();
  if (s.includes("won")) return "Thắng";
  if (s.includes("lost")) return "Thua";
  return "Chờ";
}

let currentRem = 0;
let nextTickAt = 0;

function startCountdown() {
  nextTickAt = Date.now() - (Date.now() % 60000) + 60000 + 2000;

  let hasClosedDisk = false;
  let hasHandledResult = false;
  let isWaitingNextRound = false;

  async function tick() {
    const now = Date.now();
    let rem = Math.max(0, Math.round((nextTickAt - now) / 1000));
    currentRem = rem;

    // hiển thị countdown lên UI
    const mm = String(Math.floor(rem / 60)).padStart(2, "0");
    const ss = String(rem % 60).padStart(2, "0");
    const cd = document.getElementById("countdown");
    if (cd) cd.textContent = mm + ":" + ss;

    // Đóng disk 1 lần khi rem <= 48
    if (rem <= 48 && !hasClosedDisk) {
      closeDisk();
      canOpen = false;
      hasClosedDisk = true;

      const small = document.getElementById("fetchedNumberSmall");
      if (small && resultHistory.length > 0) {
        small.textContent = resultHistory[resultHistory.length - 1].number;
      }
    }

    // Xử lý kết quả ngay khi countdown về 0
    if (rem <= 0 && !hasHandledResult) {
      hasHandledResult = true;

      await handleNewResult();     // show kết quả
      await loadgoldBalance();     // cập nhật số dư
      await loadBetHistory();      // cập nhật cược

      // Sau 10 giây mới lấy phiên mới
      if (!isWaitingNextRound) {
        isWaitingNextRound = true;

        setTimeout(async () => {
          const rn = await getCurrentRound(); // fetch round mới
          roundName = rn.round;
          renderRound();
          await checkPending();
          nextTickAt = rn.time + 60000;

          // reset flags
          hasClosedDisk = false;
          hasHandledResult = false;
          isWaitingNextRound = false;
        }, 10000);
      }
    }

    setTimeout(tick, 1000);
  }

  tick();
}
  
  function updateCountdownOnce(nextTickAt){
    const rem = Math.max(0, Math.round((nextTickAt - Date.now())/1000));
    const mm = String(Math.floor(rem/60)).padStart(2,'0');
    const ss = String(rem%60).padStart(2,'0');
    const cd = document.getElementById('countdown');
    if(cd) cd.textContent = mm + ':' + ss;
  }

const mapType = { chan:'even', le:'odd', tai:'big', xiu:'small' };
const typeToGroup = { even:'parity', odd:'parity', big:'size', small:'size', digit:'digit' };

let currentSelection = { type:null, digit:null, group:null };

// --- xử lý cho nút chẵn/lẻ/tài/xỉu ---
betButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const raw = btn.dataset.type;         // 'chan','le','tai','xiu'
    const canonical = mapType[raw];
    const group = typeToGroup[canonical];

    // Clear tất cả trước
    betButtons.forEach(b=>b.classList.remove('active'));
    numButtons.forEach(n=>n.classList.remove('active'));

    // chọn mới
    btn.classList.add('active');
    currentSelection = { type:canonical, digit:null, group };
  });
});

// --- xử lý cho nút số ---
numButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // Clear tất cả trước
    betButtons.forEach(b=>b.classList.remove('active'));
    numButtons.forEach(n=>n.classList.remove('active'));

    // chọn số mới
    btn.classList.add('active');
    currentSelection = { type:'digit', digit:Number(btn.textContent.trim()), group:'digit' };
  });
});

// ---------- Get current round ----------
async function getCurrentRound() {
  try {
    const resp = await fetch(API_URL + "/random", { cache: "no-cache" });
    const data = await resp.json();
    return data; // ✅ trả nguyên object {round, time, number,...}
  } catch (e) {
    console.error("getCurrentRound error", e);
    return null;
  }
}
  
// ---------- Load bet history from server ----------
async function loadBetHistory() {
  try {
    const accountId = localStorage.getItem("accountId");
    if (!accountId) return;

    const res = await fetch(`${API_MAIN}/bet/history?accountId=${accountId}`);
    const data = await res.json();

    if (data.ok && Array.isArray(data.data)) {
      // Tách pending và finished
      const pending = data.data.filter(b => b.status === "pending");
      const finished = data.data.filter(b => b.status !== "pending");

      renderPending(pending);
      renderBetHistory(finished);
    } else {
      console.warn("Không có dữ liệu cược từ server");
      renderPending([]);
      renderBetHistory([]);
    }
  } catch (err) {
    console.error("Không load được lịch sử cược:", err);
    renderPending([]);
    renderBetHistory([]);
  }
}

// ---------- Render bảng Đang Cược ----------
function renderPending(pendingData = []) {
  const table = document.querySelector("#pendingTable tbody");
  if (!table) return;

  const rowsPerPage = Number(document.getElementById("rowsPerPagePending").value || 5);
const sliced = pendingData.slice(0, rowsPerPage);

  if (!sliced.length) {
    table.innerHTML = `
      <tr><td colspan="4" style="text-align:center;color:#999;padding:10px">
        Chưa có cược đang chờ nào
      </td></tr>`;
    return;
  }

  table.innerHTML = sliced.map(b => `
    <tr>
      <td>${b.round}</td>
      <td>${labelType(b.bet_type, b.bet_digit)}</td>
      <td>${Number(b.amount).toLocaleString()}</td>
      <td>${statusText(b.status)}</td>
    </tr>
  `).join("");
}

// ---------- Render bảng Lịch Sử Cược ----------
function renderBetHistory(historyData = []) {
  const table = document.querySelector("#betHistoryTable tbody");
  if (!table) return;

  const rowsPerPage = Number(document.getElementById("rowsPerPage").value || 5);
  const sliced = historyData.slice(0, rowsPerPage);


  if (!sliced.length) {
    table.innerHTML = `
      <tr><td colspan="6" style="text-align:center;color:#999;padding:10px">
        Chưa có lịch sử đặt cược
      </td></tr>`;
    return;
  }

  table.innerHTML = sliced.map(b => `
    <tr>
      <td>${b.round}</td>
      <td>${labelType(b.bet_type, b.bet_digit)}</td>
      <td>${Number(b.amount).toLocaleString()}</td>
      <td>${b.result_digit ?? "-"}</td>
      <td class="${statusClass(b.status)}">${statusText(b.status)}</td>
      <td>${b.win_amount ? Number(b.win_amount).toLocaleString() : "-"}</td>
    </tr>
  `).join("");
}
  
  function formatTime(created_at) {
  if (!created_at) return "-";

  // thử số
  const num = Number(created_at);
  if (!isNaN(num)) return new Date(num).toLocaleString("vi-VN", { hour12:false });

  // thử Date string
  const d = new Date(created_at);
  if (!isNaN(d)) return d.toLocaleString("vi-VN", { hour12:false });

  // fallback raw
  return created_at;
}

// ---------- Lịch sử giao dịch ----------
async function loadHistory() {
  const accountId = localStorage.getItem("accountId");
  const tbody = document.querySelector("#goldHistory tbody");
  if (!tbody) return;

  if (!accountId) {
    tbody.innerHTML = `<tr><td colspan="6">Không tìm thấy tài khoản</td></tr>`;
    return;
  }

  try {
    const API = "https://index.nro2024.workers.dev";
    const res = await fetch(`${API}/transactions?accountId=${accountId}`);
    const data = await res.json();

    if (!data.ok || !Array.isArray(data.data) || data.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có giao dịch</td></tr>`;
      return;
    }

    // ======= Từ điển dịch =======
    const typeMap = {
      DEPOSIT: "Nạp",
      WITHDRAW: "Rút",
      BET: "Đặt cược",
      WIN: "Thắng",
      LOSE: "Thua",
    };

    const noteMap = {
      gift_redeem: "Đổi quà",
      place_bet: "Đặt cược",
      settle_round: "Kết quả vòng",
    };

    // ======= Hàm định dạng thời gian =======
    function formatTime(ms) {
      if (!ms) return "-";
      return new Date(Number(ms)).toLocaleString("vi-VN", {
        hour12: false,
      });
    }

    // ======= Hiển thị =======
    tbody.innerHTML = "";
    data.data.forEach(tx => {
      const row = document.createElement("tr");
      const cls = (tx.type || "").toLowerCase();

      const typeText = typeMap[tx.type?.toUpperCase()] || tx.type || "-";
      const noteText = noteMap[tx.note] || tx.note || "";

      row.innerHTML = `
        <td class="${cls}">${typeText}</td>
        <td>${Number(tx.amount || 0).toLocaleString("vi-VN")}</td>
        <td>${tx.balance_before != null ? tx.balance_before.toLocaleString("vi-VN") : "-"}</td>
        <td>${tx.balance_after != null ? tx.balance_after.toLocaleString("vi-VN") : "-"}</td>
        <td>${noteText}</td>
        <td>${formatTime(tx.created_at)}</td>
      `;

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("💥 loadHistory error:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Lỗi khi tải lịch sử</td></tr>`;
  }
}

// Gọi hàm ngay khi load
document.addEventListener("DOMContentLoaded", () => loadHistory());
</script>
  
// ---------- Load bảng xếp hạng ----------
async function loadRank() {
  const tbody = document.querySelector("#rankTable tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Đang tải...</td></tr>`;

  try {
    const API = typeof API_MAIN !== 'undefined' ? API_MAIN : "https://index.nro2024.workers.dev";
    const res = await fetch(`${API}/rank`);
    const data = await res.json();

    if (!data.ok || !Array.isArray(data.data) || data.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Chưa có dữ liệu</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    data.data.forEach((item, index) => {
      const tr = document.createElement("tr");
      const rank = index + 1;
      let icon = `<span class="rank-num">${rank}</span>`; // mặc định hiển thị số

      // top 3 có huy chương màu
      if (rank === 1) icon = `<i class="fas fa-award gold"></i><span class="rank-num">1</span>`;
      else if (rank === 2) icon = `<i class="fas fa-award silver"></i><span class="rank-num">2</span>`;
      else if (rank === 3) icon = `<i class="fas fa-award bronze"></i><span class="rank-num">3</span>`;

      tr.innerHTML = `
        <td>${icon}</td>
        <td>${item.name || "Unknown"}</td>
        <td>${Number(item.balance || 0).toLocaleString("vi-VN")}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("💥 loadRank error:", err);
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Lỗi tải dữ liệu</td></tr>`;
  }
}

// ---------- Event khi mở popup ----------
const rankBox = document.getElementById("rankBox");
if(rankBox) {
  // giả lập khi popup hiển thị, gọi loadRank
  const openBtn = document.querySelector("#openRankBtn"); // nút mở popup
  if(openBtn){
    openBtn.addEventListener("click", () => {
      rankBox.style.display = "block";
      loadRank();
    });
  }
}

// Hoặc gọi trực tiếp khi page load (tùy bạn muốn)
document.addEventListener("DOMContentLoaded", loadRank);

// ---------- Check ----------
async function checkPending() {
  const accountId = localStorage.getItem("accountId");
  if (!accountId) return;

  try {
    const res = await fetch(`${API_MAIN}/bet/history?accountId=${accountId}`);
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.data)) return;

    const pending = data.data.filter(b => b.status === "pending");
    if (pending.length === 0) return;

    for (const bet of pending) {
      console.log("Pending round:", bet.round);

      // Lấy kết quả phiên đó
      const resRound = await fetch(`${API_WORKER}/result?round=${bet.round}`);
      const roundData = await resRound.json();
      if (!roundData.ok || !roundData.number) continue;

      const numStr = String(roundData.number).replace(/[^0-9]/g, "");
      const lastDigit = Number(numStr.slice(-1));
      const cls = lastDigit >= 5 ? "Tài" : "Xỉu";
      const oe = lastDigit % 2 === 0 ? "Chẵn" : "Lẻ";
      const classification = `${cls}/${oe}`;

      // Gửi settle-round
      await fetch(`${API_MAIN}/settle-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round: bet.round,
          lastDigit,
          classification
        })
      });

      console.log(`✅ Settled old round ${bet.round}`);
    }
  } catch (err) {
    console.warn("checkPending error:", err);
  }
}

// ---------- Place bet ----------
placeBetBtn.addEventListener("click", async () => {
  const actives = document.querySelectorAll(".bet-btn.active, .num.active");
  if (actives.length === 0) return alert("Bạn chưa chọn cửa cược nào.");
  if (actives.length > 1) return alert("Chỉ được chọn 1 cửa mỗi lần cược!");

  const type = currentSelection.type;
  const digit = currentSelection.digit;
  const amount = Math.max(1, Math.floor(Number(betAmountEl.value) || 0));
  if (!type) return alert("Chưa chọn loại cược");
  if (amount < 100) return alert("Đặt tối thiểu 100 vàng.");
  if (amount > goldBalance) return alert("Không đủ vàng.");
  if (currentRem <= 3) return alert("Đã hết thời gian, vui lòng chờ phiên sau");

  const rn = await getCurrentRound();
  if (!rn?.round) return alert("Không lấy được phiên");

  const accountId = localStorage.getItem("accountId");
  if (!accountId) return alert("Chưa đăng nhập");

  try {
    // 🪙 Gửi cược lên server — server sẽ trừ vàng và trả lại số dư mới
    const res = await fetch(`${API_MAIN}/bet/place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId,
        round: rn.round,
        type,
        digit,
        amount
      })
    });

    const data = await res.json();

    if (data.ok) {
      // ✅ Cập nhật vàng từ server (newBalance)
      if (typeof data.newBalance !== "undefined") {
        goldBalance = data.newBalance;
        rendergoldBalance();
      } else {
        await loadgoldBalance();
      }

      showBetNotice("Đặt cược thành công!");
      await loadBetHistory();
    } else {
      alert("❌ Lỗi đặt cược: " + (data.error || "Không xác định"));
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi mạng, vui lòng thử lại.");
  }
});


// ---------- Initial Load ----------
async function init() {
  await loadgoldBalance();     // lấy số vàng từ D1
  await loadResultHistory();   // lấy lịch sử kết quả từ doan-so worker
  await loadBetHistory();      // ✅ lấy lịch sử cược từ DB server
  renderResultTable();         // cập nhật bảng kết quả

  // load round hiện tại từ backend
  const rn = await getCurrentRound();
  roundName = rn?.round || "—";
  renderRound();

  // show latest result ngay nếu có
  if (resultHistory.length > 0) {
    const latest = resultHistory[resultHistory.length - 1];
    resultEl.textContent = latest.number;
    const small = document.getElementById('fetchedNumberSmall');
    if (small) small.textContent = latest.number;
  }

  // start countdown dựa trên backend
  if (resultHistory.length > 0) {
    const latest = resultHistory[resultHistory.length - 1];
    startCountdown(latest.time + 50000); // 50s chạy ngầm, 10s show kết quả
  } else {
    startCountdown();
  }
}

init().catch(err => console.error('init failed', err));


  // expose for debug
  window._demo = { getState: ()=>({goldBalance, pendingBets, resultHistory, betHistory}) };

})();
 let canOpen = false; // chỉ cho mở khi countdown = 0:00

(function() {
  const cover = document.getElementById('coverDisk');
  let isDragging = false;
  let startY = 0;

  function tryOpen(deltaY){
    if (!canOpen) {
      cover.style.transform = ''; // nếu chưa được phép thì không mở
      return;
    }
    if (deltaY < -80) {
      cover.classList.add('revealed');
    } else {
      cover.style.transform = '';
    }
  }

  cover.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    cover.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !canOpen) return;
    const deltaY = e.clientY - startY;
    if (deltaY < 0) {
      cover.style.transform = `translateY(${deltaY}px)`;
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    cover.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
    tryOpen(e.clientY - startY);
  });

 // hỗ trợ cảm ứng
cover.addEventListener('touchstart', (e) => {
  isDragging = true;
  startY = e.touches[0].clientY;
  cover.style.transition = 'none';
}, { passive: false });

cover.addEventListener('touchmove', (e) => {
  if (!isDragging || !canOpen) return;
  const deltaY = e.touches[0].clientY - startY;
  if (deltaY < 0) {
    e.preventDefault(); // chặn cuộn trang
    cover.style.transform = `translateY(${deltaY}px)`;
  }
}, { passive: false });

cover.addEventListener('touchend', (e) => {
  if (!isDragging) return;
  isDragging = false;
  cover.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
  tryOpen(e.changedTouches[0].clientY - startY);
}, { passive: false });
})();

function closeDisk(){
  const cover = document.getElementById('coverDisk');
  if(!cover) return;
  cover.classList.remove('revealed');
  cover.style.opacity = '1';
  cover.style.transform = 'translateY(0)';
}
