(function(){
  const scriptURL = "https://shop.nro2024.workers.dev";
  let isRegistering = false;

  document.addEventListener("click", e => {
    const id = e.target.id;
    if (id === "done") { e.preventDefault(); handleSubmit(); return; }
    if (id === "switch-link") { e.preventDefault(); switchMode(); }
    if (id === "logoutBtn") { e.preventDefault(); logoutHandler(); }
  });

  function switchMode() {
    isRegistering = !isRegistering;
    document.getElementById("form-title").innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    document.getElementById("done").innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    document.getElementById("switch-link").innerText = isRegistering
      ? "Đã có tài khoản? Đăng nhập"
      : "Chưa có tài khoản? Đăng ký";
    document.getElementById("email-wrapper").style.display = isRegistering ? "block" : "none";
    document.getElementById("confirm-password-wrapper").style.display = isRegistering ? "block" : "none";
  }

  // ✅ Login / Register
  function handleSubmit() {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const email = document.getElementById("email").value.trim();
    const confirm = document.getElementById("confirm-password").value.trim();
    const msg = document.getElementById("form-message");
    const success = document.getElementById("form-success");
    const btn = document.getElementById("done");

    msg.innerText = "";
    success.innerText = "";
    btn.disabled = true;
    btn.innerText = isRegistering ? "Đang đăng ký..." : "Đang đăng nhập...";

    if (isRegistering && p !== confirm) {
      msg.innerText = "Mật khẩu nhập lại không khớp.";
      return resetBtn();
    }

    const data = new URLSearchParams();
    data.append("action", isRegistering ? "register" : "login");
    data.append("username", u);
    data.append("password", p);
    if (isRegistering) data.append("email", email);

    fetch(scriptURL, { method: "POST", body: data })
      .then(r => r.json())
      .then(res => {
        if (isRegistering) {
          if (res.success) {
            success.innerText = "✅ Đăng ký thành công! Vui lòng đăng nhập.";
            setTimeout(switchMode, 1000);
          } else msg.innerText = res.message || "Đăng ký thất bại.";
        } else {
          if (res.success) {
            alert("Đăng nhập thành công!");
            localStorage.setItem("token", res.token);
            localStorage.setItem("loginTime", Date.now());
            renderUI();
          } else msg.innerText = res.message || "Sai tài khoản hoặc mật khẩu.";
        }
      })
      .catch(() => msg.innerText = "Lỗi kết nối!")
      .finally(resetBtn);

    function resetBtn() {
      btn.disabled = false;
      btn.innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    }
  }

  // ✅ Kiểm tra token tự động khi mở trang
  async function checkAutoLogin() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const res = await fetch(`${scriptURL}?action=check_token&token=${token}`);
    const data = await res.json();
    if (data.valid) {
      renderUI(data.username, data.balance);
      return true;
    } else {
      localStorage.removeItem("token");
      return false;
    }
  }

  // ✅ Giao diện sau khi login
  function renderUI(username, balance) {
    document.getElementById("form").style.display = "none";
    document.getElementById("switch-link").style.display = "none";
    document.getElementById("user-panel").style.display = "block";
    document.getElementById("user-display").innerText = username;
    document.getElementById("balance").innerText =
      parseInt(balance || 0, 10).toLocaleString() + " VNĐ";
	  document.getElementById("form-title").textContent = "Thông tin tài khoản";
  }

  function logoutHandler() {
    localStorage.clear();
    location.reload();
  }

  // ✅ Auto-run
  window.addEventListener("load", async () => {
    const loggedIn = await checkAutoLogin();
    if (!loggedIn) {
      document.getElementById("form").style.display = "block";
      document.getElementById("switch-link").style.display = "block";
    }
  });
})();


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
// --- Đồng bộ số dư lên header ---
const headerBalance = document.getElementById("header-balance");
if (headerBalance) {
  headerBalance.textContent = parseInt(info.balance, 10).toLocaleString() + " VNĐ";
}
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
  	localStorage.clear();
    location.reload();
  }

  // 8. Khởi tạo
  window.addEventListener("load", renderUI);
})();
