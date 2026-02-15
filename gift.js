const btn = document.getElementById("claim-gift-btn");
const msgBox = document.getElementById("gift-message");
const user = localStorage.getItem("currentUser");

const WORKER_URL = "https://shop.nro2024.workers.dev";

window.addEventListener("DOMContentLoaded", () => {
  if (!btn || !msgBox) return;

  btn.addEventListener("click", async () => {
    // 1. Kiểm tra đăng nhập
       if (!user){

          msgBox.innerText = "Vui lòng đăng nhập để nhận quà!";

    msgBox.style.display = "block";

              btn.style.display = "none";

          setTimeout(() => msgBox.style.display = "none", 2000); // 2s biến mất
  return;
    }
  
    btn.disabled = true;
    btn.style.display = "none";
    showMsg("Đang xử lí, vui lòng chờ...", "orange");

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
        showMsg(result.message || "Có lỗi xảy ra, vui lòng thử lại!", "orange");
       
    msgBox.style.display = "block";

              btn.style.display = "none";

          setTimeout(() => msgBox.style.display = "none",3000); // 3s biến mất
  return;
      }
    } catch (error) {
      showMsg("Lỗi kết nối đến máy chủ!", "red");
   
    msgBox.style.display = "block";

              btn.style.display = "none";

          setTimeout(() => msgBox.style.display = "none", 3000); // 3s biến mất
  return;
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
