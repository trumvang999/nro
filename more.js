// ====== SLIDER CONTROL ======
let slideIndex = 0;
function showSlides(n) {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;
  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;
  document.querySelector(".slider").style.transform = `translateX(-${slideIndex * 100}%)`;
}
function nextSlide() { showSlides(++slideIndex); }
function prevSlide() { showSlides(--slideIndex); }

// ====== HIỂN THỊ CHI TIẾT ======
function showDetail(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const modal = document.getElementById("product-detail");
  const body = document.getElementById("detail-body");

  // Slider nhiều ảnh
  const sliderHTML = `
    <div class="slider-container">
      <div class="slider">
        ${product.img.map(src => `
          <div class="slide"><img src="${src}" alt="${product.name}"></div>
        `).join("")}
      </div>
      ${product.img.length > 1 ? `
        <button class="slider-btn prev" onclick="prevSlide()">&#10094;</button>
        <button class="slider-btn next" onclick="nextSlide()">&#10095;</button>
      ` : ""}
    </div>
  `;

  // Nội dung chi tiết
  body.innerHTML = `
    <h3>${product.name}</h3>
    ${sliderHTML}
    <p><b>Rank:</b> ${product.rank}</p>
    <p><b>Trang phục:</b> ${product.skin}</p>
    <p><b>Thông tin:</b> ${product.info}</p>
    <p class="price">${product.price}</p>
    <p>${product.desc}</p>
    <button class="btn-buy" style="margin-top:10px;">MUA NGAY</button>
  `;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  slideIndex = 0;
  showSlides(0);

  // Bật zoom ảnh
  enableZoom();
}

// ====== THU PHÓNG ẢNH ======
function enableZoom() {
  document.querySelectorAll(".slide img").forEach(img => {
    img.onclick = () => img.classList.toggle("zoomed");
  });
}

// ====== ĐÓNG POPUP ======
function closeDetail() {
  const modal = document.getElementById("product-detail");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// ====== ĐÓNG KHI CLICK RA NGOÀI ======
window.onclick = function(event) {
  const modal = document.getElementById("product-detail");
  if (event.target === modal) closeDetail();
};

// ====== MENU MOBILE ======
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  document.body.classList.toggle("menu-open");
});

// ====== ĐÓNG MENU KHI CLICK RA NGOÀI ======
document.addEventListener("click", (e) => {
  if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    navMenu.classList.remove("active");
    document.body.classList.remove("menu-open");
  }
});

// ====== TAB CHUYỂN ĐỔI TRÊN MOBILE ======
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    // Xóa trạng thái active cũ
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    // Gán lại trạng thái active mới
    btn.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});
