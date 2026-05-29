const SCRIPT_URL = "https://api.nro2024.com";

async function loadHistoryTable() {
  const tbody = document.querySelector("#purchase-table tbody");
    tbody.innerHTML = "<tr><td colspan='6'>Đang tải...</td></tr>";

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
          "<tr><td colspan='6' style='color:#666;'>Chưa có giao dịch</td></tr>";
        return;
      }
        const list = data.data || [];

const totalPurchase = list.length;

const totalMoney = list.reduce((sum, item) => {
  return sum + Number(item.gia || 0);
}, 0);

const uniqueServers = new Set(
  list.map(item => item.acc_username || "")
).size;

const latest = list[0];

document.getElementById("total-purchase").textContent =
  totalPurchase;

document.getElementById("total-money").textContent =
  totalMoney.toLocaleString("vi-VN") + "đ";

      tbody.innerHTML =
          "<tr><td colspan='6' style='color:#666;'>Chưa có giao dịch</td></tr>";
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
        "<tr><td colspan='6' style='color:red;'>Không tải được dữ liệu</td></tr>";
    }
  setupPagination();
  };
