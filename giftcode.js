// đặt 1 lần ở scope global
const VALID_GIFT_CODES = { "NRO2024": 1000 };

function redeemGiftcode(code) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Vui lòng đăng nhập.");
    return;
  }
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) { alert("Nhập giftcode"); return; }
  if (!VALID_GIFT_CODES[normalized]) {
    alert("Giftcode sai.");
    return;
  }

  const keyRedeem = `giftRedeemed_${currentUser}_${normalized}`;
  if (localStorage.getItem(keyRedeem)) {
    alert("Bạn đã nhận mã này rồi.");
    return;
  }

  // cập nhật trực tiếp trong localStorage (không cần saveBalance)
  const balKey = `goldBalance_${currentUser}`;
  const raw = localStorage.getItem(balKey);
  const curBal = raw ? Number(raw) : 0;
  const newBal = curBal + VALID_GIFT_CODES[normalized];
  localStorage.setItem(balKey, String(newBal));
  localStorage.setItem(keyRedeem, "1");

  // cập nhật UI nếu tồn tại element
  const span = document.getElementById('goldAmount');
  if (span) span.textContent = 'Vàng: ' + new Intl.NumberFormat().format(newBal);

  alert(`Nhận ${VALID_GIFT_CODES[normalized]} vàng!`);
}

// gắn event cho nút
document.getElementById("redeemGiftBtn")?.addEventListener("click", () => {
  const code = document.getElementById("giftcodeInput")?.value?.trim() || "";
  redeemGiftcode(code);
});
