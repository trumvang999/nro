const btn    = document.getElementById("claim-gift-btn");
const msgBox = document.getElementById("gift-message");
const wrapper = document.getElementById("gift-container");

window.addEventListener("DOMContentLoaded", () => {
  if (!btn || !msgBox) return;

  // Ẩn nút nếu muốn
  // btn.style.display = "none";

  // Hoặc giữ nút nhưng click sẽ báo bảo trì
  btn.addEventListener("click", () => {
    msgBox.innerText = "Chức năng nhận quà đang bảo trì!";
    msgBox.style.display = "block";
        btn.style.display = "none";
    setTimeout(() => msgBox.style.display = "none", 3000); // 3s biến mất
  });
});
