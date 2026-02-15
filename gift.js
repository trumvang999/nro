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
  const response = await fetch(
    `${WORKER_URL}/?action=claim_gift&username=${encodeURIComponent(user)}`,
    { method: "POST" }
  );

  const text = await response.text(); 

  if (!response.ok) {
    showMsg(text || "Lỗi server!", "red");
    btn.disabled = false;
    return;
  }

  // 🔹 Xử lý theo nội dung backend trả
  if (text.includes("✅")) {
    showMsg(text, "green");
    btn.style.display = "none";
    setTimeout(() => {
      msgBox.style.display = "none";
    }, 5000);
  } 
  else if (text.includes("❌")) {
    showMsg(text, "red");
    btn.disabled = false;
  } 
  else {
    showMsg("Phản hồi không xác định!", "red");
    btn.disabled = false;
  }

} catch (error) {
  showMsg("Không thể kết nối server. Vui lòng thử lại!", "red");
  btn.disabled = false;
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
