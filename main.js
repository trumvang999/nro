// merged-script.js
// Gộp và dọn dẹp hai file JS của bạn, đảm bảo không trùng hàm và hoạt động mượt.
;(function () {
  const SCRIPT_URL = 'https://shop.nro2024.workers.dev';

  // ---------- State ----------
  let isRegistering = false;
  const itemsPerPage = 5;
  let historyData = [];
  let currentPage = 1;

  // ---------- Helpers ----------
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }
  function safeText(node) { return node ? node.textContent.trim() : ''; }
  function formatPrice(n) { return Number(n || 0).toLocaleString() + 'đ'; }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function formatTimestamp(ts) {
    if (!ts) return '';
    // if ts is ISO or number-like
    const d = new Date(ts);
    if (!isNaN(d)) {
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
    }
    return ts;
  }

  // ---------- Network helpers ----------
  async function apiGet(paramsObj) {
    const params = new URLSearchParams(paramsObj);
    const url = `${SCRIPT_URL}?${params}`;
    const res = await fetch(url);
    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('application/json')) return res.json();
    const text = await res.text();
    try { return JSON.parse(text); } catch (e) { return text; }
  }

  async function apiPost(bodyObj) {
    const body = new URLSearchParams(bodyObj);
    const res = await fetch(SCRIPT_URL, { method: 'POST', body });
    const text = await res.text();
    try { return JSON.parse(text); } catch(e) { return text; }
  }

  // ---------- Auth form (login/register) ----------
  function switchMode() {
    isRegistering = !isRegistering;
    const title = qs('#form-title');
    const done = qs('#done');
    const switchLink = qs('#switch-link');
    const emailWrap = qs('#email-wrapper');
    const confirmWrap = qs('#confirm-password-wrapper');
    if (title) title.innerText = isRegistering ? 'Đăng ký' : 'Đăng nhập';
    if (done) done.innerText = isRegistering ? 'Đăng ký' : 'Đăng nhập';
    if (switchLink) switchLink.innerText = isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký';
    if (emailWrap) emailWrap.style.display = isRegistering ? 'block' : 'none';
    if (confirmWrap) confirmWrap.style.display = isRegistering ? 'block' : 'none';
    const msg = qs('#form-message'); if (msg) msg.innerText = '';
    const succ = qs('#form-success'); if (succ) succ.innerText = '';
  }

  async function handleSubmit() {
    const uEl = qs('#username');
    const pEl = qs('#password');
    const emailEl = qs('#email');
    const confirmEl = qs('#confirm-password');
    const msg = qs('#form-message');
    const success = qs('#form-success');
    const btn = qs('#done');
    if (!uEl || !pEl || !btn) return;

    const u = (uEl.value || '').trim().toLowerCase();
    const p = (pEl.value || '').trim();
    const email = (emailEl && emailEl.value) ? emailEl.value.trim() : '';
    const confirm = (confirmEl && confirmEl.value) ? confirmEl.value.trim() : '';
    if (msg) msg.innerText = ''; if (success) success.innerText = '';

    btn.disabled = true; btn.innerText = isRegistering ? 'Đang đăng ký...' : 'Đang đăng nhập...';

    // validate
    if (u.length < 3 || p.length < 3) {
      if (msg) msg.innerText = 'Tài khoản và mật khẩu phải từ 3 ký tự.';
      resetBtn(); return;
    }
    if (!/[a-zA-Z]/.test(u) || !/[a-zA-Z]/.test(p)) {
      if (msg) msg.innerText = 'Tài khoản và mật khẩu phải chứa ít nhất một chữ cái.';
      resetBtn(); return;
    }
    if (isRegistering && p !== confirm) {
      if (msg) msg.innerText = 'Mật khẩu nhập lại không khớp.';
      resetBtn(); return;
    }

    const payload = { action: isRegistering ? 'register' : 'login', username: u, password: p };
    if (isRegistering) payload.email = email;

    try {
      const txt = await apiPost(payload);
      const respText = typeof txt === 'string' ? txt : (txt.message || JSON.stringify(txt));
      if (isRegistering) {
        if (respText.includes('✅')) {
          alert('Đăng ký thành công!');
          if (success) success.innerText = 'Đăng ký thành công! Vui lòng đăng nhập.';
          setTimeout(switchMode, 800);
        } else {
          if (msg) msg.innerText = respText;
        }
      } else {
        if (respText.includes('✅ Đăng nhập thành công') || respText.includes('Đăng nhập thành công')) {
          alert('Đăng nhập thành công!');
          localStorage.setItem('currentUser', u);
          localStorage.setItem('currentPass', p);
          localStorage.setItem('expireTime', Date.now() + 30 * 60 * 1000);
          location.reload();
        } else {
          if (msg) msg.innerText = respText;
        }
      }
    } catch (err) {
      if (msg) msg.innerText = 'Lỗi kết nối!';
      console.error('handleSubmit error', err);
    } finally { resetBtn(); }

    function resetBtn() {
      btn.disabled = false; btn.innerText = isRegistering ? 'Đăng ký' : 'Đăng nhập';
    }
  }

  // ---------- UI for logged-in user ----------
  function renderUI() {
    const u = localStorage.getItem('currentUser');
    if (!u) return;
    const form = qs('#form');
    const switchLink = qs('#switch-link');
    const userPanel = qs('#user-panel');
    const display = qs('#user-display');

    if (form) form.style.display = 'none';
    if (switchLink) switchLink.style.display = 'none';
    if (userPanel) userPanel.style.display = 'block';
    if (display) display.innerText = u;
    const title = qs('#form-title'); if (title) title.textContent = 'Thông tin tài khoản';

    loadBalance(u);
  }

  async function loadBalance(user) {
    const container = qs('#balance-container');
    const historySection = qs('#history-section');

    if (container) { container.classList.add('loading'); container.classList.remove('loaded'); }

    try {
      const info = await apiPost({ action: 'get_user', username: user });
      const balance = (info && info.balance) ? parseInt(info.balance, 10) : 0;
      const historyRaw = (info && info.history) ? info.history : '';

      const balEl = qs('#balance');
      if (balEl) balEl.innerText = formatPrice(balance).replace('đ',' VNĐ');

      historyData = historyRaw.split('\n').filter(Boolean).reverse();
      window.historyData = historyData;
      currentPage = 1;
      renderHistory();

      setTimeout(() => {
        if (container) { container.classList.remove('loading'); container.classList.add('loaded'); }
        if (historySection) historySection.style.display = 'none';
      }, 60);

    } catch (err) {
      console.error('loadBalance error:', err);
      if (container) { container.classList.remove('loading'); container.classList.add('loaded'); }
    }
  }

  function renderHistory() {
    const historyList = qs('#history');
    const pagination = qs('#pagination');
    if (!historyList || !pagination) return;
    historyList.innerHTML = '';

    const totalPages = Math.max(1, Math.ceil(historyData.length / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = historyData.slice(start, start + itemsPerPage);

    pageItems.forEach(line => {
      const li = document.createElement('li');
      li.textContent = line;
      historyList.appendChild(li);
    });

    pagination.innerHTML = '';
    const center = document.createElement('center');

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '<'; prevBtn.disabled = currentPage <= 1;
    prevBtn.addEventListener('click', () => changePage(-1));
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '>'; nextBtn.disabled = currentPage >= totalPages;
    nextBtn.addEventListener('click', () => changePage(1));

    const pageInfo = document.createElement('span');
    pageInfo.style.fontSize = '13px'; pageInfo.style.margin = '5px';
    pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;

    center.appendChild(prevBtn); center.appendChild(pageInfo); center.appendChild(nextBtn);
    pagination.appendChild(center);
  }

  function changePage(step) {
    const totalPages = Math.max(1, Math.ceil(historyData.length / itemsPerPage));
    const nextPage = currentPage + step;
    if (nextPage < 1 || nextPage > totalPages) return;
    currentPage = nextPage; renderHistory();
  }

  // ---------- Purchase UI and history table ----------
  async function addToHistory({ id_acc, server, planet, type, price }) {
    const username = localStorage.getItem('currentUser');
    const password = localStorage.getItem('currentPass');
    if (!username || !password) return;
    const params = {
      action: 'add_history', username, password, id_acc, server, planet, type, price
    };
    try { await apiGet(params); } catch (e) { console.error('addToHistory error', e); }
  }

  async function loadHistoryTable() {
    const username = localStorage.getItem('currentUser');
    const password = localStorage.getItem('currentPass');
    if (!username || !password) return;

    try {
      const data = await apiGet({ action: 'get_history', username, password });
      const tbody = qs('#purchase-table tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!data || !data.success) throw new Error((data && data.message) || 'Không load được lịch sử');

      (data.data || []).forEach(item => {
        const tr = document.createElement('tr');
        const ts = formatTimestamp(item.timestamp);
        tr.innerHTML = `
          <td style='border:1px solid #ccc; padding:8px 10px;'>${item.id_acc}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;'>${item.user}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;'>${item.pass}</td>
          <td style='border:1px solid #ccc; padding:8px 10px;'>${Number(item.price).toLocaleString()}đ</td>
          <td style='border:1px solid #ccc; padding:8px 10px;'>${ts}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Lỗi khi tải lịch sử:', err);
      const tbody = qs('#purchase-table tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan='5' style='color:red;padding:10px;'>&#10060; Không tải được dữ liệu</td></tr>`;
    }
  }

  function toggleBoxDisplay(box) {
    if (!box) return false;
    const curr = box.style.display && box.style.display !== 'none' ? box.style.display : getComputedStyle(box).display;
    const visible = curr !== 'none';
    box.style.display = visible ? 'none' : 'block';
    return !visible;
  }

  function togglePurchase() {
    const box = qs('#purchase-history-box');
    const icon = qs('#purchase-icon');
    const opened = toggleBoxDisplay(box);
    if (icon) {
      if (opened) icon.setAttribute('d', 'M288 384l192 192 192-192H288z');
      else icon.setAttribute('d', 'M480 672l192-192H288z');
    }
    if (opened) loadHistoryTable();
  }

  function toggleHistory() {
    const box = qs('#history-section');
    const icon = qs('#purchase-icon');
    const opened = toggleBoxDisplay(box);
    if (icon && opened) loadHistoryTable();
  }

  // ---------- Purchase confirm button logic ----------
  function setupConfirmBuy() {
    const accNode = qs('._pt a');
    const accId = accNode ? safeText(accNode) : '';
    const infoBox = qs('#acc-info');
    const confirmBtn = qs('#confirm-buy');
    if (!confirmBtn || !infoBox) return;
    if (!accId) { infoBox.innerHTML = `<span style='color:red;'>Không lấy được acc ID</span>`; return; }

    confirmBtn.style.display = 'inline-block';
    confirmBtn.addEventListener('click', async () => {
      const username = localStorage.getItem('currentUser');
      const password = localStorage.getItem('currentPass');
      if (!username || !password) { alert('Bạn chưa đăng nhập!'); return; }

      confirmBtn.disabled = true; confirmBtn.textContent = 'Đang xử lý...';

      const buyParams = new URLSearchParams({ action: 'buy_acc', username, password, id_acc: accId });
      try {
        const res = await fetch(`${SCRIPT_URL}?${buyParams}`);
        const text = await res.text();
        const body = JSON.parse(text || '{}');
        if (!body.success) throw new Error(body.message || 'Mua không thành công');

        infoBox.innerHTML = `<span style='color:green;'>${body.message || 'Mua thành công! Xem thông tin tài khoản mật khẩu tại lịch sử mua nick'}</span>`;

        const serverEl = qs('.sv');
        const planetEl = qs('.ht');
        const typeEl = qs('.dki');
        const priceEl = qs('.card');

        const record = {
          id_acc: accId,
          server: safeText(serverEl),
          planet: safeText(planetEl),
          type: safeText(typeEl),
          price: Number((priceEl && priceEl.textContent || '').replace(/\D/g, '')) || 0
        };

        await addToHistory(record);
        await loadHistoryTable();

        confirmBtn.textContent = 'ĐÃ MUA';

        // thay đổi nút đặt mua nếu có
        const datMuaBtn = qs('#guideSection1 a.btn');
        if (datMuaBtn) {
          datMuaBtn.textContent = 'ĐÃ BÁN';
          datMuaBtn.classList.add('disabled');
          datMuaBtn.style.backgroundColor = '#aaa';
          datMuaBtn.style.pointerEvents = 'none';
          datMuaBtn.style.opacity = '0.7';
          datMuaBtn.setAttribute('aria-disabled', 'true');
        }

      } catch (err) {
        infoBox.innerHTML = `<span style='color:red;'>${err.message}</span>`;
      } finally {
        confirmBtn.disabled = false;
        if (confirmBtn.textContent !== 'ĐÃ MUA') confirmBtn.textContent = 'XÁC NHẬN MUA';
      }
    });
  }

  // ---------- Logout handler ----------
  function logoutHandler() {
    localStorage.removeItem('expireTime');
    localStorage.removeItem('currentPass');
    localStorage.removeItem('currentUser');
    location.reload();
  }

  // ---------- Event delegation (single place) ----------
  document.addEventListener('click', e => {
    const el = e.target;
    const id = el.id;
    if (!id && el.matches && el.closest) {
      // try to find id on parent buttons (e.g., svg path inside button)
      const parentWithId = el.closest('[id]');
      if (parentWithId) {
        // override id
      }
    }

    switch (id) {
      case 'done': e.preventDefault(); handleSubmit(); break;
      case 'switch-link': e.preventDefault(); switchMode(); break;
      case 'depositBtn': e.preventDefault(); updateBalance && updateBalance('+'); break;
      case 'withdrawBtn': e.preventDefault(); updateBalance && updateBalance('-'); break;
      case 'logoutBtn': e.preventDefault(); logoutHandler(); break;
      case 'toggle-history': e.preventDefault(); toggleHistory(); break;
      case 'toggle-purchase': e.preventDefault(); togglePurchase(); break;
      default: break;
    }
  });

  // submit event
  document.addEventListener('submit', e => {
    if (e.target && e.target.id === 'form') {
      e.preventDefault(); handleSubmit();
    }
  });

  // ---------- Init on DOMContentLoaded ----------
  window.addEventListener('DOMContentLoaded', () => {
    // wire up small bits
    const toggleBtn = qs('#toggle-history');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleHistory);

    // wire history/purchase icon if exists
    const purchaseIconBtn = qs('#toggle-purchase');
    if (purchaseIconBtn) purchaseIconBtn.addEventListener('click', togglePurchase);

    // setup confirm buy (if page has buy UI)
    setupConfirmBuy();

    // if user logged in show UI
    renderUI();

    // auto-call loadHistoryTable once to populate table silently (optional)
    // NOTE: only call if user is logged and table exists
    const username = localStorage.getItem('currentUser');
    const table = qs('#purchase-table tbody');
    if (username && table) loadHistoryTable();
  });

  // expose a couple of functions for backward compatibility
  window.togglePurchase = togglePurchase;
  window.loadHistoryTable = loadHistoryTable;
  window.toggleHistory = toggleHistory;
})();
