async function sendChat() {
  const input = document.getElementById("chatText");
  const msg = input.value.trim();
  if (!msg) return;

 // Lấy thông tin người dùng từ localStorage
const user = localStorage.getItem("currentUser");

// Nếu chưa có người dùng, thông báo và dừng
if (!user) {
  alert("Vui lòng đăng nhập");
  throw new Error("Chưa đăng nhập"); // ngăn chặn tiếp tục
}


// Tạo object chat
const chatObj = {
  user,                   // tên user
  msg,                    // tin nhắn
  time: new Date().toLocaleTimeString() // thời gian hiện tại
};

  await fetch("https://doan-so.nro2024.workers.dev/chat/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chatObj)
  });

  input.value = "";
  loadChat();
}

async function loadChat() {
  const res = await fetch("https://doan-so.nro2024.workers.dev/chat/load");
  const chatHistory = await res.json();

  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = "";
  const currentUser = localStorage.getItem("currentUser");

  chatHistory.forEach(c => {
    const div = document.createElement("div");
    div.className = "msg " + (c.user === currentUser ? "self" : "other");
    div.innerHTML = `
      <div class="avatar"></div>
      <div id="msg-self">
        <div class="sender">${c.user}</div>
        <div>${c.msg}</div>
        <span class="time">${c.time}</span>
      </div>
    `;
    chatMessages.appendChild(div);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Khi trang load thì load chat

// Gắn sự kiện cho nút gửi
document.getElementById("chatSendBtn").addEventListener("click", sendChat);

// Gửi khi nhấn Enter
document.getElementById("chatText").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    sendChat();
  }
});

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
let roundName = null; 
const API_WORKER = "https://doan-so.nro2024.workers.dev"; // không có slash cuối
const API_MAIN = "https://index.nro2024.workers.dev"; 


  async function persistToServer(accountId, key, value) {
  try {
    const res = await fetch(`${API_MAIN}/persist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, key, value })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "persist failed");

      } catch (e) {
    console.warn(`[SYNC ERROR] ${key}:`, e.message);
  }
}

  async function syncAllData() {
  const accountId = localStorage.getItem("accountId");
  if (!accountId) return;
    

  try {
const keys = ["goldBalance", "giftUsed"];

    for (const key of keys) {
      let value;
      try {
        value = localStorage.getItem(`${key}_${accountId}`);
        if (value) value = JSON.parse(value);
      } catch { value = null; }

      if (value !== null) {
        await persistToServer(accountId, key, value);
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

// nạp vàng
document.getElementById("depositBtn").addEventListener("click", () => {
  const amount = parseInt(document.getElementById("goldInputDeposit").value, 10) || 0;
  if(amount > 0){
    goldBalance += amount;
savegoldBalance();
syncAllData();
    rendergoldBalance();
    addHistory("Nạp", amount);
    alert("Đã nạp " + amount + " vàng!");
  }
});

// rút vàng
document.getElementById("withdrawBtn").addEventListener("click", () => {
  const amount = parseInt(document.getElementById("goldInputWithdraw").value, 10) || 0;
  if(amount > 0 && goldBalance >= amount){
goldBalance -= amount;
savegoldBalance();
syncAllData();
    rendergoldBalance();
    addHistory("Rút", amount);
    alert("Đã rút " + amount + " vàng!");
  } else {
    alert("Số vàng không hợp lệ hoặc không đủ!");
  }
});

// thêm lịch sử
function addHistory(type, amount){
  const ul = document.getElementById("goldHistory");
  if(ul.querySelector("li") && ul.querySelector("li").textContent === "Chưa có giao dịch"){
    ul.innerHTML = "";
  }
  const li = document.createElement("li");
  li.textContent = type + " " + amount + " vàng";
  ul.prepend(li);
}

async function loadResultHistory() {
  const res = await fetch(`${API_WORKER}/history`);
  const data = await res.json();
  resultHistory = Array.isArray(data) ? data.slice(-5) : [];
  renderResultTable();
}

  // render pending text area (create if missing)
function renderPending(){
  const table = document.getElementById("pendingTable");
  if(!table) return;

  // số dòng hiển thị
  const rowsPerPage = Number(document.getElementById("rowsPerPagePending").value || 5);
  const recent = pendingBets.slice(-rowsPerPage).reverse();

  if(recent.length === 0){
    table.innerHTML = `
      <tr><td colspan="4" style="text-align:center;color:#999;padding:10px">
        Chưa có cược chờ nào
      </td></tr>`;
    return;
  }

  let html = `
    <tr>
      <th style="padding: 8px 10px;">Mã phiên</th>
      <th style="padding: 8px 10px;">Loại cược</th>
      <th style="padding: 8px 10px;">Số tiền</th>
      <th style="padding: 8px 10px;">Trạng thái</th>
    </tr>
  `;

  for(const b of recent){
    html += `
      <tr>
        <td style="padding: 8px 10px;">${b.round || "-"}</td>
        <td style="padding: 8px 10px;">${labelType(b.type,b.digit)}</td>
        <td style="padding: 8px 10px;">${b.amount}</td>
        <td style="padding: 8px 10px;"  class="${statusClass(b.status)}">${b.status}</td>
      </tr>
    `;
  }

  table.innerHTML = html;
}
document.getElementById("rowsPerPagePending").addEventListener("change", renderPending);

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

function renderBetHistory(){
  const table = document.getElementById("betHistoryTable");
  if(!table) return;

  if(betHistory.length === 0){
    table.innerHTML = `
      <tr><td colspan="6" style="text-align:center;color:#999;padding:10px">
        Chưa có lịch sử đặt cược
      </td></tr>`;
    return;
  }

  // lấy số dòng cần hiển thị từ dropdown
  const rowsPerPage = Number(document.getElementById("rowsPerPage").value);
  const recent = betHistory.slice(-rowsPerPage).reverse();

  let html = `
    <tr>
      <th>Mã phiên</th>
      <th>Loại cược</th>
      <th>Số tiền</th>
      <th>Kết quả</th>
      <th>Trạng thái</th>
      <th>Thưởng</th>
    </tr>
  `;

  for(const b of recent){
    html += `
      <tr>
        <td>${b.round || "?"}</td>
        <td>${labelType(b.type,b.digit)}</td>
        <td>${b.amount}</td>
        <td>${b.result ?? "-"}</td>
        <td class="${statusClass(b.status)}">${b.status}</td>
        <td>${b.payout}</td>
      </tr>
    `;
  }

  table.innerHTML = html;
}

document.getElementById("rowsPerPage").addEventListener("change", renderBetHistory);


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
  console.log(`✅ Round ${res.round} settled`);
  await loadgoldBalance(); // ✅ cập nhật vàng mới
}
 else {
      console.warn("⚠️ Settle failed:", data.error);
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi settle-round:", err);
  }
}

function statusClass(status) {
  if (!status) return "status-cho";
  const s = status.toLowerCase();
  if (s.includes("thắng")) return "status-thang";
  if (s.includes("thua")) return "status-thua";
  return "status-cho";
}

let currentRem = 0;
let resultShown = false;

// Hiển thị kết quả
function showResult(roundData) {
  const resultEl = document.getElementById("result");
  if (!resultEl) return;

  if (roundData.number !== null) {
    resultEl.textContent = `Round ${roundData.round}: Number ${roundData.number} | Last Digit: ${roundData.lastDigit} | Type: ${roundData.classification}`;
  } else {
    resultEl.textContent = `Round ${roundData.round}: Chưa có kết quả`;
  }
}

// Countdown chính
async function startCountdown() {
  // Lấy phiên hiện tại từ backend
  let data;
  try {
    const resp = await fetch(`${API_WORKER}/random`, { cache: "no-cache" });
    data = await resp.json();
    if (!data?.round) throw new Error("No round data");
  } catch (e) {
    console.error("Fetch round failed:", e);
    setTimeout(startCountdown, 3000); // retry nếu lỗi
    return;
  }

  resultShown = false;

  // tick countdown dựa trên data.time backend
  const tick = () => {
    const now = Date.now();
    let rem = Math.max(0, Math.round((data.time - now) / 1000));
    currentRem = rem;

    // hiển thị countdown
    const mm = String(Math.floor(rem / 60)).padStart(2, "0");
    const ss = String(rem % 60).padStart(2, "0");
    const cd = document.getElementById("countdown");
    if (cd) cd.textContent = mm + ":" + ss;

    // 12s trước hết vòng → đóng cược
    if (rem === 48) {
      closeDisk();
      canOpen = false;

      const small = document.getElementById("fetchedNumberSmall");
      if (small && resultHistory.length > 0) {
        small.textContent = resultHistory[resultHistory.length - 1].number;
      }
    }

    // khi countdown = 0 → xử lý kết quả backend
    if (rem <= 0 && !resultShown) {
      resultShown = true;
      showResult(data); // hiển thị kết quả backend

      // sau 2s → fetch phiên mới
      setTimeout(startCountdown, 2000);
      return; // dừng tick hiện tại
    }

    // lặp lại mỗi giây
    setTimeout(tick, 1000);
  };

  tick();
}

// Start countdown khi page load
document.addEventListener("DOMContentLoaded", () => {
  startCountdown();
});


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

    // Nếu đã chọn trong cùng nhóm mà khác cửa → chặn
    if (currentSelection.group === group && currentSelection.type !== canonical) {
      alert("Không được chọn");
      return;
    }

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
function renderPending(pendingData) {
  const table = document.querySelector("#pendingTable tbody");
  if (!table) return;

  if (pendingData.length === 0) {
    table.innerHTML = `
      <tr><td colspan="4" style="text-align:center;color:#999;padding:10px">
        Chưa có cược chờ nào
      </td></tr>`;
    return;
  }

  table.innerHTML = pendingData.map(b => `
    <tr>
      <td>${b.round}</td>
      <td>${labelType(b.bet_type, b.bet_digit)}</td>
      <td>${b.bet_amount.toLocaleString()}</td>
      <td>Đang xử lý</td>
    </tr>
  `).join('');
}

// ---------- Render bảng Lịch Sử Cược ----------
function renderBetHistory(historyData) {
  const table = document.querySelector("#betHistoryTable tbody");
  if (!table) return;

  if (historyData.length === 0) {
    table.innerHTML = `
      <tr><td colspan="6" style="text-align:center;color:#999;padding:10px">
        Chưa có lịch sử đặt cược
      </td></tr>`;
    return;
  }

  table.innerHTML = historyData.map(b => `
    <tr>
      <td>${b.round}</td>
      <td>${labelType(b.bet_type, b.bet_digit)}</td>
      <td>${b.bet_amount.toLocaleString()}</td>
      <td>${b.result ?? "-"}</td>
      <td class="${statusClass(b.status)}">${b.status}</td>
      <td>${b.payout ? b.payout.toLocaleString() : ""}</td>
    </tr>
  `).join('');
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
