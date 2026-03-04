async function redeemGiftcode() {
  const accountId = localStorage.getItem("idgame");
  const code = document.getElementById("giftcodeInput")?.value?.trim();

  if (!accountId) return showToast("Vui lòng đăng nhập", "error");
  if (!code) return showToast("Nhập giftcode", "error");

  try {
    const resp = await fetch("https://index.nro2024.workers.dev/gift/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: accountId, code })
    });

    const data = await resp.json();

    if (!data.ok) {
      if (data.error === "invalid_code") return showToast("Giftcode sai!", "error");
      if (data.error === "already_redeemed") return showToast("Bạn đã nhập mã này rồi!", "error");
      if (data.error === "missing_user") return showToast("Tài khoản không tồn tại!", "error");
      return showToast("Lỗi: " + (data.error || "Không xác định"), "error");
    }

    const amount = data.amount || 0;
    const newBal = data.newBalance || 0;

    const span = document.getElementById("goldAmount");
    if (span) span.textContent = new Intl.NumberFormat().format(newBal);

    showToast(`Nhận thành công ${amount} vàng!`, "success");

    setTimeout(() => location.reload(), 1200);
  } catch (err) {
    console.error(err);
    showToast("Lỗi mạng, thử lại sau!", "error");
  }
}

document.getElementById("redeemGiftBtn")?.addEventListener("click", redeemGiftcode);
