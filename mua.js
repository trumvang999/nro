document.addEventListener(&quot;DOMContentLoaded&quot;, () =&gt; {
  const status = document.getElementById(&quot;acc-status&quot;)?.dataset.status || &quot;&quot;;

  if (status.toLowerCase().includes(&quot;hết&quot;)) {
    const btn = document.querySelector(&#39;#guideSection1 a.btn&#39;);
    if (btn) {
      btn.textContent = &quot;ĐÃ BÁN&quot;;
      btn.style.backgroundColor = &quot;#aaa&quot;;
      btn.style.pointerEvents = &quot;none&quot;;
      btn.style.opacity = &quot;0.7&quot;;
      btn.setAttribute(&quot;aria-disabled&quot;, &quot;true&quot;);
    }
  }
  const SCRIPT_URL = &quot;https://shop.nro2024.workers.dev&quot;;

  const username   = localStorage.getItem(&quot;currentUser&quot;);
  const password   = localStorage.getItem(&quot;currentPass&quot;);
  const accNode    = document.querySelector(&quot;._pt a&quot;);
  const accId      = accNode?.textContent.trim() || &quot;&quot;;
  const infoBox    = document.getElementById(&quot;acc-info&quot;);
  const confirmBtn = document.getElementById(&quot;confirm-buy&quot;);

  const serverEl = document.querySelector(&quot;.sv&quot;);
  const planetEl = document.querySelector(&quot;.ht&quot;);
  const typeEl   = document.querySelector(&quot;.dki&quot;);
  const priceEl  = document.querySelector(&quot;.card&quot;);

  if (!accId) {
    infoBox.innerHTML = `<span style='color:red;'>Không lấy được acc ID</span>`;
    return;
  }

  confirmBtn.style.display = &quot;inline-block&quot;;
  confirmBtn.addEventListener(&quot;click&quot;, async () =&gt; {
    if (!username || !password) {
      alert(&quot;Bạn chưa đăng nhập!&quot;);
      return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = &quot;Đang xử lý...&quot;;

    const buyParams = new URLSearchParams({
      action:   &quot;buy_acc&quot;,
      username,
      password,
      id_acc:   accId
    });

    try {
      const res  = await fetch(`${SCRIPT_URL}?${buyParams}`);
      const text = await res.text();
      const body = JSON.parse(text || &quot;{}&quot;);

      if (!body.success) throw new Error(body.message || &quot;Mua không thành công&quot;);

      infoBox.innerHTML = `<span style='color:green;'>${body.message || &quot;Mua thành công! Xem thông tin tài khoản mật khẩu tại lịch sử mua nick&quot;}</span>`;

      const record = {
        id_acc: accId,
        server: serverEl?.textContent.trim() || &quot;&quot;,
        planet: planetEl?.textContent.trim() || &quot;&quot;,
        type:   typeEl?.textContent.trim() || &quot;&quot;,
        price:  Number(priceEl?.textContent.replace(/\D/g, &quot;&quot;)) || 0
      };

      await addToHistory(record);
      await loadHistoryTable();
      confirmBtn.textContent = &quot;ĐÃ MUA&quot;;
  // &#9989; Đổi nút &quot;ĐẶT MUA&quot; thành &quot;ĐÃ BÁN&quot;
const datMuaBtn = document.querySelector(&#39;#guideSection1 a.btn&#39;);
if (datMuaBtn) {
  datMuaBtn.textContent = &quot;ĐÃ BÁN&quot;;
  datMuaBtn.classList.add(&quot;disabled&quot;); // nếu có style sẵn
  datMuaBtn.style.backgroundColor = &quot;#aaa&quot;; // đổi màu cho rõ
  datMuaBtn.style.pointerEvents = &quot;none&quot;;   // chặn click
  datMuaBtn.style.opacity = &quot;0.7&quot;;          // làm mờ nút
  datMuaBtn.setAttribute(&quot;aria-disabled&quot;, &quot;true&quot;);
}

    } catch (err) {
      infoBox.innerHTML = `<span style='color:red;'>${err.message}</span>`;
    } finally {
      confirmBtn.disabled = false;
      if (confirmBtn.textContent !== &quot;ĐÃ MUA&quot;)
        confirmBtn.textContent = &quot;XÁC NHẬN MUA&quot;;
    }
  });

  async function addToHistory({id_acc, server, planet, type, price}) {
    const params = new URLSearchParams({
      action:   &quot;add_history&quot;,
      username,
      password,
      id_acc,
      server,
      planet,
      type,
      price
    });
    await fetch(`${SCRIPT_URL}?${params}`, { headers: { Accept: &quot;application/json&quot; }});
  }

  window.togglePurchase = function () {
    const box = document.getElementById(&quot;purchase-history-box&quot;);
    const icon = document.getElementById(&quot;purchase-icon&quot;);

    if (box.style.display === &quot;none&quot;) {
      box.style.display = &quot;block&quot;;
      icon.setAttribute(&quot;d&quot;, &quot;M288 384l192 192 192-192H288z&quot;);
      loadHistoryTable();
    } else {
      box.style.display = &quot;none&quot;;
      icon.setAttribute(&quot;d&quot;, &quot;M480 672l192-192H288z&quot;);
    }
  };

  window.loadHistoryTable = async function () {
    const params = new URLSearchParams({
      action: &quot;get_history&quot;,
      username,
      password
    });

    try {
      const res = await fetch(`${SCRIPT_URL}?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || &quot;Không load được lịch sử&quot;);

      const tbody = document.querySelector(&quot;#purchase-table tbody&quot;);
      tbody.innerHTML = &quot;&quot;;
      data.data.forEach(item =&gt; {
        const tr = document.createElement(&quot;tr&quot;);
        tr.innerHTML = `
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${item.id_acc}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${item.user}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${item.pass}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${Number(item.price).toLocaleString()}đ</td>
          <td style='border:1px solid #ccc; padding:8px 10px;width:100%;'>${item.timestamp || &quot;&quot;}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error(&quot;Lỗi khi tải lịch sử:&quot;, err);
      document.querySelector(&quot;#purchase-table tbody&quot;).innerHTML = `
        <tr><td colspan='5' style='color:red;padding:10px;'>&#10060; Không tải được dữ liệu</td></tr>`;
    }
  };

  // Load ngay khi mở trang
  loadHistoryTable();
});
