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
            btn.style.display = "none";
    showMsg("Đang xử lý, vui lòng chờ...", "orange");

try {
  const response = await fetch(`${WORKER_URL}/?action=claim_gift&username=${encodeURIComponent(user)}`, {
    method: "POST"
  });

  const result = await response.json();

  if (!response.ok) {
    showMsg("Lỗi server!", "red");
    return;
  }

  // 🔹 XỬ LÝ THEO success
  if (result.success) {
    showMsg(result.message || "Nhận quà thành công!", "green");
    btn.style.display = "none";
  } else {
    showMsg(result.message || "Không thể nhận quà!", "orange");
    btn.disabled = false;
    btn.style.display = "block";
  }

} catch (error) {
  showMsg("Không thể kết nối server. Vui lòng thử lại!", "red");
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
