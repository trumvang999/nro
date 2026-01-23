function copyToClipboard(elementId) {
  const copyText = document.getElementById(elementId);
  if (!copyText) return;
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  try {
    document.execCommand("copy");
    alert("Đã sao chép: " + copyText.value);
  } catch (err) {
    alert("Không thể sao chép");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser");
  const contentInput = document.getElementById("contentInput");
  contentInput.value = currentUser ? "Tạo đơn để lấy nội dung" : "Vui lòng đăng nhập";
});

function toggleCreateBtn(loading) {
  const btn = document.getElementById("generate");
  if (!btn) return;

  if (loading) {
    btn.disabled = true;
    btn.dataset.text = btn.innerHTML;
    btn.innerHTML = "Đang tạo đơn...";
    btn.style.opacity = "0.9";
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.text || "Tạo đơn";
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
}

async function generateLink() {
  toggleCreateBtn(true);
  const amount = document.getElementById("amountInput").value;
  const linkSection = document.getElementById("linkSection");
  const qrImage = document.getElementById("qrImage");
  const contentInput = document.getElementById("contentInput");
  const statusText = document.getElementById("statusText");

  if (!amount || amount < 10000) {
    alert("Vui lòng nhập số tiền hợp lệ (>=10.000đ)");
        toggleCreateBtn(false);
    return;
  }

  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Bạn cần đăng nhập trước khi nạp!");
        toggleCreateBtn(false);
    return;
  }

  try {
    const res = await fetch("https://napatm.nro2024.workers.dev/sepay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), username: currentUser }),
    });

    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Không tạo được đơn. Vui lòng thử lại!");
          toggleCreateBtn(false);
      return;
    }

    // Gán nội dung + QR code
    const content = `nro2024 ${currentUser} ${data.orderCode}`;
    contentInput.value = content;

    const qrUrl = `https://qr.sepay.vn/img?acc=105800851168&bank=MBBank&amount=${amount}&des=${encodeURIComponent(content)}`;
    qrImage.src = qrUrl;

    linkSection.style.display = "block";
    statusText.style.color = "orange";
    statusText.innerText = "Đang chờ thanh toán...";
    toggleCreateBtn(false);

    // Lưu thông tin đơn
    localStorage.setItem("lastPayment", JSON.stringify({
      user: currentUser,
      amount: Number(amount),
      content,
      orderCode: data.orderCode
    }));

    if (typeof loadPayOSHistory === "function") loadPayOSHistory();

    checkPayment(data.orderCode, statusText);

  } catch (err) {
    alert("Lỗi kết nối: " + err.message);
        toggleCreateBtn(false);
  }
}
  
async function checkPayment(orderCode, statusText) {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`https://napatm.nro2024.workers.dev/sepay/status?orderCode=${orderCode}`);
      const data = await res.json();

      if (!data.success) return;

      const isPaid = data.paid === true || data.paid === 1 || data.paid === "1";
      const isCanceled = data.canceled === true || data.canceled === 1 || data.canceled === "1";

      if (isPaid) {
        clearInterval(interval);
        statusText.style.color = "green";
        statusText.innerText = "Thanh toán thành công!";

        // ✅ Cập nhật popup thông tin
        const popup = document.getElementById("popupSuccess");
        const infoBox = document.getElementById("successInfo");
        if (popup && infoBox) {
          infoBox.innerHTML = `
            <strong>Người nạp:</strong> ${data.username || "Không rõ"}<br>
            <strong>Mã đơn:</strong> ${orderCode}<br>
            <strong>Số tiền:</strong> ${Number(data.amount || 0).toLocaleString()}đ<br>
            <strong>Trạng thái:</strong> <span style="color:green;font-weight:bold;">Thành công</span><br>
            <strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}
          `;
          popup.style.display = "block";
          window.scrollTo(0, 0);
              document.getElementById("closePopup").onclick = () => (popup.style.display = "none");
      popup.onclick = (e) => {
        if (e.target === popup) popup.style.display = "none";
      };
        }

        // ✅ Refresh lịch sử
        if (typeof loadPayOSHistory === "function") loadPayOSHistory();
      } else if (isCanceled) {
        clearInterval(interval);
        statusText.style.color = "red";
        statusText.innerText = "Đơn đã bị huỷ!";
      }
    } catch (err) {
      console.log("Không check được trạng thái:", err);
    }
  }, 5000);
}

