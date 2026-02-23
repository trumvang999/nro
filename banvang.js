const CLOUD_URL = "https://cloud.nro2024.workers.dev/";
let gia = [];
let botStatus = {};     
let allBotsDetail = []; 

const MAP_NAMES = {
    14: "Làng Kakarot", 23: "Nhà Broly"
};
function getServerFromBotId(botId) {
    if (!botId) return null;
    const match = botId.match(/^v(\d+)/i); // bắt số sau chữ v
    return match ? match[1] : null;
}

async function loadConfig() {
    try {
        const [resConfig, resDetail] = await Promise.all([
            fetch(CLOUD_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "get_config" })
            }),
            fetch(CLOUD_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "get_all_bot_status" })
            })
        ]);

        const dataConfig = await resConfig.json();
        const dataDetail = await resDetail.json();
const config = dataConfig.data || {};

        if (dataConfig.success) {
          gia = [];
botStatus = {};

$('#server option').each(function() {
    const val = $(this).val();
    if (val !== "") {

        const server = parseInt(val);
        const serverData = config[server] || {};

        const gia_vang = serverData.gia_vang || 0;
        const online   = serverData.online || false;

        gia[server - 1] = gia_vang;
        botStatus[server] = online;

        let originalText = $(this).text().split(' [')[0];

        if (gia_vang > 0) {
            $(this).text(originalText).css({
                'color': 'green',
                'font-weight': 'bold'
            });
        } else {
            $(this).text(originalText + " [Bảo trì]").css({
                'color': 'red',
                'font-weight': 'normal'
            });
        }
    }
});
        }

        if (dataDetail.success) {
            allBotsDetail = dataDetail.data || [];
        }

        newFunction(); 
    } catch (e) {
        console.error("Lỗi load cấu hình:", e);
    }
}

