  const API_BASE = "https://api.nro2024.shop";
  let rotating = false;
  let currentAngle = 0;

  // Đưa các hàm ra ngoài để dễ quản lý và tránh lỗi scope
  function updateBalanceDisplay(gold) {
    const goldBalanceEl = document.getElementById("gold-balance");
    if (gold === undefined || !goldBalanceEl) return;
    const formatted = Number(gold).toLocaleString("vi-VN");
    goldBalanceEl.textContent = formatted + " vàng";
    goldBalanceEl.dataset.balance = gold;
  }

  function openWithdrawModal() {
    const modal = document.getElementById("withdrawModal");
    if (modal) {
      modal.style.display = "block";
      updateWithdrawPreview();
    }
  }

  function closeWithdrawModal() {
    const modal = document.getElementById("withdrawModal");
    if (modal) modal.style.display = "none";
  }

  function updateWithdrawPreview() {
    const goldBalanceEl = document.getElementById("gold-balance");
    const server = document.getElementById("withdrawServer").value;
    const user = document.getElementById("withdrawUser").value.trim();
    const goldInput = document.getElementById("withdrawGold").value;
    const gold = parseInt(goldInput) || 0;

    const username = document.getElementById("tk").innerHTML || "Chưa đăng nhập";
    const balanceNum = parseInt(goldBalanceEl?.dataset.balance || "0");

    let preview = "Nhập thông tin để xem trước kết quả";

    if (server && user && gold >= 100000000) {
      if (gold > balanceNum) {
        preview = `<span style="color:red;">Số vàng rút vượt quá số dư hiện tại!</span>`;
      } else {
        const remaining = balanceNum - gold;
        preview = `
          Tài khoản: <b>${username}</b><br>          
          Sẽ rút: <span style="color:green;">${gold.toLocaleString("vi-VN")} vàng</span><br> 
          Còn lại: <span style="color:red;">${remaining.toLocaleString("vi-VN")} vàng</span>
        `;
      }
    }
    document.getElementById("withdrawPreview").innerHTML = preview;
  }

  async function confirmWithdraw() {
    const server = document.getElementById("withdrawServer").value;
    const user = document.getElementById("withdrawUser").value.trim();
    const gold = parseInt(document.getElementById("withdrawGold").value) || 0;
    const messageDiv = document.getElementById("withdrawMessage");
    const goldBalanceEl = document.getElementById("gold-balance");

    messageDiv.textContent = "";

    if (!server || !user || gold < 100000000) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "Vui lòng nhập đủ thông tin (tối thiểu 100tr vàng)";
      return;
    }

    const username = localStorage.getItem("idgame") || ""; // Lưu ý: Bạn dùng idgame hay currentUser?
    if (!username) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "Vui lòng đăng nhập!";
      return;
    }

    const balanceNum = parseInt(goldBalanceEl.dataset.balance || "0");
    if (gold > balanceNum) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "Số vàng rút vượt quá số dư hiện tại!";
      return;
    }

    messageDiv.style.color = "orange";
    messageDiv.textContent = "Đang xử lý yêu cầu...";

    try {
      const res = await fetch(`${API_BASE}?action=withdraw`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ server, char_name: user, gold })
      });

      const data = await res.json();
      if (data.success) {
        updateBalanceDisplay(data.balance);
        messageDiv.style.color = "green";
        messageDiv.textContent = `Rút vàng thành công!`;
        loadWithdrawHistory();
      } else {
        messageDiv.style.color = "red";
        messageDiv.textContent = `${data.message}`;
      }
    } catch (err) {
      console.error(err);
      messageDiv.textContent = "Lỗi kết nối máy chủ!";
    }
  }

