const API = "https://index.nro2024.workers.dev";

async function main() {
  const status = document.getElementById("status");
  const statusNv = document.getElementById("statusNv");
  const balanceBox = document.getElementById("balanceInfo");
  const avatar = document.getElementById("charAvatar");

  // 1. Thay đổi nguồn lấy dữ liệu: Chỉ dùng idgame
  let accountId = localStorage.getItem("idgame");

  function getAvatar(planet) {
    switch (planet) {
      case "Trái Đất": return "https://forum.ngocrongonline.com/avatar/small1475.png";
      case "Namek": return "https://forum.ngocrongonline.com/avatar/small523.png";
      case "Xayda": return "https://forum.ngocrongonline.com/avatar/small5339.png";
      default: return "https://www.pngplay.com/wp-content/uploads/12/Goku-No-Background.png";
    }
  }

  // 2. Hàm xử lý đăng nhập/tạo tài khoản dựa trên accountId
  async function loginOrCreate(id) {
    // Thử login chỉ với accountId
    const res = await fetch(`${API}/account/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: id }) 
    });
    const data = await res.json();

    // Nếu tồn tại -> OK
    if (res.ok && data.accountId) {
      return { ok: true, created: false, accountId: data.accountId };
    }

    // Nếu không tồn tại -> Gọi API đăng ký (Register) để tạo mới
    // Lưu ý: Backend Register cũng cần sửa để nhận accountId
    const createRes = await fetch(`${API}/account/register`, {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: id })
    });
    const createData = await createRes.json();

    if (createData.accountId) {
      return { ok: true, created: true, accountId: createData.accountId };
    }

    return { ok: false, error: createData.error || "Lỗi hệ thống tài khoản." };
  }

  async function loadCharacter() {
    if (!accountId) return;

    // Load nhân vật dựa trên accountId (idgame)
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
      document.getElementById("charIdDisplay").innerText = String(char.characterId).slice(0, 6);
      document.getElementById("goldAmount").innerText = `${char.balance.toLocaleString()}`;
      avatar.src = getAvatar(char.planet);
      localStorage.setItem("characterName", char.name);
      localStorage.setItem("characterPlanet", char.planet);
    }
  }

  // Xử lý nút tạo nhân vật
  document.getElementById("createBtn").onclick = async () => {
    const name = document.getElementById("charName").value.trim();
    const planet = document.getElementById("charPlanet").value;

    if (name.length < 3 || name.length > 8)
      return alert("Tên nhân vật phải từ 3 đến 8 ký tự!");
    if (!planet || planet === "Chọn hành tinh")
      return alert("Vui lòng chọn hành tinh!");

    // Check trùng tên
    const checkRes = await fetch(`${API}/character/check-name?name=${encodeURIComponent(name)}`);
    const checkData = await checkRes.json();
    if (checkData.exists) {
      alert("Tên nhân vật đã tồn tại!");
      return;
    }

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

  // Logic khởi chạy (Entry Point)
  if (accountId) {
    const result = await loginOrCreate(accountId);
    if (result.ok) {
      // Đăng nhập/Tạo thành công
      if (result.created) {
        console.log("Hệ thống đã tự động tạo ID mới");
      }
      await loadCharacter();
    } else {
      status.innerHTML = `<span style="color:red">${result.error}</span>`;
    }
  } else {
    status.innerHTML = "Chưa đăng nhập.";
  }
}

function closeBox() {
  document.getElementById("createCharBox").style.display = "none";
}

// Đừng quên gọi hàm main()
main();