function newFunction() {
    const serverVal = $('#server').val();
    const botLabel = $('#bot-status-label');
    const tien = parseInt($('#tien').val()) || 0;

    if (!serverVal || serverVal === "") {
        botLabel.html("<span style='color: ${color}; font-weight: bold;'></span> ");
        $('#PrintTxt').html('Chọn server để xem tỉ giá và vị trí Bot');
        return;
    }

const info = allBotsDetail.find(b => {
    const svFromBot = getServerFromBotId(b.bot_id);
    return svFromBot == serverVal;
});

    if (info) {
    const mapName = MAP_NAMES[info.map_id] || `Map ${info.map_id}`;
    const totalSeconds = Math.floor((Date.now() - info.last_update) / 1000);
    const isOnline = totalSeconds < 300; // 5 phút

    let timeText = "";
    if (totalSeconds < 60) {
        timeText = `${totalSeconds} giây trước`;
    } else {
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        
        if (secs > 0 && days === 0) timeText = `${secs} giây `; 
      if (mins > 0) timeText = `${mins} phút `;
      if (hours > 0) timeText = `${hours} giờ `;
if (days > 0) timeText = `${days} ngày `;             
        timeText += "trước";
    }

    const color = isOnline ? 'green' : 'red';
    const statusText = isOnline ? 'Online' : 'Offline';
    botLabel.html(`
        <span id="isonl" style='background: ${color}; font-weight: bold;'>${statusText}</span> 
        <small style='color: ${color};'> 
            ID Bot: <b>${info.bot_id}</b> - 
            Vị trí: <b>${mapName}</b> - 
            Khu: <b>${info.zone_id}</b>                  </br>
       Cập nhật lần cuối: <b>${timeText}</b></small>
    `);
    } else {
        botLabel.html("<span id='isonl' style='background: red; font-weight: bold;'>Offline</span> <small style='color: red;'>Chưa có dữ liệu vị trí</small>");
    }  
    const serverIdx = parseInt(serverVal) - 1;
    const rate = gia[serverIdx] || 0;
    const total = tien * rate;
    const GOLD_BAR = 37000000;
    const thoiVang = Math.floor(total / GOLD_BAR);
    const vangDu = total % GOLD_BAR;
    const format = n => n.toString().replace(/(.)(?=(\d{3})+$)/g, '$1,');

    if (rate === 0) {
      $('#PrintTxt').html('Server này hiện không hỗ trợ');
      $('#goldAmount').text('0 vàng');
      $('#golds').text('0 thỏi');
      $('#idgd').text('');
      return;
    }

    if (tien < 5000 || tien > 1000000) {
      $('#PrintTxt').html('Số tiền mua ít nhất 5,000đ');
    } else {
      $('#PrintTxt').html(
        'Vũ trụ <b>' + serverVal + '</b> - Giá bán: x<b>' + rate + '</b>' +
        ' → Nhận: <b>' + format(Math.floor(total)) + '</b> Vàng<br> ' +
        '→ Quy đổi: <b>' + thoiVang + '</b> thỏi + <b>' + format(vangDu) + '</b> vàng'
      );

      $('#idgd').text('ID: v' + serverVal + 'nro2024');
      $('#goldAmount').text(format(Math.floor(total)) + ' vàng');
      $('#golds').text(thoiVang + ' thỏi + ' + format(vangDu) + ' vàng');
    }
  }
  $(document).ready(function() {
 loadConfig(); 

    // CHỈ ĐẶT 1 LẦN DUY NHẤT Ở ĐÂY - 20 giây cập nhật 1 lần
    setInterval(function() {
        loadConfig();
    }, 20000); 

    $('#server').change(newFunction);
    $('#tien').on('input focus keyup', newFunction);

    const tienInput = document.getElementById("tien");
    if (tienInput) {
      ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
        tienInput.addEventListener(event, function() {
          if (/^\d*$/.test(this.value)) {
            this.oldValue = this.value;
          } else if (this.hasOwnProperty("oldValue")) {
            this.value = this.oldValue;
          } else {
            this.value = "";
          }
        });
      });
    }
  });

  // HÀM HELPER CHO MODAL (Cần để modal hoạt động)
  function getGoldRate(serverIndex) {
    return gia[serverIndex] || 0;
  }
  function getCurrentUser() {
    return localStorage.getItem("currentUser") || "";
  }

  // === Mở modal xác nhận ===
  function openGoldModal() {
    const currentUser = getCurrentUser();
    if (!currentUser) return showTB("Vui lòng đăng nhập!", "error");

    const serverSel = document.getElementById("server");
    const serverText = serverSel.options[serverSel.selectedIndex].text;
    const serverVal = parseInt(serverSel.value);

    const userGame = document.getElementById("user").value.trim();
    const tien = parseInt(document.getElementById("tien").value) || 0;

    if (!serverVal || !userGame)
      return showTB("Nhập đầy đủ thông tin", "error");
    if (tien < 5000)
          return showTB("Mua tối thiểu 5.000đ", "error");

    const rate = getGoldRate(serverVal - 1);
    const gold = tien * rate;

    document.getElementById("modalServer").textContent = serverText;
    document.getElementById("modalUser").textContent = userGame;
    document.getElementById("modalTien").textContent = tien.toLocaleString("vi-VN") + "đ";
    document.getElementById("modalGold").textContent = gold.toLocaleString("vi-VN") + " Vàng";
    document.getElementById("modalRate").textContent = "x" + rate;

    document.getElementById("goldModal").style.display = "block";
  }

  function closeGoldModal() {
    document.getElementById("goldModal").style.display = "none";
  }

  // === Hiển thị thông báo trạng thái ===
    function showTB(msg, type = "info") {
    let status = document.getElementById("status");
    status.textContent = msg;
    status.style.color = type === "error" ? "red" : type === "success" ? "green" : "orange";
  }
  function showStatus(msg, type = "info") {
    let status = document.getElementById("statusBox");
    status.textContent = msg;
    status.style.color = type === "error" ? "red" : type === "success" ? "green" : "orange";
  }

