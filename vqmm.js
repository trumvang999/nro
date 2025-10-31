window.addEventListener("DOMContentLoaded", () => {
  // ===== Biến & DOM =====
  const wheel = document.getElementById("wheel");
  const withdrawServer = document.getElementById("withdrawServer");
  const withdrawUser = document.getElementById("withdrawUser");
  const withdrawGold = document.getElementById("withdrawGold");
  const withdrawPreview = document.getElementById("withdrawPreview");
  const withdrawMessage = document.getElementById("withdrawMessage");
  const btnSpin = document.getElementById("spin-btn");
  const resultEl = document.getElementById("result");
  const historyBody = document.getElementById("history-body");
  const goldBalanceEl = document.getElementById("gold-balance");

  let rotating = false;
  let currentAngle = 0;
  const apiSpin = "https://vongquay.nro2024.workers.dev/spin";
  const apiUser = "https://vongquay.nro2024.workers.dev/user-info";

  // ===== Modal Rút Vàng =====
  function openWithdrawModal() {
    document.getElementById("withdrawModal").style.display = "block";
    updateWithdrawPreview();
  }

  function closeWithdrawModal() {
    document.getElementById("withdrawModal").style.display = "none";
  }

  function updateWithdrawPreview() {
    const server = document.getElementById("withdrawServer").value;
    const user = document.getElementById("withdrawUser").value.trim();
    const gold = parseInt(document.getElementById("withdrawGold").value) || 0;

    const username = localStorage.getItem("currentUser") || "Chưa đăng nhập";
    const balanceText = document.getElementById("gold-balance").textContent || "";
    const balanceNum = parseInt(balanceText.replace(/\D/g, "")) || 0;

    let preview = "Nhập thông tin để xem trước kết quả";

 if (server && user && gold >= 100000000) {
  if (gold > balanceNum) {
    preview = `<span style="color:red;">Số vàng rút vượt quá số dư hiện tại!</span>`;
  } else {
    const remaining = balanceNum - gold;
    preview = `
      Tài khoản: <b>${username}</b>
      - Số dư: <b style="color: #f90"> ${balanceNum.toLocaleString("vi-VN")} vàng</b><br>
      Sẽ rút: <span style="color:red;">${gold.toLocaleString("vi-VN")} vàng</span> - 
      Còn lại: <span style="color:green;">${remaining.toLocaleString("vi-VN")} vàng</span>
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

  messageDiv.textContent = ""; // reset

  // Kiểm tra nhập đủ
  if (!server || !user || gold < 100000000) {
    messageDiv.style.color = "red";
    messageDiv.textContent = "Vui lòng nhập đủ thông tin (tối thiểu 100,000,000 vàng)";
    return;
  }

  const username = localStorage.getItem("currentUser") || "";
  if (!username) {
    messageDiv.style.color = "red";
    messageDiv.textContent = "Vui lòng đăng nhập!";
    return;
  }

  const balanceText = document.getElementById("gold-balance").textContent || "";
  const balanceNum = parseInt(balanceText.replace(/\D/g, "")) || 0;
  if (gold > balanceNum) {
    messageDiv.style.color = "red";
    messageDiv.textContent = "❌ Số vàng rút vượt quá số dư hiện tại!";
    return;
  }

  messageDiv.style.color = "black";
  messageDiv.textContent = "Đang xử lý yêu cầu...";

  try {
    const res = await fetch("https://vongquay.nro2024.workers.dev/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        server: server,
        char_name: user,
        gold: gold
      })
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("gold-balance").textContent = data.balance.toLocaleString("vi-VN") + " vàng";
      messageDiv.style.color = "green";
      messageDiv.textContent = `✅ ${data.message}`;
      alert(`Rút vàng thành công!\nSố dư hiện tại: ${data.balance.toLocaleString("vi-VN")} vàng`);
      setTimeout(closeWithdrawModal, 1500);
      
    } else {
      messageDiv.style.color = "red";
      messageDiv.textContent = `❌ ${data.message}`;
    }
  } catch (err) {
    console.error(err);
    messageDiv.style.color = "red";
    messageDiv.textContent = "❌ Lỗi kết nối máy chủ!";
  }
}

  // Preview auto update khi nhập
  document.getElementById("withdrawServer").addEventListener("change", updateWithdrawPreview);
  document.getElementById("withdrawUser").addEventListener("keyup", updateWithdrawPreview);
  document.getElementById("withdrawGold").addEventListener("keyup", updateWithdrawPreview);

  // Đóng modal khi click ngoài
  window.onclick = function(e) {
    const modal = document.getElementById("withdrawModal");
    if (e.target === modal) {
      closeWithdrawModal();
    }
  };

  // ===== Quay Vòng =====
  async function spinWheel() {
    const username = localStorage.getItem("currentUser");
    if (!username) { alert("Vui lòng đăng nhập."); return; }
    if (rotating) return;
    rotating = true;

    btnSpin.disabled = true;
    resultEl.innerHTML = "<em>Đang quay...</em>";

    try {
      const res = await fetch(apiSpin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const prizeName = data.prize;
      const prizeDetail = data.detail;
      const accInfo = data.acc || "";
      const angleFromSheet = data.angle;
      const noise = Math.random() * 6 - 3;
      const targetAngle = angleFromSheet + noise;

      currentAngle %= 360;
      let delta = targetAngle - currentAngle;
      if (delta < 0) delta += 360;
      const spinRounds = 5;
      const finalAngle = currentAngle + delta + 360 * spinRounds;

      wheel.style.transition = "transform 4s ease-out";
      wheel.style.transform = `rotate(${finalAngle}deg)`;

      setTimeout(async () => {
        try {
          currentAngle = finalAngle % 360;
          wheel.style.transition = "none";
          wheel.style.transform = `rotate(${currentAngle}deg)`;

          resultEl.innerHTML =
            "<marquee>Tiếp tục quay để tăng % may mắn, phần quà vip vẫn đang chờ bạn</marquee>";
          showRewardPopup(prizeName, prizeDetail, accInfo);

          if (data.gold_balance !== undefined) updateBalanceDisplay(data.gold_balance);
          await loadUserData(username);

        } catch (e) { console.error(e); }
        rotating = false;
        btnSpin.disabled = false;
      }, 4100);

    } catch (err) {
      alert("❌ Lỗi: " + err.message);
      rotating = false;
      btnSpin.disabled = false;
    }
  }

  // ===== Cập nhật số dư =====
  function updateBalanceDisplay(gold) {
    if (gold !== undefined) goldBalanceEl.textContent = `Số dư vàng: ${gold}`;
  }

  // ===== Popup thưởng =====
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
      </div>
    `;

    popup.querySelector(".close-button").onclick = () => document.body.removeChild(overlay);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    setTimeout(() => popup.classList.add("show"), 50);
  }

  // ===== Load lịch sử & số dư =====
  async function loadUserData(username) {
    historyBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#888;">Đang tải lịch sử và số dư vàng...</td></tr>`;
    try {
      const res = await fetch(apiUser, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      updateBalanceDisplay(data.gold_balance);

      const history = data.history || [];
      historyBody.innerHTML = "";
      if (history.length === 0) {
        historyBody.innerHTML =
          `<tr><td colspan="3" style="text-align:center;color:#aaa;">Chưa có lượt quay nào</td></tr>`;
        return;
      }

      history.reverse().forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${entry.time}</td>
          <td><strong>${entry.prize}</strong></td>
          <td>
            <button onclick="this.style.display='none'; this.nextElementSibling.style.display='block';">Nhận thưởng</button>
            <div class="detail-text" style="display:none;"><em>${entry.detail}</em>${entry.acc ? `<br><code>${entry.acc}</code>` : ""}</div>
          </td>
        `;
        historyBody.appendChild(row);
      });

    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu:", err);
      historyBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:red;">❌ Lỗi tải dữ liệu</td></tr>`;
    }
  }

  // ===== Auto load khi mở trang =====
  const username = localStorage.getItem("currentUser");
  if (username) loadUserData(username);

  // ===== Expose ra global =====
  window.openWithdrawModal = openWithdrawModal;
  window.closeWithdrawModal = closeWithdrawModal;
  window.updateWithdrawPreview = updateWithdrawPreview;
  window.confirmWithdraw = confirmWithdraw;
  window.spinWheel = spinWheel;

});
