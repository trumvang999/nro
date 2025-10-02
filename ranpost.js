  var rdp_numposts = 4;
  var rdp_snippet_length = 150;
  var rdp_current = new Array(rdp_numposts);
  var rdp_total_posts = 0;

  function totalposts(a) {
    rdp_total_posts = a.feed.openSearch$totalResults.$t;
  }

  document.write('<script src="/feeds/posts/summary?alt=json-in-script&max-results=0&callback=totalposts"><\/script>');

  function getvalue() {
    for (var b = 0; b < rdp_numposts; b++) {
      if (rdp_total_posts >= rdp_numposts) {
        var duplicate = false;
        var c = get_random();
        for (var a = 0; a < rdp_current.length; a++) {
          if (rdp_current[a] == c) {
            duplicate = true;
            break;
          }
        }
        if (duplicate) {
          b--;
        } else {
          rdp_current[b] = c;
        }
      }
    }
  }

  function get_random() {
    return 1 + Math.round(Math.random() * (rdp_total_posts - 1));
  }

  function random_posts(t) {
    if (!t.feed.entry) return;

    for (var e = 0; e < t.feed.entry.length; e++) {
      var s = t.feed.entry[e];
      var link = "";
      for (var d = 0; d < s.link.length; d++) {
        if (s.link[d].rel === "alternate") {
          link = s.link[d].href;
          break;
        }
      }

      var title = s.title.$t;
      var summary = s.summary ? s.summary.$t : "";
      var thumbnail = s.media$thumbnail ? s.media$thumbnail.url.replace("s72-c", "s1600") :
                      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh201pqXb1qZBExmLr8xjFSrNaN4lIsiZquvMvk8qczLXagpJPk-H8HTN_xmgoZev8aSHF-gF1qutqMYJp1AUYk_bi5sGoYciOttS0kOy-v5yn6QhoaXqO0WkAsuud9p5vGWNG9dtLqpkUZ/s1600/safe_image.png";

      var planet = "", server = "", price = "";

      var cleanedSummary = summary.replace(/&nbsp;|\u00a0/g, " ");

      // Server
      if (cleanedSummary.indexOf("Server:") !== -1) {
        server = cleanedSummary.split("Server:")[1].split("\n")[0].trim();
      }

      // Planet
      if (cleanedSummary.indexOf("Hành tinh:") !== -1) {
        planet = cleanedSummary.split("Hành tinh:")[1].split("\n")[0].trim();
      }

      var planetColor = "#000";
      switch (planet.trim().toLowerCase()) {
        case "xayda": planetColor = "orange"; break;
        case "namec": planetColor = "forestgreen"; break;
        case "trái đất":
        case "trai dat": planetColor = "dodgerblue"; break;
      }

      // Price
      if (cleanedSummary.indexOf("Giá tiền:") !== -1) {
        var rawPrice = cleanedSummary.split("Giá tiền:")[1].split("\n")[0].trim();
        var num = parseInt(rawPrice.replace(/[^\d]/g, ""), 10) || 0;
        if (num >= 1000000) price = (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + "M";
        else if (num >= 1000) price = (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
        else price = num + "đ";
      }

      $(".random-posts").append(`
        <li class="post">
          <div class="post-thumb">
            <a href="${link}" title="${title}">
              <img alt="${title}" src="${thumbnail}" />
            </a>
          </div>
          <div class="maso">
            <a href="${link}" title="${title}">${title}</a>
          </div>
          <div class="hienthi">
            <div class="inf">
              <div class="post-planet">
                <span class="icon_phone1" style="font-weight:500;">
                  <i class="fas fa-globe"></i> <b style="color: ${planetColor};">${planet}</b>
                </span>
              </div>
              <div class="post-server">
                <span class="icon_phone1" style="font-weight:500;">
                  <i class="fas fa-server"></i> <b style="color:#d00000;">${server}</b>
                </span>
              </div>
            </div>
            <div id="price">
              <div class="post-price">${price}</div>
            </div>
            <a class="btn btn-primary mua-btn" href="${link}" role="button" type="button">
              <i class="fa fa-shopping-cart"></i>
              <div class="mua">MUA</div>
            </a>
          </div>
        </li>
      `);
    }
  }

  getvalue();
  for (var i = 0; i < rdp_numposts; i++) {
    document.write('<script src="https://www.nro2024.pro/feeds/posts/summary?alt=json-in-script&start-index=' 
                   + rdp_current[i] + '&max-results=1&callback=random_posts"><\/script>');
  }
