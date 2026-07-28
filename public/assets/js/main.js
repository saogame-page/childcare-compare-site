/* 共通スクリプト: モバイルナビ開閉など */
(function () {
  "use strict";

  // モバイルナビ
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".global-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "閉じる ×" : "メニュー ☰";
    });
  }

  // 現在ページのナビをハイライト
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".global-nav a").forEach(function (a) {
    var target = a.getAttribute("href");
    if (target === here) a.setAttribute("aria-current", "page");
  });

  // フッターの年号
  var y = document.getElementById("copyright-year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
