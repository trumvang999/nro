const btn = document.getElementById("claim-gift-btn");
const msgBox = document.getElementById("gift-message");
const user = localStorage.getItem("currentUser");

const WORKER_URL = "https://shop.nro2024.workers.dev";

window.addEventListener("DOMContentLoaded", () => {
  if (!btn || !msgBox) return;

  btn.addEventListener("click", async () => {
    // 1. Kiểm tra đăng nhập
    if (!user) {
        msgBox.innerText = "Vui lòng đăng nhập để nhận quà!";

    msgBox.style.display = "block";

              btn.style.display = "none";

          setTimeout(() => msgBox.style.display = "none", 2000); // 2s biến mất
    }

    // 2. Trạng thái đang xử lý (Tránh user spam click)
    btn.disabled = true;
    btn.innerText = "Đang xử lý...";
    showMsg("Đang kiểm tra điều kiện nhận quà...", "orange");

    try {
      // 3. Gọi API claim_gift
      // Gửi action=claim_gift và username qua Query Params
      const response = await fetch(`${WORKER_URL}/?action=claim_gift&username=${encodeURIComponent(user)}`, {
        method: "POST"
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Thành công
        showMsg("Chúc mừng! Bạn đã nhận quà thành công.", "green");
        btn.style.display = "none"; // Ẩn nút sau khi nhận thành công
      } else {
        // Thất bại (Ví dụ: Đã nhận rồi - lỗi 403)
        showMsg(result.message || "Có lỗi xảy ra, vui lòng thử lại!", "orange");
        btn.disabled = false;
        btn.innerText = "Nhận Quà Ngay";
      }
    } catch (error) {
      // Lỗi kết nối
      showMsg("Lỗi kết nối đến máy chủ!", "red");
      btn.disabled = false;
      btn.innerText = "Thử lại";
    }
  });
});

// Hàm hiển thị thông báo tiện lợi
function showMsg(text, color) {
  msgBox.innerText = text;
  msgBox.style.color = color;
  msgBox.style.display = "block";
  
  // Tự động ẩn sau 3 giây nếu không phải là thông báo thành công
  if (color !== "green") {
    setTimeout(() => {
      msgBox.style.display = "none";
    }, 3000);
  }
}
