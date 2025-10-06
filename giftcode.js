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

    // 🔴 check kết quả từ server
    if (!data.ok) {
      if (data.error === "invalid_code") return alert("Giftcode sai.");
      if (data.error === "already_redeemed") return alert("Bạn đã nhập mã này rồi.");
      if (data.error === "missing_user") return alert("Chưa đăng nhập.");
      return alert("Có lỗi: " + (data.error || "unknown"));
    }

    // chỉ chạy khi ok:true
    const amount = data.amount || 0;

    // Cộng vàng vào localStorage
    const balKey = `goldBalance_${currentUser}`;
    const curBal = Number(localStorage.getItem(balKey) || 0);
    const newBal = curBal + amount;
    localStorage.setItem(balKey, String(newBal));

    // update UI
    const span = document.getElementById('goldAmount');
    if (span) span.textContent = 'Vàng: ' + new Intl.NumberFormat().format(newBal);

    alert(`Nhận ${amount} vàng!`);
  } catch (err) {
    console.error(err);
    alert("Lỗi mạng, thử lại sau.");
  }
}
