(function(){
  const scriptURL = "https://api.nro2024.com"; 
  let isRegistering = false;
  const DEFAULT_AVATAR = "https://img.nro2024.com/blog/1782009714463-abb12c12-d0ce-4c1a-ae53-3fbbe2791e41.png";

  /* ---------- Cấp VIP (đồng bộ ngưỡng hiển thị tên với backend) ---------- */
  const VIP_INFO = [
    { name: "Thành Viên",   color: "#888888" },
    { name: "Đồng",         color: "#b5651d" },
    { name: "Bạc",          color: "#9aa5b1" },
    { name: "Vàng",         color: "#f1c40f" },
    { name: "Bạch Kim",     color: "#00bcd4" },
    { name: "Kim Cương",    color: "#3b82f6" },
    { name: "Cao Thủ",      color: "#8e44ad" },
    { name: "Đại Cao Thủ",  color: "#e74c3c" },
    { name: "Chiến Thần",   color: "#ff5722" },
    { name: "Huyền Thoại",  color: "#ff0090" }
  ];

  function renderVipBadge(vipLevel) {
    const badge = document.getElementById("vip-badge");
    if (!badge) return;
    const lvl = Math.min(Math.max(parseInt(vipLevel, 10) || 0, 0), VIP_INFO.length - 1);
    const info = VIP_INFO[lvl];
    badge.textContent = "VIP " + lvl;
    badge.style.color = info.color;
    badge.style.borderColor = info.color;
    badge.style.background = info.color + "22";
  }

  function applyAvatar(url) {
    const img = document.getElementById("user-avatar");
    if (img) img.src = url || DEFAULT_AVATAR;
  }

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
    if (window.turnstile) {
  turnstile.reset();
}
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
  const captchaField = document.querySelector(
  'input[name="cf-turnstile-response"]'
);
const captcha = captchaField ? captchaField.value : "";
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

// ❌ Không cho chứa ký tự đặc biệt
if (!/^[a-zA-Z0-9_]+$/.test(u)) {
  msg.innerText = "Tài khoản không được chứa kí tự đặc biệt.";
  return resetBtn();
}

if (!/[a-zA-Z]/.test(u) || !/[a-zA-Z]/.test(p)) {
  msg.innerText = "Tài khoản và mật khẩu phải chứa ít nhất một chữ cái.";
  return resetBtn();
}
if (!captcha) {
  msg.innerText = "Vui lòng xác nhận captcha.";
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
  data.append("cf-turnstile-response", captcha);
    if (isRegistering) data.append("email", email);

    // fetch
fetch(scriptURL + "?action=" + (isRegistering ? "register" : "login"), {
  method: "POST",
  body: data,
  credentials: "include"
})
.then(r => r.json())
.then(res => {

if (!res.success) {
  msg.innerText = res.message || "Có lỗi xảy ra";

  if (window.turnstile) {
    turnstile.reset();
  }

  return;
}

  if (isRegistering) {
    success.innerText = "Đăng ký thành công! Vui lòng đăng nhập.";
    setTimeout(switchMode, 1000);
    if (window.turnstile) {
  turnstile.reset();
}

  } else {
    localStorage.setItem("expireTime", Date.now() + 180 * 60 * 1000);
    success.innerText = "Đăng nhập thành công!";
    loadUser();
setTimeout(() => {
  location.href = "/p/tai-khoan.html";
}, 1000);
  }

})
.catch(() => {
  msg.innerText = "Lỗi kết nối!";
})
.finally(resetBtn);


    function resetBtn() {
      btn.disabled = false;
      btn.innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    }
  }

const itemsPerPage = 10;
let historyData = [];

function renderUI() {

  fetch(scriptURL + "?action=get_user", {
    method: "POST",
    credentials: "include"
  })
  .then(r => r.json())
  .then(info => {

if (!info.success) {
    showCookieWarning();
    return;
}
    document.getElementById("form").style.display = "none";
    document.getElementById("switch-link").style.display = "none";
    document.getElementById("user-panel").style.display = "block";
    document.getElementById("user-display").innerText = info.username;
    document.getElementById("user-id").innerText = info.id;
    if (info.role == "ctv"){
      document.getElementById("role").innerHTML = `<a href="/p/cong-tac-vien.html" class="role ctv">${info.role}</a>`;
    }
    else{
      document.getElementById("role").innerHTML = `<a class="role">${info.role}</a>`;
    }
    document.getElementById("user-gold").innerText = info.so_du_vang.toLocaleString() + " vàng";
    document.getElementById("user-gem").innerText = info.so_du_ngoc.toLocaleString() + " ngọc";
    document.getElementById("form-title").textContent = "Thông tin tài khoản";
    localStorage.setItem("idgame", info.idgame);
    document.getElementById("email-user").innerText = info.email;
    document.getElementById("name-user").innerText = info.username;

    applyAvatar(info.avatar);
    renderVipBadge(info.vip);
    const totalNapEl = document.getElementById("total-nap");
    if (totalNapEl) totalNapEl.innerText = (parseInt(info.tong_nap, 10) || 0).toLocaleString() + "đ";

    loadBalance();

  });
}

function loadBalance(user) {
  const container = document.getElementById("balance-container");
  const historySection = document.getElementById("history-section");
  const historyList = document.getElementById("history");

  container.classList.add("loading");
  container.classList.remove("loaded");

const params = new URLSearchParams();
params.append("action", "get_user");

fetch(scriptURL + "?action=get_user", {
  method: "POST",
  credentials: "include"
})
    .then(r => r.json())
    .then(info => {
      document.getElementById("balance").innerText =
        parseInt(info.balance, 10).toLocaleString() + "đ";
// --- Đồng bộ số dư lên header ---
const headerBalance = document.getElementById("header-balance");
if (headerBalance) {
  headerBalance.textContent = parseInt(info.balance, 10).toLocaleString() + "đ";
}

      applyAvatar(info.avatar);
      renderVipBadge(info.vip);
      const totalNapEl = document.getElementById("total-nap");
      if (totalNapEl) totalNapEl.innerText = (parseInt(info.tong_nap, 10) || 0).toLocaleString() + "đ";

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

  // 7. Logout
 function logoutHandler() {

  fetch(scriptURL + "?action=logout", {
    method: "POST",
    credentials: "include"
  }).finally(() => {
    localStorage.clear();
    location.reload();
  });
}

  /* ---------- 8. Popup đổi avatar ---------- */
  function bindAvatarModal() {
    const openBtn   = document.getElementById("btnEditAvatar");
    const modal     = document.getElementById("avatarModal");
    const closeBtn  = document.getElementById("closeAvatarModal");
    const submitBtn = document.getElementById("submitAvatar");
    const input     = document.getElementById("avatarInput");
    const preview   = document.getElementById("avatarPreview");
    const msg       = document.getElementById("avatarMsg");
    if (!openBtn || !modal) return;

    openBtn.addEventListener("click", function () {
      const current = document.getElementById("user-avatar");
      const currentSrc = current ? current.src : DEFAULT_AVATAR;
      input.value = currentSrc;
      preview.src = currentSrc;
      msg.innerText = "";
      modal.classList.add("is-visible");
    });

    if (closeBtn) closeBtn.addEventListener("click", function () {
      modal.classList.remove("is-visible");
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.classList.remove("is-visible");
    });

    input.addEventListener("input", function () {
      preview.src = input.value.trim();
    });
    preview.addEventListener("error", function () {
      preview.src = DEFAULT_AVATAR;
    });

    submitBtn.addEventListener("click", function () {
      const avatar = input.value.trim();
      msg.innerText = "";

      if (!/^https?:\/\/.+/i.test(avatar)) {
        msg.innerText = "Link ảnh không hợp lệ (phải bắt đầu http:// hoặc https://).";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = "Đang lưu...";

      fetch(scriptURL + "?action=update_avatar", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar })
      })
        .then(r => r.json())
        .then(res => {
          if (!res.success) {
            msg.innerText = res.message || "Cập nhật thất bại";
            return;
          }
          applyAvatar(res.avatar || avatar);
          msg.style.color = "var(--ns-success, #25c668)";
          msg.innerText = "Cập nhật avatar thành công!";
          setTimeout(function () { modal.classList.remove("is-visible"); }, 800);
        })
        .catch(function () {
          msg.innerText = "Lỗi kết nối!";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.innerText = "Lưu";
        });
    });
  }

  // 9. Khởi tạo
  window.addEventListener("load", function () {
    renderUI();
    bindAvatarModal();
  });
})();

    function togglePurchase() {
    const box = document.getElementById("purchase-history-box");

    if (box.style.display === "none") {
      box.style.display = "block";
      loadHistoryTable();
    } else {
      box.style.display = "none";
    }
  };

function toggleHistory() {
  const box = document.getElementById("history-section");

  if (!box) return;

    if (box.style.display === "none") {
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }
};
function showCookieWarning() {
  document.getElementById("cookieWarning").style.display = "flex";
}

function closeCookieWarning() {
  document.getElementById("cookieWarning").style.display = "none";
}