// === Gửi đơn mua vàng ===
async function confirmBuyGold() {
  
  const currentUser = getCurrentUser();
  const currentPass = localStorage.getItem("currentPass")
  if (!currentUser) return showTB("Vui lòng đăng nhập!", "error");
const btn = document.getElementById("btnok")
  const server = document.getElementById("modalServer").textContent;
  const userGame = document.getElementById("modalUser").textContent;
  const tienText = document.getElementById("modalTien").textContent;
const goldType = document.querySelector('input[name="gold_type"]:checked')?.value || "vang_tuoi";
  const tien = parseInt(tienText.replace(/[^\d]/g, "")) || 0;

  if (!userGame || tien < 5000)
    return showStatus("Thiếu thông tin hoặc số tiền không hợp lệ!", "error");

  // Lấy tỉ giá theo server
  const serverSel = document.getElementById("server");
  const serverVal = parseInt(serverSel.value);
	const rate = getGoldRate(serverVal - 1);
  const gold = tien * rate; // 

    showStatus("Đang gửi đơn hàng...", "info");
  btn.disabled = true;

  const originalText = btn.innerHTML;

  btn.innerHTML = "Đang gửi...";
       $('#gold-img').attr('src', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEja0oA0pHg4RBH2LX51EMtGhQJIWnbZoH3npIasuUYrqmhzvapDkWNQ8Hb9zNiRxoveZJ4BjObHc-lePS_WVHVg_rtl7eQzX5yNQo2dU5DpNIw0rWlXhmrZ47SzY-659C8i2fEqcPE-gMK-dbcHf00An_-bruJY1qt5DHArDvCK7xfPwT_qXVh8agyIgJDX/s1600/Screenshot%202025-12-14%20094917.png');
                     $('#goldAmount').css('display', 'none'); 
               $('#golds').css('display', 'none'); 
           $('#idgd').css('display', 'none'); 
  setTimeout(() => {
     $('#gold-img').attr('src', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhp-hfnj5sW0WYy4WUKnXTQZA-iD79bbbKaWBfIwCwgL4cSWZ4WZ4MX4IOs_L6N5yWn15Gs_GMkWktZEC2Vao-JzIUFcz7noDz6AV8mFyHXB98PlKCJEuu5cKV9VK_VZx8iRbUJ5jQ1nFNcXiagY38qW8FB7FnS_9Lq-Ri1u87ixzogMPS3yXS3cEBvgipX/s1600/Screenshot%202025-12-14%20094824.png');
           $('#goldAmount').css('display', 'block'); 
               $('#golds').css('display', 'block'); 
           $('#idgd').css('display', 'block'); 
 }, 3000);
  try {
    const res = await fetch(CLOUD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_donhang",
        username: currentUser,
        pass: currentPass,
        loai_don: "Đơn dịch vụ",
        ten_dv: "Mua vàng",
        server: server,
        so_tien: tien,
        tai_khoan: userGame, 
        mat_khau: "", 
        ghi_chu: goldType,
      }),
    });

    const data = await res.json();

    if (data.success) {
      showStatus("Đặt mua vàng thành công!", "success");
      showTB("Vui lòng đến địa điểm giao dịch với bot!", "success");

      setTimeout(() => {
        closeGoldModal();
      }, 3000);

      loadOrderHistory();
    } else {
        showStatus("Không thể gửi đơn hàng!", "error");
      showTB(data.message || "Đặt đơn thất bại", "error");
      closeGoldModal();
    }
  } catch (e) {
    showStatus("Lỗi kết nối server", "error");
    showTB("Không thể kết nối máy chủ!", "error");
  }
}


  document.getElementById("btnBuyGold").addEventListener("click", (e) => {
    e.preventDefault();
    openGoldModal();
  });

  window.onclick = (e) => {
    const modal = document.getElementById("goldModal");
    if (e.target === modal) closeGoldModal();
  };

// === Lịch sử mua vàng ===
async function loadOrderHistory() {
  const currentUser = getCurrentUser();
  const currentPass = localStorage.getItem("currentPass");
  const tbody = document.querySelector("#orderTable tbody");

  if (!currentUser || !currentPass) {
    tbody.innerHTML = `<tr><td colspan="7">Chưa có giao dịch.</td></tr>`;
    return;
  }

  try {
    const res = await fetch(CLOUD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_gold_history",
        user: currentUser,
        pass: currentPass
      }),
    });

    const data = await res.json();
    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="7">Không tải được dữ liệu</td></tr>`;
      return;
    }

    const orders = data.data || [];
    tbody.innerHTML = "";

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">Chưa có đơn mua vàng</td></tr>`;
      return;
    }

    orders.forEach((o) => {
      let status = o.status || "";
      let color = "gray";

      if (/done|hoàn/i.test(status)) color = "green";
      else if (/cancel|huỷ|hủy/i.test(status)) color = "red";
      else if (/pending|chờ/i.test(status)) color = "orange";

      const row = `
        <tr>
          <td>${new Date(o.created_at).toLocaleString("vi-VN")}</td>
          <td>${o.type ?? "Mua vàng"}</td>
          <td>${o.server ?? ""}</td>
          <td>${Number(o.so_tien ?? 0).toLocaleString("vi-VN")}đ</td>
          <td>${o.idgame ?? ""}</td>
          <td>${o.gold ?? "? Vàng"}</td>
          <td style="color:${color};font-weight:bold;">
            ${status}
          </td>
        </tr>
      `;

      tbody.innerHTML += row;
    });

  } catch (err) {
    console.error("Lỗi load lịch sử:", err);
    tbody.innerHTML = `<tr><td colspan="7">Lỗi tải dữ liệu</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", loadOrderHistory);