async function loadUserData() {
const logged = localStorage.getItem("idgame");
  const historyBody = document.getElementById("history-body");
   const btnCountSpin = document.getElementById("btnCountSpin");
 if (!historyBody || !logged) return;

  historyBody.innerHTML =
    `<tr><td colspan="4" style="text-align:center;color:#888;">Đang tải...</td></tr>`;
    

  try {

    // ===== LẤY SỐ DƯ =====
    const userRes = await fetch(`${API_BASE}?action=get_user`, {
      method: "POST",
      credentials: "include"
    });

    const userData = await userRes.json();
    if (!userData.success) throw new Error(userData.message);

    updateBalanceDisplay(userData.so_du_vang);
    const userGem = document.getElementById("user-gem");
    userGem.innerText = Number(userData.so_du_ngoc).toLocaleString("vi-VN") + " ngọc";

    // ===== LẤY LỊCH SỬ QUAY =====
    const historyRes = await fetch(`${API_BASE}?action=history-spin`, {
      method: "POST",
      credentials: "include"
    });
    const historyData = await historyRes.json();
        if (!logged) {    historyBody.innerHTML =
      `<tr><td colspan="4" style="color:red;text-align:center;">${message}</td></tr>`;
  };
    if (!historyData.success) throw new Error(historyData.message);
    btnCountSpin.innerHTML = `<i class="fas fa-gamepad"></i> SỐ LƯỢT ĐÃ QUAY: ${historyData.total_spin}`

    const history = historyData.list || [];
    historyBody.innerHTML = history.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:#aaa;">Chưa có lượt quay nào</td></tr>`
      : "";

    history.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.time}</td>
        <td><strong>${entry.prize}</strong></td>
   
        <td>            <em>${entry.detail}</em></td>
           <td>
          <button onclick="this.style.display='none'; this.nextElementSibling.style.display='block';">Xem</button>
          <div class="detail-text" style="display:none;">
            <em>${entry.acc}</em>
          </div>
        </td>
        `;
      historyBody.appendChild(row);
    });

  } catch (err) {
    historyBody.innerHTML =
      `<tr><td colspan="4" style="color:red;text-align:center;">${err}</td></tr>`;
  }
}

  // Khởi tạo các sự kiện khi trang đã load xong
  window.addEventListener("DOMContentLoaded", () => {
    loadUserData();

    // Gán sự kiện cho các input rút tiền
    document.getElementById("withdrawServer")?.addEventListener("change", updateWithdrawPreview);
    document.getElementById("withdrawUser")?.addEventListener("keyup", updateWithdrawPreview);
    document.getElementById("withdrawGold")?.addEventListener("keyup", updateWithdrawPreview);

    // Gán hàm vào window để các thuộc tính onclick trong HTML hoạt động được
    window.spinWheel = spinWheel; 
    window.openWithdrawModal = openWithdrawModal;
    window.closeWithdrawModal = closeWithdrawModal;
    window.confirmWithdraw = confirmWithdraw;
  });

  // Tách hàm spinWheel ra ngoài để tránh lồng nhau quá sâu
  async function spinWheel() {
    const btnSpin = document.getElementById("spin-btn");
    const resultEl = document.getElementById("result");
    const wheel = document.getElementById("wheel");
    
    if (!localStorage.getItem("idgame")) { alert("Vui lòng đăng nhập."); return; }
    if (rotating) return;
    
    rotating = true;
    btnSpin.disabled = true;
    resultEl.style.display = "block";
    resultEl.innerHTML = "<em>Đang quay...</em>";

    try {
      const res = await fetch(`${API_BASE}?action=spin`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const targetAngle = data.angle + (Math.random() * 6 - 3);
      const finalAngle = 360 * 5 + targetAngle;

      wheel.style.transition = "transform 4s ease-out";
      wheel.style.transform = `rotate(${finalAngle}deg)`;

      setTimeout(async () => {
        rotating = false;
        btnSpin.disabled = false;
        currentAngle = targetAngle;
        wheel.style.transition = "none";
        wheel.style.transform = `rotate(${currentAngle}deg)`;
          const kameOverlay = document.getElementById("kame-overlay");
  const kameBeam = document.querySelector(".kame-beam");

  kameOverlay.style.display = "flex";
  kameOverlay.style.opacity = "1";

  //  Tụ lực (đợi GIF)
  setTimeout(() => {
    kameBeam.classList.add("fire");

    //  Flash xong → hiện thưởng
    setTimeout(async () => {
      kameOverlay.style.display = "none";
      kameBeam.classList.remove("fire");
          }, 800); // thời gian flash

  }, 1200); // thời gian tụ lực
        resultEl.innerHTML = "<marquee>Tiếp tục quay để tăng % may mắn!</marquee>";
        showRewardPopup(data.prize, data.detail, data.acc);
        if (data.gold_balance !== undefined) updateBalanceDisplay(data.gold_balance);
        loadUserData();
      }, 4100);

    } catch (err) {
      alert(err.message);
      rotating = false;
      btnSpin.disabled = false;
    }
  }
    // Tách hàm spinWheel ra ngoài để tránh lồng nhau quá sâu
  async function spinWheelTest() {
    const btnSpin = document.getElementById("spin-btn");
    const resultEl = document.getElementById("result");
    const wheel = document.getElementById("wheel");
    
    if (!localStorage.getItem("idgame")) { alert("Vui lòng đăng nhập."); return; }
    if (rotating) return;
    
    rotating = true;
    btnSpin.disabled = true;
        resultEl.style.display = "block";
    resultEl.innerHTML = "<em>Đang quay...</em>";

    try {
      const res = await fetch(`${API_BASE}?action=test-spin`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const targetAngle = data.angle + (Math.random() * 6 - 3);
      const finalAngle = 360 * 5 + targetAngle;

      wheel.style.transition = "transform 4s ease-out";
      wheel.style.transform = `rotate(${finalAngle}deg)`;

      setTimeout(async () => {
        rotating = false;
        btnSpin.disabled = false;
        currentAngle = targetAngle;
        wheel.style.transition = "none";
        wheel.style.transform = `rotate(${currentAngle}deg)`;
          const kameOverlay = document.getElementById("kame-overlay");
  const kameBeam = document.querySelector(".kame-beam");

  kameOverlay.style.display = "flex";
  kameOverlay.style.opacity = "1";

  //  Tụ lực (đợi GIF)
  setTimeout(() => {
    kameBeam.classList.add("fire");

    //  Flash xong → hiện thưởng
    setTimeout(async () => {
      kameOverlay.style.display = "none";
      kameBeam.classList.remove("fire");
          }, 800); // thời gian flash

  }, 1200); // thời gian tụ lực
        resultEl.innerHTML = "<marquee>Tiếp tục quay để tăng % may mắn!</marquee>";
        showRewardPopup(data.prize, data.detail, data.acc);
        if (data.gold_balance !== undefined) updateBalanceDisplay(data.gold_balance);
        loadUserData();
      }, 4100);

    } catch (err) {
      alert(err.message);
      rotating = false;
      btnSpin.disabled = false;
    }
  }
  
  function showRewardPopup(prizeName, prizeDetail, accInfo) {
    const overlay = document.createElement("div");
    overlay.className = "reward-overlay";
    overlay.onclick = () => document.body.removeChild(overlay);

    const popup = document.createElement("div");
    popup.className = "reward-popup";
    popup.onclick = e => e.stopPropagation();

    popup.innerHTML = `
      <div class="popup-header">
        <span class="popup-title">TRÚNG THƯỞNG</span>
        <div class="popup-actions">
          <p class="close-btn" style="color:#ccc;" onclick="document.body.removeChild(this.closest('.reward-overlay'))">&times;</p>
        </div>
      </div>
      <div class="popup-content">
        Chúc mừng bạn quay trúng:<br/> <p class="reward-name">${prizeName}</p>
        <p class="reward-detail">${prizeDetail}</p>
${accInfo ? `<div class="reward-acc"><code>${accInfo}</code></div>` : ""}
<button class="close-button">Đóng</button>
      </div> `
    ;

    popup.querySelector(".close-button").onclick = () => document.body.removeChild(overlay);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    setTimeout(() => popup.classList.add("show"), 50);
  }

function updateSpinButton() {
  const mode = document.getElementById("spinMode").value;
  const btn = document.getElementById("spin-btn");

  if (mode === "real") {
    btn.innerHTML = '<i class="fas fa-play"></i> Quay ngay';
  }   if (mode === "test") {
    btn.innerHTML = '<i class="fas fa-play"></i> Quay thử';
  }
}

function spinSelected() {
  const mode = document.getElementById("spinMode").value;

  if (mode === "real") {
    spinWheel();
  } if (mode === "test") {
    spinWheelTest();
  }
}
