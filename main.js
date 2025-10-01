(function(){
  const scriptURL = "https://shop.nro2024.workers.dev/";
  let isRegistering = false;
  let currentPage = 1;
  const itemsPerPage = 5;
  let historyData = [];

  // ---------------- Event Delegation ----------------
  document.addEventListener("click", e => {
    const id = e.target.id;
    switch(id) {
      case "done": e.preventDefault(); handleSubmit(); break;
      case "switch-link": e.preventDefault(); switchMode(); break;
      case "depositBtn": e.preventDefault(); updateBalance("+"); break;
      case "withdrawBtn": e.preventDefault(); updateBalance("-"); break;
      case "logoutBtn": e.preventDefault(); logoutHandler(); break;
      case "toggle-history":
      case "toggle-purchase": e.preventDefault(); toggleHistory(); break;
    }
  });

  document.addEventListener("submit", e => {
    if (e.target.id === "form") { e.preventDefault(); handleSubmit(); }
  });

  // ---------------- Auth ----------------
  function switchMode() {
    isRegistering = !isRegistering;
    const get = id => document.getElementById(id);
    get("form-title").innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    get("done").innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    get("switch-link").innerText = isRegistering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký";
    get("email-wrapper").style.display = isRegistering ? "block" : "none";
    get("confirm-password-wrapper").style.display = isRegistering ? "block" : "none";
    get("form-message").innerText = "";
    get("form-success").innerText = "";
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
    btn.disabled = true; btn.innerText = isRegistering ? "Đang đăng ký..." : "Đang đăng nhập...";

    if(u.length<3 || p.length<3){ msg.innerText="Tài khoản và mật khẩu phải từ 3 ký tự"; return resetBtn(); }
    if(!/[a-zA-Z]/.test(u)||!/[a-zA-Z]/.test(p)){ msg.innerText="Phải chứa ít nhất 1 chữ cái"; return resetBtn(); }
    if(isRegistering && p!==confirm){ msg.innerText="Mật khẩu nhập lại không khớp"; return resetBtn(); }

    const data = new URLSearchParams();
    data.append("action", isRegistering ? "register" : "login");
    data.append("username", u); data.append("password", p);
    if(isRegistering) data.append("email", email);

    fetch(scriptURL, { method:"POST", body:data })
      .then(r=>r.text())
      .then(txt=>{
        if(isRegistering){
          if(txt.includes("✅")){ alert("Đăng ký thành công!"); success.innerText="Vui lòng đăng nhập"; setTimeout(switchMode,1000); }
          else msg.innerText=txt;
        }else{
          if(txt.includes("✅ Đăng nhập thành công")){
            alert("Đăng nhập thành công!");
            localStorage.setItem("currentUser", u);
            localStorage.setItem("currentPass", p);
            localStorage.setItem("expireTime", Date.now()+30*60*1000);
            location.reload();
          }else msg.innerText=txt;
        }
      })
      .catch(()=>{ msg.innerText="Lỗi kết nối"; })
      .finally(resetBtn);

    function resetBtn(){ btn.disabled=false; btn.innerText=isRegistering?"Đăng ký":"Đăng nhập"; }
  }

  // ---------------- UI ----------------
  function renderUI() {
    const u = localStorage.getItem("currentUser");
    if(!u) return;
    document.getElementById("form").style.display="none";
    const panel = document.getElementById("user-panel");
    if(panel) panel.style.display="block";
    const display = document.getElementById("user-display");
    if(display) display.innerText=u;
    document.getElementById("form-title").textContent="Thông tin tài khoản";
    loadBalance(u);
  }

  function loadBalance(user){
    const container = document.getElementById("balance-container");
    if(container) container.classList.add("loading");
    const params = new URLSearchParams();
    params.append("action","get_user");
    params.append("username",user);

    fetch(scriptURL,{method:"POST",body:params})
      .then(r=>r.json())
      .then(info=>{
        const bal = document.getElementById("balance");
        if(bal) bal.innerText=parseInt(info.balance||0,10).toLocaleString()+" VNĐ";
        const raw = info.history || "";
        historyData = raw.split("\n").filter(Boolean).reverse();
        currentPage=1; renderHistory();
        if(container) { container.classList.remove("loading"); container.classList.add("loaded"); }
      })
      .catch(err=>{
        console.error("loadBalance error:",err);
        if(container) { container.classList.remove("loading"); container.classList.add("loaded"); }
      });
  }

  function renderHistory(){
    const list = document.getElementById("history");
    const pag = document.getElementById("pagination");
    if(!list||!pag) return;
    list.innerHTML="";

    const totalPages=Math.ceil(historyData.length/itemsPerPage);
    const start=(currentPage-1)*itemsPerPage;
    const end=start+itemsPerPage;
    const pageItems=historyData.slice(start,end);

    pageItems.forEach(line=>{
      const li=document.createElement("li");
      li.textContent=line;
      list.appendChild(li);
    });

    pag.innerHTML="";
    const center=document.createElement("center");
    const prevBtn=document.createElement("button");
    prevBtn.textContent="<"; prevBtn.disabled=currentPage<=1;
    prevBtn.addEventListener("click",()=>changePage(-1));
    const nextBtn=document.createElement("button");
    nextBtn.textContent=">"; nextBtn.disabled=currentPage>=totalPages;
    nextBtn.addEventListener("click",()=>changePage(1));
    const info=document.createElement("span");
    info.style.fontSize="13px"; info.style.margin="5px";
    info.textContent=`Trang ${currentPage}/${totalPages}`;
    center.appendChild(prevBtn); center.appendChild(info); center.appendChild(nextBtn);
    pag.appendChild(center);
  }

  function changePage(step){
    const totalPages=Math.ceil(historyData.length/itemsPerPage);
    const nextPage=currentPage+step;
    if(nextPage<1||nextPage>totalPages) return;
    currentPage=nextPage; renderHistory();
  }

  function toggleHistory(){
    const box=document.getElementById("history-section")||document.getElementById("purchase-history-box");
    if(!box) return;
    if(box.style.display==="none"){ box.style.display="block"; loadHistoryTable(); }
    else box.style.display="none";
  }

  async function loadHistoryTable(){
    const username=localStorage.getItem("currentUser");
    const password=localStorage.getItem("currentPass");
    if(!username||!password) return;
    const params = new URLSearchParams({ action:"get_history", username, password });

    try{
      const res = await fetch(scriptURL+"?"+params);
      const data = await res.json();
      if(!data.success) throw new Error("Không load được lịch sử");
      const tbody=document.querySelector("#purchase-table tbody");
      if(!tbody) return;
      tbody.innerHTML="";
      data.data.forEach(item=>{
        let ts=item.timestamp||"";
        if(ts && !ts.includes(":")){ const d=new Date(ts); if(!isNaN(d)){ const pad=n=>n<10?"0"+n:n; ts=`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; } }
        const tr=document.createElement("tr");
        tr.innerHTML=`<td style='border:1px solid #ccc; padding:8px 10px;'>${item.id_acc}</td>
                      <td style='border:1px solid #ccc; padding:8px 10px;'>${item.user}</td>
                      <td style='border:1px solid #ccc; padding:8px 10px;'>${item.pass}</td>
                      <td style='border:1px solid #ccc; padding:8px 10px;'>${Number(item.price).toLocaleString()}đ</td>
                      <td style='border:1px solid #ccc; padding:8px 10px;'>${ts}</td>`;
        tbody.appendChild(tr);
      });
    }catch(err){ console.error(err); const tbody=document.querySelector("#purchase-table tbody"); if(tbody) tbody.innerHTML=`<tr><td colspan='5' style='color:red;padding:10px;'>&#10060; Không tải được dữ liệu</td></tr>`;}
  }

  function logoutHandler(){ localStorage.removeItem("expireTime"); localStorage.removeItem("currentPass"); localStorage.removeItem("currentUser"); location.reload(); }

  window.addEventListener("load", renderUI);
})();
