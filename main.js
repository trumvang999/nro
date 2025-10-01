(function(){
  const scriptURL = "https://shop.nro2024.workers.dev/";
  let isRegistering = false;
  let currentPage = 1;
  const itemsPerPage = 5;
  let historyData = [];

  // ===================== Delegated Events =====================
  document.addEventListener("click", e => {
    const id = e.target.id;
    switch(id) {
      case "done": e.preventDefault(); handleSubmit(); break;
      case "switch-link": e.preventDefault(); switchMode(); break;
      case "depositBtn": e.preventDefault(); updateBalance("+"); break;
      case "withdrawBtn": e.preventDefault(); updateBalance("-"); break;
      case "logoutBtn": e.preventDefault(); logoutHandler(); break;
      case "toggle-history": e.preventDefault(); window.toggleHistory(); break;
      case "toggle-purchase": e.preventDefault(); window.togglePurchase(); break;
    }
  });

  document.addEventListener("submit", e => {
    if (e.target.id === "form") { e.preventDefault(); handleSubmit(); }
  });

  // ===================== Đăng ký / Đăng nhập =====================
  function switchMode() {
    isRegistering = !isRegistering;
    document.getElementById("form-title").innerText      = isRegistering ? "Đăng ký" : "Đăng nhập";
    document.getElementById("done").innerText            = isRegistering ? "Đăng ký" : "Đăng nhập";
    document.getElementById("switch-link").innerText     = isRegistering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký";
    document.getElementById("email-wrapper").style.display           = isRegistering ? "block" : "none";
    document.getElementById("confirm-password-wrapper").style.display = isRegistering ? "block" : "none";
    document.getElementById("form-message").innerText = "";
    document.getElementById("form-success").innerText = "";
  }

  function handleSubmit() {
    const u = document.getElementById("username").value.trim().toLowerCase();
    const p = document.getElementById("password").value.trim();
    const email = document.getElementById("email").value.trim();
    const confirm = document.getElementById("confirm-password").value.trim();
    const msg = document.getElementById("form-message");
    const success = document.getElementById("form-success");
    const btn = document.getElementById("done");
    msg.innerText = ""; success.innerText = "";
    btn.disabled = true;
    btn.innerText = isRegistering ? "Đang đăng ký..." : "Đang đăng nhập...";

    // validate
    if (u.length < 3 || p.length < 3) { msg.innerText = "Tài khoản và mật khẩu phải từ 3 ký tự."; return resetBtn(); }
    if (!/[a-zA-Z]/.test(u) || !/[a-zA-Z]/.test(p)) { msg.innerText = "Phải có ít nhất 1 chữ cái."; return resetBtn(); }
    if (isRegistering && p !== confirm) { msg.innerText = "Mật khẩu nhập lại không khớp."; return resetBtn(); }

    const data = new URLSearchParams();
    data.append("action", isRegistering ? "register" : "login");
    data.append("username", u);
    data.append("password", p);
    if (isRegistering) data.append("email", email);

    fetch(scriptURL, { method: "POST", body: data })
      .then(r => r.text())
      .then(txt => {
        if (isRegistering) {
          if (txt.includes("✅")) {
            alert("Đăng ký thành công!");
            success.innerText = "Đăng ký thành công! Vui lòng đăng nhập.";
            setTimeout(switchMode, 1000);
          } else msg.innerText = txt;
        } else {
          if (txt.includes("✅ Đăng nhập thành công")) {
            alert("Đăng nhập thành công!");
            localStorage.setItem("currentUser", u);
            localStorage.setItem("currentPass", p);
            localStorage.setItem("expireTime", Date.now() + 30*60*1000);
            renderUI();
          } else msg.innerText = txt;
        }
      })
      .catch(() => msg.innerText = "Lỗi kết nối!")
      .finally(resetBtn);

    function resetBtn() { btn.disabled = false; btn.innerText = isRegistering ? "Đăng ký" : "Đăng nhập"; }
  }

  // ===================== UI / History =====================
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

    container.classList.add("loading");
    container.classList.remove("loaded");

    const params = new URLSearchParams({ action: "get_user", username: user });

    fetch(scriptURL, { method: "POST", body: params })
      .then(r => r.json())
      .then(info => {
        document.getElementById("balance").innerText =
          parseInt(info.balance,10).toLocaleString() + " VNĐ";

        historyData = (info.history || "").split("\n").filter(Boolean).reverse();
        currentPage = 1;
        renderHistory();

        container.classList.remove("loading");
        container.classList.add("loaded");
        if (historySection) historySection.style.display = historyData.length ? "block" : "none";
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

    historyList.innerHTML = "";
    const totalPages = Math.ceil(historyData.length/itemsPerPage);
    const start = (currentPage-1)*itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = historyData.slice(start,end);

    pageItems.forEach(line => {
      const li = document.createElement("li"); li.textContent = line; historyList.appendChild(li);
    });

    // pagination
    pagination.innerHTML = "";
    const center = document.createElement("center");
    const prevBtn = document.createElement("button"); prevBtn.textContent = "<"; prevBtn.disabled = currentPage<=1;
    prevBtn.onclick = () => changePage(-1);
    const nextBtn = document.createElement("button"); nextBtn.textContent = ">"; nextBtn.disabled = currentPage>=totalPages;
    nextBtn.onclick = () => changePage(1);
    const pageInfo = document.createElement("span"); pageInfo.style.fontSize="13px"; pageInfo.style.margin="5px";
    pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
    center.append(prevBtn,pageInfo,nextBtn); pagination.appendChild(center);
  }

  function changePage(step) {
    const totalPages = Math.ceil(historyData.length/itemsPerPage);
    const nextPage = currentPage+step;
    if(nextPage<1||nextPage>totalPages) return;
    currentPage=nextPage; renderHistory();
  }

  // ===================== Toggle History / Purchase =====================
  window.toggleHistory = function() { 
    const box = document.getElementById("history-section"); 
    if(!box) return;
    box.style.display = box.style.display==="none"?"block":"none"; 
    if(box.style.display==="block") renderHistory(); 
  }

  window.togglePurchase = function() {
    const box = document.getElementById("purchase-history-box");
    if(!box) return;
    box.style.display = box.style.display==="none"?"block":"none";
    if(box.style.display==="block") window.loadHistoryTable();
  }
  window.loadHistoryTable = async function() {
    const username = localStorage.getItem("currentUser");
    const password = localStorage.getItem("currentPass");
    const params = new URLSearchParams({ action:"get_history", username, password });
    try {
      const res = await fetch(`${scriptURL}?${params}`);
      const data = await res.json();
      const tbody = document.querySelector("#purchase-table tbody");
      if(!data.success) throw new Error("Không load được lịch sử");
      tbody.innerHTML = "";
      data.data.forEach(item=>{
        let ts = item.timestamp;
        if(ts && !ts.includes(":")) { 
          const d = new Date(ts); 
          if(!isNaN(d)){ 
            const pad=n=>n<10?"0"+n:n; 
            ts=`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; 
          } 
        }
        const tr=document.createElement("tr");
        tr.innerHTML=`<td>${item.id_acc}</td><td>${item.user}</td><td>${item.pass}</td><td>${Number(item.price).toLocaleString()}đ</td><td>${ts}</td>`;
        tbody.appendChild(tr);
      });
    } catch(err) {
      console.error(err);
      document.querySelector("#purchase-table tbody").innerHTML=`<tr><td colspan="5" style="color:red;">&#10060; Không tải được dữ liệu</td></tr>`;
    }
  }

  // ===================== Logout =====================
  function logoutHandler() {
    localStorage.removeItem("expireTime");
    localStorage.removeItem("currentPass");
    localStorage.removeItem("currentUser");
    location.reload();
  }

  // ===================== Khởi tạo =====================
  window.addEventListener("load", renderUI);

})();
