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
