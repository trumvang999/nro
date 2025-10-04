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

const VALID_GIFT_CODES = { "NRO2024": 1000 };

function redeemGiftcode(code){
  if(!currentUser){ alert("Vui lòng đăng nhập."); return; }
  const normalized = code.trim().toUpperCase();
  if(!VALID_GIFT_CODES[normalized]){ alert("Giftcode sai."); return; }

  const keyRedeem = `giftRedeemed_${currentUser}_${normalized}`;
  if(localStorage.getItem(keyRedeem)){ alert("Đã nhận rồi."); return; }

  balance += VALID_GIFT_CODES[normalized];
  saveBalance();
  localStorage.setItem(keyRedeem, "1");
  alert(`Nhận ${VALID_GIFT_CODES[normalized]} vàng!`);
}

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
window.addEventListener("load", () => {
  loadChat();
  // Auto refresh chat mỗi 3 giây
  setInterval(loadChat, 3000);
});
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

function updateGold(balance) {
  document.getElementById("goldAmount").textContent = "Vàng: " + fmt(balance);
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


  // internal state
  let balance = 0;
  let pendingBets = []; // {id, type, amount, digit, placedAt}
  let resultHistory = []; // {time, number, lastDigit, classification}
  let betHistory = []; // {id,time,type,digit,amount,status,payout}
let roundName = null; 
const API_WORKER = "https://doan-so.nro2024.workers.dev"; // không có slash cuối

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

// load balance cho user hiện tại
function loadBalance(){
  if(!currentUser){
    balance = 0;
    renderBalance();
    return;
  }
  try {
    const raw = localStorage.getItem(`goldBalance_${currentUser}`);
    balance = raw ? Number(raw) : 0; 
  } catch(e){
    balance = 0;
  }
  renderBalance();
}
// save balance cho user hiện tại
function saveBalance(){
  try {
    localStorage.setItem(`goldBalance_${currentUser}`, String(balance));
  } catch(e){}
  renderBalance();
}

// hiển thị balance ra UI
function renderBalance(){
  const span = document.getElementById('goldAmount');
  if(span) span.textContent = 'Vàng: ' + fmt(balance);
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
    balance += amount;
    saveBalance();
    renderBalance();
    addHistory("Nạp", amount);
    alert("Đã nạp " + amount + " vàng!");
  }
});

