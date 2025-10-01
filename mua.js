document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("acc-status")?.dataset.status || "";

  if (status.toLowerCase().includes("hết")) {
    const btn = document.querySelector('#guideSection1 a.btn');
    if (btn) {
      btn.textContent = "ĐÃ BÁN";
      btn.style.backgroundColor = "#aaa";
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.7";
      btn.setAttribute("aria-disabled", "true");
    }
  }

  const SCRIPT_URL = "https://shop.nro2024.workers.dev";

  const username   = localStorage.getItem("currentUser");
  const password   = localStorage.getItem("currentPass");
  const accNode    = document.querySelector("._pt a");
  const accId      = accNode?.textContent.trim() || "";
  const infoBox    = document.getElementById("acc-info");
  const confirmBtn = document.getElementById("confirm-buy");

  const serverEl = document.querySelector(".sv");
  const planetEl = document.querySelector(".ht");
  const typeEl   = document.querySelector(".dki");
  const priceEl  = document.querySelector(".card");

  if (!accId) {
    infoBox.innerHTML = `<span style='color:red;'>Không lấy được acc ID</span>`;
    return;
  }

  confirmBtn.style.display = "inline-block";
  confirmBtn.addEventListener("click", async () => {
    if (!username || !password) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = "Đang xử lý...";

    const buyParams = new URLSearchParams({
      action:   "buy_acc",
      username,
      password,
      id_acc:   accId
    });

    try {
      const res  = await fetch(`${SCRIPT_URL}?${buyParams}`);
      const text = await res.text();
      const body = JSON.parse(text || "{}");

      if (!body.success) throw new Error(body.message || "Mua không thành công");

      infoBox.innerHTML = `<span style='color:green;'>${body.message || "Mua thành công! Xem thông tin tài khoản mật khẩu tại lịch sử mua nick"}</span>`;

      const record = {
        id_acc: accId,
        server: serverEl?.textContent.trim() || "",
        planet: planetEl?.textContent.trim() || "",
        type:   typeEl?.textContent.trim() || "",
        price:  Number(priceEl?.textContent.replace(/\D/g, "")) || 0
      };

      await addToHistory(record);
      await loadHistoryTable();
      confirmBtn.textContent = "ĐÃ MUA";

      // ✅ Đổi nút "ĐẶT MUA" thành "ĐÃ BÁN"
      const datMuaBtn = document.querySelector('#guideSection1 a.btn');
      if (datMuaBtn) {
        datMuaBtn.textContent = "ĐÃ BÁN";
        datMuaBtn.classList.add("disabled");
        datMuaBtn.style.backgroundColor = "#aaa";
        datMuaBtn.style.pointerEvents = "none";
        datMuaBtn.style.opacity = "0.7";
        datMuaBtn.setAttribute("aria-disabled", "true");
      }

    } catch (err) {
      infoBox.innerHTML = `<span style='color:red;'>${err.message}</span>`;
    } finally {
      confirmBtn.disabled = false;
      if (confirmBtn.textContent !== "ĐÃ MUA")
        confirmBtn.textContent = "XÁC NHẬN MUA";
    }
  });

  async function addToHistory({id_acc, server, planet, type, price}) {
    const params = new URLSearchParams({
      action:   "add_history",
      username,
      password,
      id_acc,
      server,
      planet,
      type,
      price
    });
    await fetch(`${SCRIPT_URL}?${params}`, { headers: { Accept: "application/json" }});
  }

  window.togglePurchase = function () {
    const box = document.getElementById("purchase-history-box");
    const icon = document.getElementById("purchase-icon");

    if (box.style.display === "none") {
      box.style.display = "block";
      icon.setAttribute("d", "M288 384l192 192 192-192H288z");
      loadHistoryTable();
    } else {
      box.style.display = "none";
      icon.setAttribute("d", "M480 672l192-192H288z");
    }
  };

  window.loadHistoryTable = async function () {
    const params = new URLSearchParams({
      action: "get_history",
      username,
      password
    });

    try {
      const res = await fetch(`${SCRIPT_URL}?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Không load được lịch sử");

      const tbody = document.querySelector("#purchase-table tbody");
      tbody.innerHTML = "";
      data.data.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${item.id_acc}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${item.user}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${item.pass}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${Number(item.price).toLocaleString()}đ</td>
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${item.timestamp || ""}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error("Lỗi khi tải lịch sử:", err);
      document.querySelector("#purchase-table tbody").innerHTML = `
        <tr><td colspan='5' style='color:red;padding:10px;'>&#10060; Không tải được dữ liệu</td></tr>`;
    }
  };

  // Load ngay khi mở trang
  loadHistoryTable();
});
