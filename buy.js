document.addEventListener("DOMContentLoaded", () => {

  const SCRIPT_URL = "https://api.nro2024.shop";

  const accNode    = document.querySelector("._pt a");
  const accId      = accNode?.textContent.trim() || "";
  const infoBox    = document.getElementById("acc-info");
  const confirmBtn = document.getElementById("confirm-buy");

  if (!accId) {
    infoBox.innerHTML = `<span style='color:red;'>Không lấy được acc ID</span>`;
    return;
  }
  checkAccStatus(accId);


  // ================= MUA ACC =================
  confirmBtn.addEventListener("click", async () => {

    confirmBtn.disabled = true;
    confirmBtn.textContent = "Đang xử lý...";

    try {

      const form = new URLSearchParams();
      form.append("acc_id", accId);

      const res = await fetch(`${SCRIPT_URL}?action=buy`, {
        method: "POST",
        body: form,
        credentials: "include"
      });

      const data = await res.json();

      if (!data.success)
        throw new Error(data.message || "Mua không thành công");

      infoBox.innerHTML = `
        <span style='color:green;'>Mua thành công</span>
        <br/>
       <div class='acc-area'> Tài khoản: <b>${data.tai_khoan}</b>
        <br/>
        Mật khẩu: <b>${data.mat_khau}</b> 
</div>
      `;
	
      confirmBtn.textContent = "ĐÃ MUA";

      // Disable nút đặt mua
      const datMuaBtn = document.querySelector('#guideSection1 a.btn');
      if (datMuaBtn) {
        datMuaBtn.textContent = "ĐÃ BÁN";
        datMuaBtn.style.backgroundColor = "#aaa";
        datMuaBtn.style.pointerEvents = "none";
        datMuaBtn.style.opacity = "0.7";
      }
  checkAccStatus(accId);
      loadHistoryTable();

    } catch (err) {
      infoBox.innerHTML = `<span style='color:red;'>${err.message}</span>`;
      confirmBtn.textContent = "XÁC NHẬN MUA";
    }

    confirmBtn.disabled = false;
  });


  // ================= LOAD LỊCH SỬ MUA =================
  function copyTexts(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert("Đã copy"))
    .catch(() => alert("Copy thất bại"));
}

  window.loadHistoryTable = async function () {

    const tbody = document.querySelector("#purchase-table tbody");
    tbody.innerHTML = "<tr><td colspan='5'>Đang tải...</td></tr>";

    try {

      const res = await fetch(`${SCRIPT_URL}?action=purchase_history`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();

      if (!data.success)
        throw new Error(data.message || "Không load được lịch sử");

      if (!data.data || data.data.length === 0) {
        tbody.innerHTML =
          "<tr><td colspan='5' style='color:#666;'>Chưa có giao dịch</td></tr>";
        return;
      }

      tbody.innerHTML = "";

      data.data.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td style='border:1px solid #ccc;padding:8px;'>${item.acc_id}</td>
          <td style='border:1px solid #ccc;padding:8px;'>${item.acc_username}</td>
       <td style="border:1px solid #ccc;padding:8px;" id=" ${item.tai_khoan}">
  ${item.tai_khoan}
  <button onclick="copyText(' ${item.tai_khoan}')"
    style="margin-left:5px;padding:2px 6px;cursor:pointer;">
<svg height='14' id='Copy_24' style='height:14px;width:14px' viewBox='0 0 24 24' width='14' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect fill='#000000' height='24' opacity='0' stroke='none' width='24'/>
<g transform='matrix(1 0 0 1 12 12)'>
<path d='M 4 2 C 2.895 2 2 2.895 2 4 L 2 18 L 4 18 L 4 4 L 18 4 L 18 2 L 4 2 z M 8 6 C 6.895 6 6 6.895 6 8 L 6 20 C 6 21.105 6.895 22 8 22 L 20 22 C 21.105 22 22 21.105 22 20 L 22 8 C 22 6.895 21.105 6 20 6 L 8 6 z M 8 8 L 20 8 L 20 20 L 8 20 L 8 8 z' stroke-linecap='round' style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;' transform=' translate(-12, -12)'/>
</g>
</svg>  </button>
</td>

<td style="border:1px solid #ccc;padding:8px;" id="${item.mat_khau}">
  ${item.mat_khau}
  <button onclick="copyText('${item.mat_khau}')"
    style="margin-left:5px;padding:2px 6px;cursor:pointer;">
<svg height='14' id='Copy_24' style='height:14px;width:14px' viewBox='0 0 24 24' width='14' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect fill='#000000' height='24' opacity='0' stroke='none' width='24'/>
<g transform='matrix(1 0 0 1 12 12)'>
<path d='M 4 2 C 2.895 2 2 2.895 2 4 L 2 18 L 4 18 L 4 4 L 18 4 L 18 2 L 4 2 z M 8 6 C 6.895 6 6 6.895 6 8 L 6 20 C 6 21.105 6.895 22 8 22 L 20 22 C 21.105 22 22 21.105 22 20 L 22 8 C 22 6.895 21.105 6 20 6 L 8 6 z M 8 8 L 20 8 L 20 20 L 8 20 L 8 8 z' stroke-linecap='round' style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;' transform=' translate(-12, -12)'/>
</g>
</svg>  </button>
</td>
          <td style='border:1px solid #ccc;padding:8px;'>${Number(item.gia).toLocaleString()}đ</td>
          <td style='border:1px solid #ccc;padding:8px;'>${new Date(item.created_at).toLocaleString("vi-VN")}</td>
        `;

        tbody.appendChild(tr);
      });

    } catch (err) {
      tbody.innerHTML =
        "<tr><td colspan='5' style='color:red;'>Không tải được dữ liệu</td></tr>";
    }
  };


  // ================= TOGGLE =================
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

// ================= CHECK INFO =================
async function checkAccStatus(accId) {
  try {

    const voucher = document.getElementById("voucher")?.value || "";

    const res = await fetch(`${SCRIPT_URL}?action=check_acc_status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acc_id: accId,
        voucher: voucher
      })
    });

    const data = await res.json();

    const statusEl = document.getElementById("acc-status");
    const buyBtn = document.getElementById("confirm-buy");

    if (!data.success) {
      statusEl.innerText = "Lỗi kiểm tra";
      return;
    }

    // ===== STATUS =====
    statusEl.innerText = data.status;

    if (data.status === "Hết") {
      statusEl.style.color = "red";
      buyBtn.disabled = true;
      buyBtn.innerText = "Đã bán";
    } else {
      statusEl.style.color = "green";
      buyBtn.disabled = false;
      buyBtn.innerText = "Xác nhận mua";
    }

    // ===== PRICE =====
    const productPrice = data.price;
    const discountPrice = data.final_price;

    // ===== GÁN CHUYỂN KHOẢN =====
    document.getElementById("display-amount").innerText =
      productPrice.toLocaleString() + " VNĐ";
	  
    document.getElementById("discount-amount").innerText =
      discountPrice.toLocaleString() + " VNĐ";
	  
    const productName =
      document.querySelector("#ttin .post-title-02 a")?.innerText ||
      "Không rõ sản phẩm";

    document.getElementById("display-content").innerText = productName;

    // ===== TAB THẺ CÀO =====
    document.getElementById("original-price").innerText =
      productPrice.toLocaleString() + " VNĐ";

    const increased = productPrice * 1.25;
    const rounded = roundUpTo10k(increased);

    document.getElementById("card-price").innerText =
      rounded.toLocaleString() + " VNĐ";

  } catch (err) {
    console.error(err);
  }
}
});