// rút vàng
document.getElementById("withdrawBtn").addEventListener("click", () => {
  const amount = parseInt(document.getElementById("goldInputWithdraw").value, 10) || 0;
  if(amount > 0 && balance >= amount){
    balance -= amount;
    saveBalance();
    renderBalance();
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


async function saveResultHistory(){ 
  // tạm thời chỉ log, không gọi server
  console.log("Save resultHistory", resultHistory.slice(-5));
  return;
}


async function loadResultHistory(){ 
  try {
    const resp = await fetch(`${API_WORKER}/load?key=resultHistory`);
    const data = await resp.json();
    if (Array.isArray(data.value)) {
      resultHistory = data.value.slice(-5);
      renderResultTable();
    }
  } catch (e) {
    console.error("Load resultHistory failed", e);
  }
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

// handle new round
async function handleNewResult(res){
  // Nếu chưa truyền res (fetch), lấy từ backend
  if(!res) res = await fetchResult();

  const numStr = String(res.number).replace(/[^0-9]/g,'');
  const lastDigit = numStr ? Number(numStr.slice(-1)) : null;
  const cls = lastDigit != null ? classifyLastDigit(lastDigit) : {bigSmall:'—', oddEven:'—'};

  // ⚡ Hiệu ứng hiển thị kết quả
  setTimeout(()=>{
    showResultOnDisk(res.number);  
    setTimeout(()=>{ canOpen = true; }, 1200);
  }, 0);

  // Lưu kết quả mới vào lịch sử hiển thị
  resultHistory.push({
    time: res.time,
    round: res.round,
    number: res.number,
    lastDigit,
    classification: `${cls.bigSmall}/${cls.oddEven}`
  });
  while (resultHistory.length > 5) resultHistory.shift();
  saveResultHistory();
  renderResultTable();

  // cập nhật roundName từ backend luôn
  roundName = res.round;
  renderRound();

  // settle pending bets theo round hiện tại
  if (pendingBets.length > 0) {
    const stillPending = [];

 for (const p of pendingBets) {
  // ✅ nếu chưa gắn round thì gắn round hiện tại
  if (!p.round) {
    p.round = res.round;
    p.time = res.time;
  }

  // giờ tất cả đều thuộc round hiện tại → xử lý luôn
  const win = checkBet(p.type, lastDigit, p.digit);
  let payout = 0;
  if (win) {
    if (['big','small','odd','even'].includes(p.type)) {
      payout = Math.floor(p.amount * 1.95);
    } else if (p.type === 'digit') {
      payout = Math.floor(p.amount * 8);
    }
  }

  betHistory.push({
    ...p,
    status: win ? 'Thắng' : 'Thua',
    payout,
    result: res.number
  });

  if (win) balance += payout;
}
pendingBets = []; // ✅ sau khi xử lý thì xóa hết cược chờ

    saveBalance();

    while(betHistory.length > 20) betHistory.shift(); // giữ nhiều hơn 5 để an toàn
    saveBetHistory();
    savePendingBets();

    renderPending();
    renderBetHistory();
  }
}
function statusClass(status) {
  if (!status) return "status-cho";
  const s = status.toLowerCase();
  if (s.includes("thắng")) return "status-thang";
  if (s.includes("thua")) return "status-thua";
  return "status-cho";
}

// Bet History
function loadBetHistory(){
  try {
    const raw = localStorage.getItem(`betHistory_${currentUser}`);
    betHistory = raw ? JSON.parse(raw) : [];
  } catch(e){
    betHistory = [];
  }
}
function saveBetHistory(){
  try {
    localStorage.setItem(`betHistory_${currentUser}`, JSON.stringify(betHistory));
  } catch(e){}
}


  // countdown aligned to minute
let currentRem = 0;
let nextTickAt = 0;

function startCountdown() {
  // Đồng bộ mốc về phút chẵn + 60s
  nextTickAt = Date.now() - (Date.now() % 60000) + 60000 + 2000;

  async function tick() {
    const now = Date.now();
    let rem = Math.max(0, Math.round((nextTickAt - now) / 1000));
    currentRem = rem;

    // hiển thị countdown lên UI
    const mm = String(Math.floor(rem / 60)).padStart(2, "0");
    const ss = String(rem % 60).padStart(2, "0");
    const cd = document.getElementById("countdown");
    if (cd) cd.textContent = mm + ":" + ss;

    // 12s trước khi hết vòng thì đóng cược
    if (rem === 48) {
      closeDisk();
      canOpen = false;

      const small = document.getElementById("fetchedNumberSmall");
      if (small && resultHistory.length > 0) {
        small.textContent = resultHistory[resultHistory.length - 1].number;
      }
    }

    // khi countdown về 0 → fetch kết quả + hiện 10s
    if (rem <= 0) {
      await handleNewResult();

      // giữ kết quả trong 10 giây
      await new Promise(r => setTimeout(r, 10000));

      // đặt lại mốc vòng tiếp theo (50s còn lại)
      nextTickAt = Date.now() + 50000;
    }

    // lặp lại mỗi giây
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

  // event handlers for UI choices
  // mapping dataset types to canonical types used in logic
  const mapType = { 'chan':'even', 'le':'odd', 'tai':'big', 'xiu':'small' };

// Khai báo currentSelection trước khi addEventListener
let currentSelection = { type: null, digit: null };

betButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // nếu đã active rồi thì hủy chọn
    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
      currentSelection.type = null;
      currentSelection.digit = null;
      return;
    }

    // nếu chưa active thì clear hết group trước khi chọn
    betButtons.forEach(b=>b.classList.remove('active'));
    numButtons.forEach(n=>n.classList.remove('active'));

    btn.classList.add('active');
    const raw = btn.dataset.type;   // ví dụ 'chan','le','tai','xiu'
    currentSelection.type = mapType[raw] || raw; // map sang even/odd/big/small
    currentSelection.digit = null;
  });
});

  numButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // nếu đã chọn rồi thì hủy
    if(btn.classList.contains('active')){
      btn.classList.remove('active');
      currentSelection.type = null;
      currentSelection.digit = null;
      return;
    }

    // nếu chưa thì chọn
    betButtons.forEach(b=>b.classList.remove('active'));
    numButtons.forEach(n=>n.classList.remove('active'));
    btn.classList.add('active');
    currentSelection.type = 'digit';
    currentSelection.digit = Number(btn.textContent.trim());
  });
});

