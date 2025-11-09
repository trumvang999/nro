const SCRIPT_URL = "https://shop.nro2024.workers.dev/";
const currentUser = localStorage.getItem("currentUser") || "guest";
const giftKey = "gift_claimed_" + currentUser;
const btn = document.getElementById("claim-gift-btn");
const msgBox = document.getElementById("gift-message");
const wrapper = document.getElementById("gift-container");

async function checkGiftStatus() {
  if (currentUser === "guest") {
    btn.style.display = "inline-block";
    msgBox.style.display = "none";
    return;
  }

  // Nếu đã lưu trong localStorage, ẩn luôn
  if (localStorage.getItem(giftKey) === "1") {
    btn.style.display = "none";
    msgBox.style.display = "block";
    msgBox.innerText = "Bạn đã nhận quà rồi.";
    return;
  }

  try {
    const url = `${SCRIPT_URL}?action=claim_gift&username=${encodeURIComponent(currentUser)}`;
    const resp = await fetch(url, { method: "GET" });
    let data;
    try {
      data = await resp.json();
    } catch {
      // Nếu không phải JSON, parse thành object mặc định
      data = { success: false, message: await resp.text() };
    }

    if (data.success === false && data.message.includes("Bạn đã nhận quà rồi")) {
      btn.style.display = "none";
      msgBox.innerText = data.message;
      msgBox.style.display = "block";
      localStorage.setItem(giftKey, "1");
      setTimeout(() => msgBox.style.display = "none", 3000); // 3s biến mất
      location.reload();
    } else {
      btn.style.display = "inline-block";
      msgBox.style.display = "none";
    }
  } catch (err) {
    console.error("Lỗi check gift:", err);
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

    const data = await resp.json();
    msgBox.innerText = data.message;
    msgBox.style.display = "block";

    if (data.success === false) {
      btn.style.display = "none";
    } else {
      btn.style.display = "none";
      // ✅ Nhận thành công → lưu vào localStorage
      localStorage.setItem(giftKey, "1");
      if (typeof loadBalance === "function") loadBalance();
    }

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
