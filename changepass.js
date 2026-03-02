const API_URL = "https://account.nro2024.workers.dev/";

const modal = document.getElementById("changePassModal");
const btnOpen = document.getElementById("btnChangePass");
const btnClose = document.getElementById("closeModal");
const btnSubmit = document.getElementById("submitChangePass");
const msgBox = document.getElementById("changePassMsg");

btnOpen.onclick = () => {
  modal.style.display = "flex";
  msgBox.innerText = "";
};

btnClose.onclick = () => {
  modal.style.display = "none";
};

btnSubmit.onclick = async () => {
  const oldPass = document.getElementById("oldPass").value.trim();
  const newPass = document.getElementById("newPass").value.trim();
  const RenewPass = document.getElementById("RenewPass").value.trim();

  // 1️⃣ check rỗng
  if (!oldPass || !newPass || !RenewPass) {
    msgBox.style.color = "red";
    msgBox.innerText = "Vui lòng nhập đầy đủ thông tin";
    return;
  }

  // 2️⃣ check khớp
    if (newPass === oldPass) {
    msgBox.style.color = "red";
    msgBox.innerText = "Mật khẩu mới cần khác mật khẩu cũ";
    return;
  }
  if (newPass !== RenewPass) {
    msgBox.style.color = "red";
    msgBox.innerText = "Mật khẩu nhập lại không khớp";
    return;
  }

  // 3️⃣ check có ít nhất 1 chữ cái
  if (!/[a-zA-Z]/.test(newPass)) {
    msgBox.style.color = "red";
    msgBox.innerText = "Mật khẩu mới phải chứa ít nhất 1 chữ cái";
    return;
  }

  try {
    const res = await fetch(`${API_URL}?action=change_password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_password: oldPass,
        new_password: newPass
      })
    });

    const data = await res.json();

    if (data.success) {
      msgBox.style.color = "green";
      msgBox.innerText = data.message || "Đổi mật khẩu thành công";

      setTimeout(() => {
        modal.style.display = "none";
        document.getElementById("oldPass").value = "";
        document.getElementById("newPass").value = "";
        document.getElementById("RenewPass").value = "";

        fetch(`${API_URL}?action=logout`, {
          method: "POST",
          credentials: "include"
        }).finally(() => {
          localStorage.clear();
        });
      }, 1200);

    } else {
      msgBox.style.color = "red";
      msgBox.innerText = data.message || "Đổi mật khẩu thất bại";
    }

  } catch (err) {
    msgBox.style.color = "red";
    msgBox.innerText = "Lỗi kết nối server";
  }
};
</script>
 <script>
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("toggle-order");
  const box = document.getElementById("toggle-order-box");

  // Ẩn mặc định
  box.style.display = "none";

  let isOpen = false;

  btn.addEventListener("click", function () {
    if (isOpen) {
      box.style.display = "none";   // đóng
    } else {
      box.style.display = "block";  // mở
    }
    isOpen = !isOpen;
  });
});
