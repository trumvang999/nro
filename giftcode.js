async function redeemGiftcode() {
  const currentUser = localStorage.getItem("currentUser");
  const accountId = localStorage.getItem("accountId");
  const code = document.getElementById("giftcodeInput")?.value?.trim();

  if (!currentUser) return alert("Vui lòng đăng nhập");
  if (!code) return alert("Nhập giftcode");

  try {
    const resp = await fetch("https://index.nro2024.workers.dev/gift/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, code })
    });

    const data = await resp.json();

    if (!data.ok) {
      if (data.error === "invalid_code") return alert("Giftcode sai!");
      if (data.error === "already_redeemed") return alert("Bạn đã nhập mã này rồi!");
      if (data.error === "missing_user") return alert("Tài khoản không tồn tại!");
      return alert("Lỗi: " + (data.error || "Không xác định"));
    }

    // ✅ Cập nhật vàng mới vào UI
    const amount = data.amount || 0;
    const newBal = data.newBalance || 0;

    const span = document.getElementById("goldAmount");
    if (span) span.textContent = new Intl.NumberFormat().format(newBal);

    alert(`Nhận thành công ${amount} vàng!`);
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Lỗi mạng, thử lại sau!");
  }
}
document.getElementById("redeemGiftBtn")?.addEventListener("click", redeemGiftcode);
