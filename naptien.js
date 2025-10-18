  document.addEventListener("DOMContentLoaded", function () {
    const currentUser = localStorage.getItem("currentUser");
    const contentInput = document.getElementById("contentInput");
    if (!currentUser) {
      contentInput.value = "Vui lòng đăng nhập";
    } else {
      contentInput.value = "nro2024 " + currentUser;
    }

    if (window.location.hash === "#popup") {
      const popup = document.getElementById("popupSuccess");
      const info = document.getElementById("successInfo");
      const lastPayment = JSON.parse(localStorage.getItem("lastPayment") || "{}");
      if (lastPayment.amount) {
        info.innerHTML = `
          <p><b>User:</b> ${lastPayment.user}</p>
          <p><b>Số tiền:</b> ${lastPayment.amount.toLocaleString()}đ</p>
          <p><b>Nội dung:</b> ${lastPayment.content}</p>
          <p><b>OrderCode:</b> ${lastPayment.orderCode}</p>
        `;
      }
      popup.style.display = "flex";
      document.getElementById("closePopup").onclick = () => (popup.style.display = "none");
      popup.onclick = (e) => {
        if (e.target === popup) popup.style.display = "none";
      };
    }
  });

  async function generateLink() {
  const amount = document.getElementById("amountInput").value;
  const linkSection = document.getElementById("linkSection");
  const checkoutLink = document.getElementById("checkoutLink");
  const statusText = document.getElementById("statusText");

  if (!amount || amount < 10000) {
    alert("Vui lòng nhập số tiền hợp lệ (>=10.000đ)");
    return;
  }

  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Bạn cần đăng nhập trước khi nạp!");
    return;
  }

  try {
    const res = await fetch("https://naptien.nro2024.workers.dev/payos/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        username: currentUser
      }),
    });

    const data = await res.json();

    // ✅ Lấy link đúng trường trả về từ backend
    const paymentLink =
      data.paymentLink ||
      data?.data?.checkoutUrl ||
      data?.data?.paymentLink ||
      null;

    if (paymentLink) {
      checkoutLink.href = paymentLink;
      linkSection.style.display = "block";
      statusText.style.color = "orange";
      statusText.innerText = "Đang chờ thanh toán...";

      localStorage.setItem("lastPayment", JSON.stringify({
        user: currentUser,
        amount: Number(amount),
        content: `nro2024 ${currentUser}`,
        orderCode: data.orderCode
      }));

      checkPayment(data.orderCode, statusText);
    } else {
      console.log("Phản hồi từ server:", data);
      alert("Không tạo được đơn thanh toán! Vui lòng thử lại.");
    }
  } catch (err) {
    alert("Lỗi kết nối tới PayOS Worker: " + err.message);
  }
}

  async function checkPayment(orderCode, statusText) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          "https://naptien.nro2024.workers.dev/payos/status?orderCode=" + orderCode
        );
        const data = await res.json();

        if (data.paid) {
          clearInterval(interval);
          statusText.style.color = "green";
          statusText.innerText = "Thanh toán thành công!";
          window.location.hash = "#popup";
          window.scrollTo(0, 0);
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
    tbody.innerHTML = `<tr><td colspan="6">Vui lòng đăng nhập!</td></tr>`;
    return;
  }

  try {
    const res = await fetch(
      "https://naptien.nro2024.workers.dev/payos/history?username=" + currentUser
    );
    const data = await res.json();

    if (!data.success || !data.history.length) {
      tbody.innerHTML = `<tr><td colspan="6">Chưa có giao dịch nào.</td></tr>`;
      return;
    }

    // ✅ Lấy 10 giao dịch mới nhất
    const recent = data.history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    const rows = recent
      .map((item) => {
        const time = new Date(item.timestamp).toLocaleString("vi-VN");

        // ✅ Xử lý trạng thái 3 loại
        let status = "";
        if (item.paid) {
          status = `<span style="color:green;font-weight:bold;">Thành công</span>`;
        } else if (item.canceled) {
          status = `<span style="color:red;font-weight:bold;">Đã huỷ</span>`;
        } else {
          status = `<span style="color:orange;font-weight:bold;">Đang chờ</span>`;
        }

        // ✅ Nếu đã huỷ hoặc đã thanh toán → không cho thao tác
        let action = `<span style="color:#999;">-</span>`;

        if (!item.paid && !item.canceled) {
          if (item.paymentLink) {
            action = `
              <a href="${item.paymentLink}" target="_blank"><button style="color:#007bff;background:none;border:none;font-weight:600;cursor:pointer;text-decoration:underline;padding:5px;">Thanh toán</button></a>
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

// ✅ Huỷ đơn
async function cancelPayOSOrder(orderCode) {
  if (!confirm("Bạn có chắc muốn huỷ đơn #" + orderCode + " không?")) return;

  try {
    const res = await fetch("https://naptien.nro2024.workers.dev/payos/cancel", {
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

// Gọi khi load trang
document.addEventListener("DOMContentLoaded", loadPayOSHistory);
