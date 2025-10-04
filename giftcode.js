// Giftcode config
const VALID_GIFT_CODES = { "NRO2024": 1000 };

function redeemGiftcode(code) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Vui lòng đăng nhập.");
    return;
  }
  const normalized = code.trim().toUpperCase();
  if (!VALID_GIFT_CODES[normalized]) {
    alert("Giftcode sai.");
    return;
  }

  const keyRedeem = `giftRedeemed_${currentUser}_${normalized}`;
  if (localStorage.getItem(keyRedeem)) {
    alert("Đã nhận rồi.");
    return;
  }

  balance += VALID_GIFT_CODES[normalized];
  saveBalance();
  localStorage.setItem(keyRedeem, "1");
  alert(`Nhận ${VALID_GIFT_CODES[normalized]} vàng!`);
}

// nếu muốn gọi từ HTML inline
window.redeemGiftcode = redeemGiftcode;

// bắt sự kiện cho nút "Xác nhận"
document.getElementById("redeemGiftBtn")?.addEventListener("click", () => {
  const code = document.getElementById("giftcodeInput")?.value.trim();
  if (!code) {
    alert("Nhập giftcode");
    return;
  }
  redeemGiftcode(code);
});
