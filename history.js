function togglePurchase() {
  const box = document.getElementById("purchase-history-box");
  const icon = document.getElementById("purchase-icon");

  if (box.style.display === "none") {
    box.style.display = "block";
    loadHistoryTable(); // gọi API mỗi khi mở
  } else {
    box.style.display = "none";
  }
}

async function loadHistoryTable() {
  const username = localStorage.getItem("currentUser");
  const password = localStorage.getItem("currentPass");

  const SCRIPT_URL = "https://shop.nro2024.workers.dev";

  const params = new URLSearchParams({
    action: "get_history",
    username,
    password
  });

  try {
    const res = await fetch(`${SCRIPT_URL}?${params}`);
    const data = await res.json();

    if (!data.success) throw new Error("Không load được lịch sử");

    const tbody = document.querySelector("#purchase-table tbody");
    tbody.innerHTML = "";
   if (data.count === 0 || data.data.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan='5' style='padding:10px;color:#666;'>Chưa có giao dịch nào.</td></tr>`;
      return;
    }
    data.data.forEach(item => {
      const tr = document.createElement("tr");
      let timestamp = item.timestamp || "";

      // Nếu timestamp là dạng ISO hoặc không đúng định dạng, ta xử lý lại
      if (timestamp && !timestamp.includes(":")) {
        const dateObj = new Date(timestamp);
        if (!isNaN(dateObj)) {
          const pad = n => (n < 10 ? "0" + n : n);
          timestamp = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())} ${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()}`;
        }
      }

      tr.innerHTML = `
        <td style='border:1px solid #ccc; padding:8px 10px;'>${item.id_acc}</td>
        <td style='border:1px solid #ccc; padding:8px 10px;'>${item.user}</td>
        <td style='border:1px solid #ccc; padding:8px 10px;'>${item.pass}</td>
        <td style='border:1px solid #ccc; padding:8px 10px;'>${Number(item.price).toLocaleString()}đ</td>
        <td style='border:1px solid #ccc; padding:8px 10px;'>${timestamp}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Lỗi khi tải lịch sử:", err);
    document.querySelector("#purchase-table tbody").innerHTML = `<tr><td colspan='5' style='color:red;padding:10px;'>&#10060; Không tải được dữ liệu</td></tr>`;
  }
}