async function loadPayOSHistory() {
  const currentUser = localStorage.getItem("currentUser");
  const tbody = document.getElementById("payos-history-body");

  if (!currentUser) {
    tbody.innerHTML = `<tr><td colspan="6">Chưa có giao dịch nạp.</td></tr>`;
    return;
  }

  try {
    const res = await fetch(
      "https://napatm.nro2024.workers.dev/sepay/history?username=" + currentUser
    );
    const data = await res.json();

    if (!data.success || !data.data.length) {
      tbody.innerHTML = `<tr><td colspan="6">Chưa có giao dịch nào.</td></tr>`;
      return;
    }

    const recent = data.data
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    const rows = recent
      .map((item) => {
        const time = new Date(item.timestamp).toLocaleString("vi-VN");

        let status = "";
        if (item.paid) {
          status = `<span style="color:green;font-weight:bold;">Thành công</span>`;
        } else if (item.canceled) {
          status = `<span style="color:red;font-weight:bold;">Đã huỷ</span>`;
        } else {
          status = `<span style="color:orange;font-weight:bold;">Đang chờ</span>`;
        }

        let action = `<span style="color:#999;">-</span>`;

        if (!item.paid && !item.canceled) {
  if (item.paymentLink) {
    action = `
      <button onclick="showQR('${item.paymentLink}', '${item.orderCode}')"
              style="color:#007bff;background:none;border:none;font-weight:600;cursor:pointer;text-decoration:underline;padding:5px;">
        Thanh toán
      </button>
      |
      <button onclick="cancelPayOSOrder('${item.orderCode}')"
              style="background:none;border:none;color:red;font-weight:600;cursor:pointer;text-decoration:underline;padding:5px;">
        Huỷ
      </button>`;
  } else {
    action = `
      <button onclick="cancelPayOSOrder('${item.orderCode}')"
              style="background:none;border:none;color:red;font-weight:600;cursor:pointer;">
        Huỷ
      </button>`;
  }
}

        return `
          <tr>
            <td>${time}</td>
            <td>${item.orderCode}</td>
            <td>${item.username ? "Nạp tiền " + item.username : "-"}</td>
            <td>${Number(item.amount).toLocaleString()}đ</td>
            <td>${status}</td>
            <td>${action}</td>
          </tr>
        `;
      })
      .join("");

    tbody.innerHTML = rows;
  } catch (err) {
    console.error("Lỗi tải lịch sử:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;">Không thể tải lịch sử!</td></tr>`;
  }
}

async function cancelPayOSOrder(orderCode) {
  if (!confirm("Bạn có chắc muốn huỷ đơn #" + orderCode + " không?")) return;

  try {
    const res = await fetch("https://napatm.nro2024.workers.dev/sepay/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode }),
    });

    const data = await res.json();
    alert(data.message || "Đã huỷ đơn!");
    loadPayOSHistory(); // refresh lại bảng
  } catch (err) {
    alert("Lỗi huỷ đơn: " + err.message);
  }
}
    
function showQR(paymentLink, orderCode) {
  const linkSection = document.getElementById("linkSection");
  const qrImage = document.getElementById("qrImage");
    const taodon = document.getElementById("taodon");
const statusText = document.getElementById("statusText");

  // Gán ảnh QR
  qrImage.src = paymentLink;
taodon.textContent = `Đơn #${orderCode}`;
  // Cập nhật trạng thái
  statusText.textContent = `Đang chờ thanh toán...`;
  statusText.style.color = "orange";

  // Hiện khối QR
  linkSection.style.display = "block";

  // Cuộn mượt đến QR
  linkSection.scrollIntoView({ behavior: "smooth" });
}

// Gọi khi load trang
document.addEventListener("DOMContentLoaded", loadPayOSHistory);
