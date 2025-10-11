const API = "https://index.nro2024.workers.dev";

async function main() {
  const status = document.getElementById("status");
  const statusNv = document.getElementById("statusNv");
  const balanceBox = document.getElementById("balanceInfo");
  const avatar = document.getElementById("charAvatar");

  let username = localStorage.getItem("currentUser");
  let password = localStorage.getItem("currentPass");
  let accountId = localStorage.getItem("accountId");

  function getAvatar(planet) {
    switch (planet) {
      case "Trái Đất": return "https://forum.ngocrongonline.com/avatar/small1475.png";
      case "Namek": return "https://forum.ngocrongonline.com/avatar/small3932.png";
      case "Xayda": return "https://forum.ngocrongonline.com/avatar/small5339.png";
      default: return "https://www.pngplay.com/wp-content/uploads/12/Goku-No-Background.png";
    }
  }

  async function loginOrCreate(user, pass) {
    const res = await fetch(`${API}/account/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    console.log("Kết quả login:", data);

    // ✅ Nếu có accountId -> đăng nhập thành công
    if (data.accountId) {
      localStorage.setItem("currentUser", user);
      localStorage.setItem("currentPass", pass);
      localStorage.setItem("accountId", data.accountId);
      return { ok: true, created: false, accountId: data.accountId };
    }

// ✅ Nếu API trả "Invalid login" -> thử tạo mới
if (data.error && data.error === "Invalid login") {
  const createRes = await fetch(`${API}/account/register`, {  
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass })
  });
  const createData = await createRes.json();
  console.log("Tạo tài khoản mới:", createData);

  // Nếu tạo mới thành công -> lưu và tiếp tục
  if (createData.accountId) {
    localStorage.setItem("currentUser", user);
    localStorage.setItem("currentPass", pass);
    localStorage.setItem("accountId", createData.accountId);
    return { ok: true, created: true, accountId: createData.accountId };
  }

  // Nếu tạo thất bại (vì user đã có thật sự) -> sai mật khẩu
  if (createData.error && createData.error.includes("exists")) {
    return { ok: false, error: "Sai thông tin đăng nhập." };
  }

  return { ok: false, error: createData.error || "Không thể tạo tài khoản mới." };
}

// fallback lỗi khác
return { ok: false, error: data.error || "Lỗi không xác định." };

  }

  async function loadCharacter() {
    if (!accountId) return;

    const res = await fetch(`${API}/character/load?account=${accountId}`);
    const data = await res.json();

    if (!data.character) {
      balanceBox.style.display = "none";
      status.innerHTML = `<button id="openCreateBoxBtn" class="class-btn">Tạo nhân vật</button>`;
      document.getElementById("openCreateBoxBtn").onclick = () => {
        document.getElementById("createCharBox").style.display = "block";
      };
    } else {
      const char = data.character;
      status.innerHTML = "";
      balanceBox.style.display = "flex";
      document.getElementById("charNameDisplay").innerText = char.name;
      document.getElementById("charIdDisplay").innerText = char.characterId.slice(0, 6);
      document.getElementById("goldAmount").innerText = `${char.balance.toLocaleString()}`;
      avatar.src = getAvatar(char.planet);
    localStorage.setItem("characterName", char.name);
    localStorage.setItem("characterPlanet", char.planet)
    }
  }

  document.getElementById("createBtn").onclick = async () => {
    const name = document.getElementById("charName").value.trim();
    const planet = document.getElementById("charPlanet").value;

    if (name.length < 3 || name.length > 8)
      return alert("Tên nhân vật phải từ 3 đến 8 ký tự!");
    if (!planet || planet === "Chọn hành tinh")
      return alert("Vui lòng chọn hành tinh!");

    const res = await fetch(`${API}/character/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, name, planet })
    });
    const data = await res.json();

    if (data.characterId) {
      closeBox();
      statusNv.style.color = "green";
      statusNv.innerHTML = `Tạo nhân vật thành công!`;
      window.location.reload();
    } else {
      statusNv.style.color = "red";
      statusNv.innerHTML = `Lỗi: ${data.error}`;
    }
  };

  document.getElementById("toggleGoldBtn").onclick = () => {
    const gold = document.getElementById("goldAmount");
    const hide = document.getElementById("goldAmountHide");
    gold.style.display = gold.style.display !== "none" ? "none" : "inline";
    hide.style.display = hide.style.display === "none" ? "inline" : "none";
  };

  if (username && password) {
    const result = await loginOrCreate(username, password);
    if (result.ok) {
      accountId = result.accountId;
      if (result.created) {
        statusNv.style.color = "green";
        statusNv.innerHTML = "Đã tạo tài khoản mới!";
      }
await loadCharacter();
    } else {
      status.innerHTML = result.error;
    }
  } else {
    status.innerHTML = "Vui lòng đăng nhập.";
  }
}

function closeBox() {
  document.getElementById("createCharBox").style.display = "none";
}
