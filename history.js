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
      
      tbody.innerHTML = "";

      data.data.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${item.acc_id}</td>
          <td>${item.acc_username}</td>
       <td id="${item.tai_khoan}">${item.tai_khoan}
  <button onclick="copyText(' ${item.tai_khoan}')"
    style="margin-left:5px;padding:2px 6px;cursor:pointer;">
<i class="far fa-copy"></i> </button>
</td>

<td id="${item.mat_khau}">
  ${item.mat_khau}
  <button onclick="copyText('${item.mat_khau}')"
    style="margin-left:5px;padding:2px 6px;cursor:pointer;">
<i class="far fa-copy"></i></button>
</td>
          <td>${Number(item.gia).toLocaleString()}đ</td>
          <td>${new Date(item.created_at).toLocaleString("vi-VN")}</td>
        `;

        tbody.appendChild(tr);
      });

    } catch (err) {
      tbody.innerHTML =
        "<tr><td colspan='6' style='color:red;'>Không tải được dữ liệu</td></tr>";
    }
  setupPagination();
  };
