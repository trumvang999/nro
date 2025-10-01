//<![CDATA[
 const currentUser = localStorage.getItem(&quot;currentUser&quot;) || &quot;guest&quot;;
  const giftKey     = &quot;gift_claimed_&quot; + currentUser;
  const btn         = document.getElementById(&quot;claim-gift-btn&quot;);
  const msgBox      = document.getElementById(&quot;gift-message&quot;);
  const wrapper     = document.getElementById(&quot;gift-container&quot;);

  const SCRIPT_URL = &quot;https://shop.nro2024.workers.dev/&quot;;

  window.addEventListener(&quot;DOMContentLoaded&quot;, () =&gt; {
    if (currentUser === &quot;guest&quot;) {
      btn.style.display   = &quot;inline-block&quot;;
      msgBox.style.display= &quot;none&quot;;
    } else if (localStorage.getItem(giftKey) === &quot;1&quot;) {
      btn.style.display   = &quot;none&quot;;
    } else {
      btn.style.display   = &quot;inline-block&quot;;
    }
  });

  btn.addEventListener(&quot;click&quot;, () =&gt; {
    if (currentUser === &quot;guest&quot;) {
      alert(&quot;Vui lòng đăng nhập để nhận quà!&quot;);
      return;
    }
    if (localStorage.getItem(giftKey) === &quot;1&quot;) return;

    btn.disabled = true; // &#9989; Chặn spam click tại đây

    fetch(SCRIPT_URL, {
      method: &quot;POST&quot;,
      headers: { &quot;Content-Type&quot;: &quot;application/x-www-form-urlencoded&quot; },
      body: new URLSearchParams({
        action:   &quot;claim_gift&quot;,
        username: currentUser
      })
    })
    .then(r =&gt; r.text())
    .then(msg =&gt; {
      localStorage.setItem(giftKey, &quot;1&quot;);
      msgBox.innerText     = msg;
      btn.style.display    = &quot;none&quot;;
      msgBox.style.display = &quot;block&quot;;
      if (typeof loadBalance === &quot;function&quot;) loadBalance();
      setTimeout(() =&gt; wrapper.remove(), 1000);
    })
    .catch(err =&gt; {
      alert(&quot;Lỗi kết nối:\n&quot; + err);
      btn.disabled = false; // 🔁 Cho phép click lại nếu lỗi
    });
  });
