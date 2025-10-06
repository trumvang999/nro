async function redeemGiftcode() {
  const currentUser = localStorage.getItem("currentUser");
  const code = document.getElementById("giftcodeInput")?.value?.trim();

  if (!currentUser) return alert("Vui lòng đăng nhập");
  if (!code) return alert("Nhập giftcode");

  try {
    const resp = await fetch("https://giftcode.nro2024.workers.dev/gift/redeem", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ username: currentUser, code })
    });

    const data = await resp.json();

    if (!resp.ok) {
      if (data.error === "invalid_code") return alert("Giftcode sai.");
      if (data.error === "already_redeemed") return alert("Bạn đã nhập mã này rồi.");
      return alert("Có lỗi: " + data.error);
    }

    // Cộng vàng vào localStorage (hoặc gọi API khác để credit server-side)
    const balKey = `goldBalance_${currentUser}`;
    const curBal = Number(localStorage.getItem(balKey) || 0);
    const newBal = curBal + data.amount;
    localStorage.setItem(balKey, String(newBal));

    // update UI
    const span = document.getElementById('goldAmount');
    if (span) span.textContent = 'Vàng: ' + new Intl.NumberFormat().format(newBal);

    alert(`Nhận ${data.amount} vàng!`);
  } catch (err) {
    console.error(err);
    alert("Lỗi mạng, thử lại sau.");
  }
}

// gắn sự kiện nút
document.getElementById("redeemGiftBtn")?.addEventListener("click", redeemGiftcode);
