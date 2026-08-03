/* 共通スクリプト: モバイルナビ開閉など */
(function () {
  "use strict";

  // モバイルナビ
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".global-nav");
  function closeAllSubmenus() {
    document.querySelectorAll(".nav-has-sub.is-open").forEach(function (li) {
      li.classList.remove("is-open");
      var b = li.querySelector(".nav-sub-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "閉じる ×" : "メニュー ☰";
      if (!open) closeAllSubmenus();
    });
  }

  // ヘッダーのドロップダウン（比較カテゴリ／運営情報）
  document.querySelectorAll(".nav-sub-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = btn.closest(".nav-has-sub");
      if (!li) return;
      var willOpen = !li.classList.contains("is-open");
      closeAllSubmenus();
      if (willOpen) {
        li.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".nav-has-sub.is-open").forEach(function (li) {
      if (!li.contains(e.target)) {
        li.classList.remove("is-open");
        var b = li.querySelector(".nav-sub-toggle");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllSubmenus();
  });

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