(function(){
  const scriptURL = "https://shop.nro2024.workers.dev/";
  let isRegistering = false;

  // 1. Delegated events
  document.addEventListener("click", e => {
    const id = e.target.id;
    if (id === "done") {
      e.preventDefault(); handleSubmit(); return;
    }
    if (id === "switch-link") {
      e.preventDefault(); switchMode();
    }
    if (id === "depositBtn") {
      e.preventDefault(); updateBalance("+");
    }
    if (id === "withdrawBtn") {
      e.preventDefault(); updateBalance("-");
    }
    if (id === "logoutBtn") {
      e.preventDefault(); logoutHandler();
    }
  });

  document.addEventListener("submit", e => {
    if (e.target.id === "form") {
      e.preventDefault(); handleSubmit();
    }
  });

  // 2. Chuyển Đăng nhập ↔ Đăng ký
  function switchMode() {
    isRegistering = !isRegistering;
    document.getElementById("form-title").innerText      = isRegistering ? "Đăng ký" : "Đăng nhập";
    document.getElementById("done").innerText            = isRegistering ? "Đăng ký" : "Đăng nhập";
    document.getElementById("switch-link").innerText     = isRegistering
      ? "Đã có tài khoản? Đăng nhập"
      : "Chưa có tài khoản? Đăng ký";
    document.getElementById("email-wrapper").style.display           = isRegistering ? "block" : "none";
    document.getElementById("confirm-password-wrapper").style.display = isRegistering ? "block" : "none";
    document.getElementById("form-message").innerText = "";
    document.getElementById("form-success").innerText = "";
  }

  // 3. Xử lý đăng ký / đăng nhập
  function handleSubmit() {
    const u       = document.getElementById("username").value.trim().toLowerCase();
    const p       = document.getElementById("password").value.trim();
    const email   = document.getElementById("email").value.trim();
    const confirm = document.getElementById("confirm-password").value.trim();
    const msg     = document.getElementById("form-message");
    const success = document.getElementById("form-success");
    const btn     = document.getElementById("done");
    msg.innerText = ""; success.innerText = "";
    btn.disabled = true;
    btn.innerText = isRegistering ? "Đang đăng ký..." : "Đang đăng nhập...";

    // validate
    if (u.length < 3 || p.length < 3) {
      msg.innerText = "Tài khoản và mật khẩu phải từ 3 ký tự.";
      return resetBtn();
    }
    if (!/[a-zA-Z]/.test(u) ||!/[a-zA-Z]/.test(p)) {
      msg.innerText = "Tài khoản và mật khẩu phải chứa ít nhất một chữ cái.";
      return resetBtn();
    }
    if (isRegistering && p !== confirm) {
      msg.innerText = "Mật khẩu nhập lại không khớp.";
      return resetBtn();
    }

    // build params
    const data = new URLSearchParams();
    data.append("action", isRegistering ? "register" : "login");
    data.append("username", u);
    data.append("password", p);
    if (isRegistering) data.append("email", email);

    // fetch
    fetch(scriptURL, { method: "POST", body: data })
      .then(r => r.text())
      .then(txt => {
        if (isRegistering) {
          if (txt.includes("✅")) {
			            alert("Đăng ký thành công!");
            success.innerText = "Đăng ký thành công! Vui lòng đăng nhập.";
            setTimeout(switchMode, 1000);
          } else {
            msg.innerText = txt;
          }
        } else {
          if (txt.includes("✅ Đăng nhập thành công")) {
            // báo thành công rồi reload trang
            alert("Đăng nhập thành công!");
localStorage.setItem("currentUser", u);
localStorage.setItem("currentPass", p); 
localStorage.setItem("expireTime", Date.now() + 30 * 60 * 1000); // 30 phút

            location.reload();
          } else {
            msg.innerText = txt;
          }
        }
      })
      .catch(() => { msg.innerText = "Lỗi kết nối!"; })
      .finally(resetBtn);

    function resetBtn() {
      btn.disabled = false;
      btn.innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    }
  }

const itemsPerPage = 5;
let historyData = [];

function renderUI() {
  const u = localStorage.getItem("currentUser");
  if (!u) return;

  document.getElementById("form").style.display = "none";
  document.getElementById("switch-link").style.display = "none";
  document.getElementById("user-panel").style.display = "block";
  document.getElementById("user-display").innerText = u;
  document.getElementById("form-title").textContent = "Thông tin tài khoản";
  loadBalance(u);

}

function loadBalance(user) {
  const container = document.getElementById("balance-container");
  const historySection = document.getElementById("history-section");
  const historyList = document.getElementById("history");

  container.classList.add("loading");
  container.classList.remove("loaded");

  const params = new URLSearchParams();
  params.append("action", "get_user");
  params.append("username", user);

  fetch(scriptURL, { method: "POST", body: params })
    .then(r => r.json())
    .then(info => {
      document.getElementById("balance").innerText =
        parseInt(info.balance, 10).toLocaleString() + " VNĐ";

      // Xử lý lịch sử và kiểm tra dữ liệu đầu vào
      const raw = info.history || "";

      historyData = raw
        .split("\n") // tách từng dòng
        .filter(Boolean) // bỏ dòng trống
        .reverse(); // mới nhất lên đầu

      window.historyData = historyData; // expose global để debug


      currentPage = 1;
      renderHistory();

      setTimeout(() => {
        container.classList.remove("loading");
        container.classList.add("loaded");
        if (historySection) historySection.style.display = "none";
      }, 50);
    })
    .catch(err => {
      console.error("loadBalance error:", err);
      container.classList.remove("loading");
      container.classList.add("loaded");
    });
}

function renderHistory() {
  const historyList = document.getElementById("history");
  const pagination = document.getElementById("pagination");

  if (!historyList || !pagination) return;

  historyList.innerHTML = ""; // reset dữ liệu cũ

  const totalPages = Math.ceil(window.historyData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = historyData.slice(start, end);

  pageItems.forEach(line => {
    const li = document.createElement("li");
    li.textContent = line;
    historyList.appendChild(li);
  });

  pagination.innerHTML = ""; // reset phân trang

  const center = document.createElement("center");

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "<";
  prevBtn.disabled = currentPage <= 1;
  prevBtn.addEventListener("click", () => changePage(-1));

  const nextBtn = document.createElement("button");
  nextBtn.textContent = ">";
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.addEventListener("click", () => changePage(1));

  const pageInfo = document.createElement("span");
  pageInfo.style.fontSize = "13px";
  pageInfo.style.margin = "5px";
  pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;

  center.appendChild(prevBtn);
  center.appendChild(pageInfo);
  center.appendChild(nextBtn);

  pagination.appendChild(center);
}

function changePage(step) {
  const totalPages = Math.ceil(window.historyData.length / itemsPerPage);
  const nextPage = currentPage + step;

  console.log(`Đang ở trang ${currentPage}, muốn chuyển sang ${nextPage}`);

  if (nextPage < 1 || nextPage > totalPages) return;

  currentPage = nextPage;
  renderHistory();
}

function toggleHistory() {
  const box = document.getElementById("history-section");
  const icon = document.getElementById("purchase-icon");

  if (box.style.display === "none") {
    box.style.display = "block";
    loadHistoryTable(); // gọi API mỗi khi mở
  } else {
    box.style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", function () {

  const btn = document.getElementById("toggle-history");
  if (btn) {
    btn.addEventListener("click", toggleHistory);
  }

});

  // 7. Logout
  function logoutHandler() {
  localStorage.removeItem("expireTime");
  localStorage.removeItem("currentPass");
    localStorage.removeItem("currentUser");
    location.reload();
  }

  // 8. Khởi tạo
  window.addEventListener("load", renderUI);
})();

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
//]]>
