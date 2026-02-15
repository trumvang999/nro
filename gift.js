const btn = document.getElementById("claim-gift-btn");
const msgBox = document.getElementById("gift-message");
const WORKER_URL = "https://shop.nro2024.workers.dev";

window.addEventListener("DOMContentLoaded", () => {
  if (!btn || !msgBox) return;

  btn.addEventListener("click", async () => {
    const user = localStorage.getItem("currentUser");

    // 1️⃣ Kiểm tra đăng nhập
    if (!user) {
      showMsg("Vui lòng đăng nhập để nhận quà!", "orange");
      btn.style.display = "none";
      return;
    }

    // 2️⃣ Disable tránh spam click
    btn.disabled = true;
    showMsg("Đang xử lý, vui lòng chờ...", "orange");

    try {
      const response = await fetch(
        `${WORKER_URL}/?action=claim_gift&username=${encodeURIComponent(user)}`,
        { method: "POST" }
      );

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Server trả về dữ liệu không hợp lệ");
      }

      // 3️⃣ Thành công
      if (response.ok && result.success === true) {
        showMsg("Chúc mừng! Bạn đã nhận quà thành công.", "green");
        btn.style.display = "none";
        return;
      }

      // 4️⃣ Đã nhận hoặc lỗi logic
      showMsg(result.message || "Có lỗi xảy ra, vui lòng thử lại!", "orange");
      btn.style.display = "none";

    } catch (error) {
      console.error("Claim gift error:", error);
      showMsg("Không thể kết nối server. Vui lòng thử lại!", "red");
      btn.disabled = false; // cho phép thử lại nếu lỗi network
    }
  });
});

// ===== Helper hiển thị message =====
function showMsg(text, color) {
  msgBox.innerText = text;
  msgBox.style.color = color;
  msgBox.style.display = "block";

  if (color !== "green") {
    setTimeout(() => {
      msgBox.style.display = "none";
    }, 3000);
  }
}
