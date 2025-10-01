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
$(function () {
  /* =====================
     TOGGLE NIGHT MODE
  ====================== */
  $(".toggle-light").click(function () {
    $("html").toggleClass("night-mode");
    $(".slider").toggleClass("checked");

    if ($("html").hasClass("night-mode")) {
      localStorage.setItem("nightmode", "true");
    } else {
      localStorage.setItem("nightmode", "false");
    }
  });


  /* =====================
     DROPDOWN MENUS
  ====================== */
  $(".tb").each(function () {
    var d = $(this);
    $(".dropsss", d).click(function (e) {
      e.preventDefault();
      let $div = $(".tb-menu", d);
      $div.toggle();
      $(".tb-menu").not($div).hide();
      return false;
    });
  });

  $("html,.drop,.drops,.dropss,.dropdwn").click(function () {
    $(".tb-menu").hide();
    $(".tb button.dropsss:after").hide();
    $(".recent-comments ul").empty();
    $("#numcomments").val("0");
    $("#allcomments").val("");
    $(".load_cmt").removeClass("spinner load");
  });

  $("html").click(function () {
    $(".tg-menu").hide();
  });

  $(".dd").each(function () {
    var d = $(this);
    $(".drops", d).click(function (e) {
      e.preventDefault();
      let $div = $(".dd-menu", d);
      $div.toggle();
      $(".dd-menu").not($div).hide();
      return false;
    });
  });

  $("html,.drop,.dropss,.dropsss,.dropdwn").click(function () {
    $(".dd-menu").hide();
  });

  $(".dds").each(function () {
    var d = $(this);
    $(".dropdwn", d).click(function (e) {
      e.preventDefault();
      let $div = $(".dds-menu", d);
      $div.toggle();
      $(".dds-menu").not($div).hide();
      return false;
    });
  });

  $("html,.drop,.drops,.dropss,.dropsss").click(function () {
    $(".dds-menu").hide();
  });

  $("button.dropss").click(function (e) {
    e.stopPropagation();
    $(".au-menu").toggleClass("hidden");
  });

  $(".au-menu").click(function (e) {
    e.stopPropagation();
  });

  $("html,.drop,.drops,.dropsss,.dropdown-link,.dropdwn,.bg_Se input").click(function () {
    $(".au-menu").addClass("hidden");
  });

  $("#backer .open").click(function (e) {
    e.stopPropagation();
    $("#backer .list-label-widget-content").removeClass("invisible");
    $("#backer button.open").addClass("hidden");
    $("#backer button.close").removeClass("hidden");
  });

  $("#backer .list-label-widget-content").click(function (e) {
    e.stopPropagation();
  });

  $("html,.drop,.drops,.dropss,.dropsss,.dropdown-link,.dropdwn,.bg_Se input").click(function () {
    $("#backer .list-label-widget-content").addClass("invisible");
    $("#backer button.open").removeClass("hidden");
    $("#backer button.close").addClass("hidden");
  });

  /* =====================
     OVERLAY MENU
  ====================== */
  $(".menu-container .turn-off").on("click", function () {
    $("body").css("overflow", "hidden");
    $(".dim-overlay").removeClass("hidden");
    $(".post-body").addClass("centered");
    $(".dim-overlay,.turn-on").click(function () {
      $("body").css("overflow", "");
      $(".dim-overlay").addClass("hidden");
      $(".post-body").removeClass("centered");
    });
  });

  $(".drops").on("click", function () {
    $(".overlay").removeClass("hidden");
    $("html").click(function () {
      $(".overlay").addClass("hidden");
    });
  });

  /* =====================
     SEARCH (AJAX JSONP)
  ====================== */
  $(".peekar input").on("keyup", function () {
    var textinput = $(this).val();
    if (textinput) {
      $.ajax({
        type: "GET",
        url: "/feeds/posts/summary",
        data: {
          "max-results": 25,
          alt: "json",
          q: textinput,
        },
        dataType: "jsonp",
        success: function (data) {
          $(".results,.clear-text").removeClass("hidden");
          $(".results").empty();
          if (data.feed.entry) {
            for (var i = 0; i < data.feed.entry.length; i++) {
              for (var j = 0; j < data.feed.entry[i].link.length; j++) {
                if (data.feed.entry[i].link[j].rel == "alternate") {
                  var postUrl = data.feed.entry[i].link[j].href;
                  break;
                }
              }
              var postTitle = data.feed.entry[i].title.$t;
              $(".results").append(
                '<li><a href="' + postUrl + '" title="' + postTitle + '">' + postTitle + "</a></li>"
              );
            }
          } else {
            $(".results").addClass("hidden");
          }
        },
      });
    } else {
      $(".results,.clear-text").addClass("hidden");
      $(".results").empty();
    }
  });

  $(".clear-text").click(function () {
    $(".peekar input").val("");
    $(".results,.clear-text").addClass("hidden");
    $(".results").empty();
  });

  /* =====================
     SCROLL TO TOP
  ====================== */
  $.fn.scrollToTop = function () {
    $(this).hide().removeAttr("href");
    if ($(window).scrollTop() != 0) $(this).fadeIn("slow");
    var o = $(this);
    $(window).scroll(function () {
      if ($(window).scrollTop() == 0) $(o).fadeOut("slow");
      else $(o).fadeIn("slow");
    });
    $(this).click(function () {
      $("html, body").animate({ scrollTop: 0 }, "slow");
    });
  };
  $(".MD-StoTop").scrollToTop();

  /* =====================
     LOGIN POPUP
  ====================== */
  $(".login-popup").on("click", function (e) {
    e.preventDefault();
    $(".btn-popup").addClass("is-visible");
  });
  $(".btn-popup").on("click", function (e) {
    if ($(e.target).is(".btn-popup-close") || $(e.target).is(".btn-popup")) {
      e.preventDefault();
      $(this).removeClass("is-visible");
    }
  });
  $(document).keyup(function (e) {
    if (e.which == 27) $(".btn-popup").removeClass("is-visible");
  });

  /* =====================
     COPY TO CLIPBOARD
  ====================== */
  function copyTextToClipboard(t) {
    var e = document.createElement("textarea");
    e.value = t;
    document.body.appendChild(e);
    e.select();
    try {
      document.execCommand("copy");
    } catch (t) {
      alert("Copy thất bại!");
    }
    document.body.removeChild(e);
  }

  $(".copy").click(function () {
    copyTextToClipboard(location.href);
    $(".modal-dialog,.dialog").removeClass("hidden");
    $(".dialog,.modal-dialog-buttons button").click(function () {
      $(".modal-dialog,.dialog").addClass("hidden");
    });
  });

  /* =====================
     SOCIAL POPUP WINDOW
  ====================== */
  var postEl = document.getElementsByClassName("social-wrapper");
  var postCount = postEl.length;
  for (let i = 0; i < postCount; i++) {
    postEl[i].addEventListener("click", function () {
      var url = this.getAttribute("data-href"),
        h = 450,
        w = 400,
        l = screen.width / 2 - w / 2,
        t = screen.height / 2 - h / 2;
      window.open(
        url,
        "popUpWindow",
        "height=" +
          h +
          ",width=" +
          w +
          ",left=" +
          l +
          ",top=" +
          t +
          ",resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes"
      );
    });
  }
});
