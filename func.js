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
