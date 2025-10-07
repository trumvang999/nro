const proxyURL = "https://napthe.nro2024.workers.dev/";
const currentUser = localStorage.getItem("currentUser");
const allHistories = JSON.parse(localStorage.getItem("histories") || "{}");
if (!allHistories[currentUser]) allHistories[currentUser] = [];

const rechargeForm = document.getElementById("recharge-form");
const rechargeResult = document.getElementById("recharge-result");
let isSending = false;

function setBalance(username, total) {
  document.getElementById("account-name").innerText =
    `Tài khoản: ${username} - Số dư: ${total.toLocaleString()} VNĐ`;
}

function updateHistory() {
  const tbody = document.getElementById("history-body");
  tbody.innerHTML = "";
  const history = allHistories[currentUser];

  if (!history || history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">Chưa có giao dịch nạp thẻ.</td></tr>`;
    return;
  }

  const formatTime = iso => new Date(iso).toLocaleString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  history.slice().reverse().forEach(item => {
    const row = document.createElement("tr");
    const statusText = item.status.trim().toLowerCase();
    const statusColor = statusText.includes("thành công") ? "#28a745" :
                        statusText.includes("thất bại") ? "#f00" : "#888";

    row.innerHTML = `
      <td>${formatTime(item.time)}</td>
      <td>${item.message.match(/Loại: (.*?) \|/)?.[1] || item.type}</td>
      <td>${item.message.match(/Mệnh giá: (.*?) \|/)?.[1] || ""} VNĐ</td>
      <td>${item.message.match(/Mã: (.*?) \|/)?.[1] || ""}</td>
      <td>${item.message.match(/Serial: (.*?) \|/)?.[1] || ""}</td>
      <td>${item.message.match(/Tiền cộng: (.*?) VNĐ/)?.[1] || ""} VNĐ</td>
      <td><p style="background:${statusColor};color:#fff;padding:5px 15px;border-radius:5px;display:inline">${item.status}</p></td>
    `;
    tbody.appendChild(row);
  });
}


async function fetchLatestStatus() {
  try {
    const res = await fetch(`${proxyURL}?action=getNapThe&username=${encodeURIComponent(currentUser)}`, {
      method: "GET",
    });

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Lỗi từ API:", data);
      return;
    }

    const uniqueMap = new Map();
    data.forEach(item => {
      const key = `${item.code}_${item.serial}`;
      if (!uniqueMap.has(key) || item.status === "Thành công") {
        uniqueMap.set(key, item);
      }
    });

    const updatedHistory = Array.from(uniqueMap.values()).map(item => ({
      type: "Nạp thẻ",
      time: item.time,
      message: `Loại: ${item.type || "Không rõ"} | Mệnh giá: ${item.amount || 0} | Mã: ${item.code} | Serial: ${item.serial} | Tiền cộng: ${item.credit || "?"} VNĐ`,
      status: item.status || "Chờ duyệt"
    }));

    allHistories[currentUser] = updatedHistory;
    localStorage.setItem("histories", JSON.stringify(allHistories));
    updateHistory();
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử:", err);
  }
}


rechargeForm.addEventListener("submit", async function(e) {
  e.preventDefault();
   if (!currentUser) {
    alert("Vui lòng đăng nhập!");
    return;
  }
  if (isSending) return;
  isSending = true;

  const type = document.getElementById("card-type").value.trim();
  const amount = Number(document.getElementById("card-amount").value.trim());
  const code = document.getElementById("card-code").value.trim();
  const serial = document.getElementById("card-serial").value.trim();

  if (!code || !serial || !type || amount <= 0) {
    rechargeResult.style.color = "red";
    rechargeResult.innerText = "❌ Vui lòng nhập đầy đủ thông tin hợp lệ.";
    isSending = false;
    return;
  }

  rechargeResult.style.color = "dodgerblue";
  rechargeResult.innerText = "Đang gửi...";

  const time = new Date().toISOString();
  const payload = {
  action: "nap_the",
  username: currentUser,
  type, 
  amount, 
  code: "'" + code,        // giữ nguyên số 0
  serial: "'" + serial, 
  time
};

console.log("Payload gửi lên:", payload);

  try {
    const res = await fetch(proxyURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const txt = await res.text();

    if (txt.includes("Thẻ đã ghi")) {
      rechargeResult.style.color = "orange";
      rechargeResult.innerText = txt;
    } else {
      rechargeResult.style.color = "green";
      rechargeResult.innerText = "Gửi thành công! Đang chờ duyệt.";
    }

    fetchLatestStatus();
  } catch (err) {
    rechargeResult.style.color = "red";
    rechargeResult.innerText = "❌ Lỗi khi gửi thẻ.";
    console.error("Lỗi gửi:", err);
  }

  isSending = false;
});

updateHistory();
fetchLatestStatus();