async function getCurrentRound() {
  try {
    const resp = await fetch(API_URL + "/random", { cache: "no-cache" });
    const data = await resp.json();
    return data.round; // ✅ lấy round từ backend
  } catch (e) {
    console.error("getCurrentRound error", e);
    return null;
  }
}
// Pending Bets
function loadPendingBets(){
  try {
    const raw = localStorage.getItem(`pendingBets_${currentUser}`);
    pendingBets = raw ? JSON.parse(raw) : [];
  } catch(e){
    pendingBets = [];
  }
}
function savePendingBets(){
  try {
    localStorage.setItem(`pendingBets_${currentUser}`, JSON.stringify(pendingBets));
  } catch(e){}
}


placeBetBtn.addEventListener('click', async () => {
  // Lấy các nút đang chọn
  const actives = document.querySelectorAll('.bet-btn.active, .num.active');

  if (actives.length === 0) {
    alert("Bạn chưa chọn cửa cược nào.");
    return;
  }
const typeToGroup = { 
  even: 'parity',
  odd: 'parity',
  big: 'size',
  small: 'size',
  digit: 'digit'
};
  // Xác định nhóm được chọn
  let groups = new Set();
  actives.forEach(btn => {
    const raw = btn.dataset.type || 'digit';
    const canonical = mapType[raw] || raw;
    const group = typeToGroup[canonical] || 'parity';
    groups.add(group);
  });

  // Nếu chọn nhiều nhóm khác nhau
  if (groups.size > 1) {
    alert("Không được chọn nhiều nhóm cùng lúc (Chẵn/Lẻ, Tài/Xỉu hoặc Số).");
    return;
  }

  // Nếu chọn >1 cửa trong cùng nhóm (vd vừa Tài vừa Xỉu)
  if (actives.length > 1) {
    alert("Không được chọn 2 cửa cùng nhóm (ví dụ vừa Tài vừa Xỉu).");
    return;
  }

  // Lấy thông tin cược
  const type = currentSelection.type;
  const digit = currentSelection.digit;
  const amount = Math.max(1, Math.floor(Number(betAmountEl.value) || 0));

  if (!type) { 
    alert("Chưa chọn loại cược"); 
    return; 
  }
  if (amount < 100) {
    alert("Đặt tối thiểu 100 vàng.");
    return;
  }
  if (amount > balance) {
    alert("Không đủ vàng.");
    return;
  }
  if (currentRem <= 3) { 
    alert("Đã hết thời gian, vui lòng chờ phiên sau"); 
    return; 
  }

  // ✅ luôn lấy round từ backend
  const rn = await getCurrentRound();
  if (!rn) { 
    alert("Không lấy được phiên"); 
    return; 
  }

  const id = makeId();
  balance -= amount;
  saveBalance();

  const placed = {
    id,
    type,
    digit: type === 'digit' ? digit : null,
    amount,
    status: 'Chờ',
    payout: 0,
    round: null,   // ✅ chưa gắn round, để chờ phiên tiếp theo
    time: Date.now()
  };

  pendingBets.push(placed);
  savePendingBets();
  saveBetHistory();

  showBetNotice("Đặt cược thành công!");
  renderPending();
  renderBetHistory();
});


// helper describe bet
function descBet(b){
  return `${labelType(b.type,b.digit)}`
}

// ---------- Initial Load ----------
async function init(){
loadBalance();
await loadResultHistory();
loadBetHistory();
loadPendingBets();          // ✅ load pending trước
renderPending();            // ✅ rồi render
renderBetHistory();
renderResultTable();

  // load round hiện tại từ backend
  roundName = await loadRoundName();
  renderRound(); // show mã phiên

  // show latest result ngay nếu có
  if(resultHistory.length > 0){
    const latest = resultHistory[resultHistory.length-1];
    resultEl.textContent = latest.number;
    const small = document.getElementById('fetchedNumberSmall');
    if(small) small.textContent = latest.number;
  }

  // start countdown dựa trên backend
  if(resultHistory.length > 0){
    const latest = resultHistory[resultHistory.length-1];
    startCountdown(latest.time + 50000); // 50s chạy ngầm, 10s show kết quả
  } else {
    startCountdown();
  }
}


// gọi init (bắt lỗi để dễ debug)
init().catch(err => console.error('init failed', err));


  // expose for debug
  window._demo = { getState: ()=>({balance, pendingBets, resultHistory, betHistory}) };

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
