const btn = document.getElementById("claim-gift-btn");
const msgBox = document.getElementById("gift-message");
const API_URL = "https://api.nro2024.com";

window.addEventListener("DOMContentLoaded", () => {
  if (!btn || !msgBox) return;

  btn.addEventListener("click", async () => {

    // 1️⃣ Disable chống spam
    btn.disabled = true;
    showMsg("Đang nhận quà...", "orange");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim_gift" })
      });

      const data = await res.json();

      if (!data.success) {
        showMsg(data.message || "Không thể nhận quà", "red");
                btn.style.display = "none";
        return;
      }

      // ✅ Thành công
      showMsg(data.message, "green");
      btn.style.display = "none";

      // nếu muốn reload số dư
      // loadUserInfo();

      setTimeout(() => {
        msgBox.style.display = "none";
      }, 5000);

    } catch (err) {
      showMsg("Không thể kết nối server", "red");
        msgBox.style.display = "none";
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
