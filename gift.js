const currentUser = localStorage.getItem("currentUser") || "guest";
const giftKey     = "gift_claimed_" + currentUser;
const btn         = document.getElementById("claim-gift-btn");
const msgBox      = document.getElementById("gift-message");
const wrapper     = document.getElementById("gift-container");

const SCRIPT_URL = "https://shop.nro2024.workers.dev/";

window.addEventListener("DOMContentLoaded", () => {
  if (currentUser === "guest") {
    btn.style.display   = "inline-block";
    msgBox.style.display= "none";
  } else if (localStorage.getItem(giftKey) === "1") {
    btn.style.display   = "none";
  } else {
    btn.style.display   = "inline-block";
  }
});

btn.addEventListener("click", () => {
  if (currentUser === "guest") {
    alert("Vui lòng đăng nhập để nhận quà!");
    return;
  }
  if (localStorage.getItem(giftKey) === "1") return;

  btn.disabled = true; // ✅ Chặn spam click tại đây

  fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action:   "claim_gift",
      username: currentUser
    })
  })
  .then(r => r.text())
  .then(msg => {
    localStorage.setItem(giftKey, "1");
    msgBox.innerText     = msg;
    btn.style.display    = "none";
    msgBox.style.display = "block";
    if (typeof loadBalance === "function") loadBalance();
    setTimeout(() => wrapper.remove(), 1000);
  })
  .catch(err => {
    alert("Lỗi kết nối:\n" + err);
    btn.disabled = false; // 🔁 Cho phép click lại nếu lỗi
  });
});
