 const currentUser = localStorage.getItem(&quot;currentUser&quot;) || &quot;guest&quot;;
  const giftKey     = &quot;gift_claimed_&quot; + currentUser;
  const btn         = document.getElementById(&quot;claim-gift-btn&quot;);
  const msgBox      = document.getElementById(&quot;gift-message&quot;);
  const wrapper     = document.getElementById(&quot;gift-container&quot;);

  const SCRIPT_URL = &quot;https://shop.nro2024.workers.dev/&quot;;

  window.addEventListener(&quot;DOMContentLoaded&quot;, () =&gt; {
    if (currentUser === &quot;guest&quot;) {
      btn.style.display   = &quot;inline-block&quot;;
      msgBox.style.display= &quot;none&quot;;
    } else if (localStorage.getItem(giftKey) === &quot;1&quot;) {
      btn.style.display   = &quot;none&quot;;
    } else {
      btn.style.display   = &quot;inline-block&quot;;
    }
  });

  btn.addEventListener(&quot;click&quot;, () =&gt; {
    if (currentUser === &quot;guest&quot;) {
      alert(&quot;Vui lòng đăng nhập để nhận quà!&quot;);
      return;
    }
    if (localStorage.getItem(giftKey) === &quot;1&quot;) return;

    btn.disabled = true; // &#9989; Chặn spam click tại đây

    fetch(SCRIPT_URL, {
      method: &quot;POST&quot;,
      headers: { &quot;Content-Type&quot;: &quot;application/x-www-form-urlencoded&quot; },
      body: new URLSearchParams({
        action:   &quot;claim_gift&quot;,
        username: currentUser
      })
    })
    .then(r =&gt; r.text())
    .then(msg =&gt; {
      localStorage.setItem(giftKey, &quot;1&quot;);
      msgBox.innerText     = msg;
      btn.style.display    = &quot;none&quot;;
      msgBox.style.display = &quot;block&quot;;
      if (typeof loadBalance === &quot;function&quot;) loadBalance();
      setTimeout(() =&gt; wrapper.remove(), 1000);
    })
    .catch(err =&gt; {
      alert(&quot;Lỗi kết nối:\n&quot; + err);
      btn.disabled = false; // 🔁 Cho phép click lại nếu lỗi
    });
  });
