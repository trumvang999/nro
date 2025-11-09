const SCRIPT_URL = "https://shop.nro2024.workers.dev/";
const currentUser = localStorage.getItem("currentUser") || "guest";
const btn = document.getElementById("claim-gift-btn");
const msgBox = document.getElementById("gift-message");
const wrapper = document.getElementById("gift-container");

async function checkGiftStatus() {
  if (currentUser === "guest") {
    btn.style.display = "inline-block";
    msgBox.style.display = "none";
    return;
  }

  try {
    const resp = await fetch(`${SCRIPT_URL}?action=get_user&username=${currentUser}`);
    const data = await resp.json();

    if (data.history?.includes("Nhận quà")) {
      btn.style.display = "none";
      msgBox.innerText = "Bạn đã nhận quà rồi.";
      msgBox.style.display = "block";
    } else {
      btn.style.display = "inline-block";
      msgBox.style.display = "none";
    }
  } catch (err) {
    console.error(err);
    btn.style.display = "inline-block";
    msgBox.style.display = "none";
  }
}

async function claimGift() {
  if (currentUser === "guest") {
    alert("Vui lòng đăng nhập để nhận quà!");
    return;
  }

  btn.disabled = true;

  try {
    const resp = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "claim_gift",
        username: currentUser
      })
    });

    const msg = await resp.text();
    msgBox.innerText = msg;
    msgBox.style.display = "block";

    if (msg.includes("Bạn đã nhận quà rồi")) {
      btn.style.display = "none"; // Worker đã chặn
    } else {
      btn.style.display = "none"; // Nhận thành công
    }

    if (typeof loadBalance === "function") loadBalance();

  } catch (err) {
    alert("Lỗi kết nối:\n" + err);
    btn.disabled = false;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!btn || !msgBox) return;
  checkGiftStatus();
  btn.addEventListener("click", claimGift);
});
