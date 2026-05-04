(function () {
  "use strict";

  var loader = document.getElementById("pageLoader");
  var header = document.getElementById("siteHeader");
  var scrollBtn = document.getElementById("scrollTop");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  var yearEl = document.getElementById("year");

  function hideLoader() {
    if (!loader) return;
    loader.classList.add("done");
  }

  window.addEventListener("load", function () {
    setTimeout(hideLoader, 450);
  });

  if (document.readyState === "complete") {
    setTimeout(hideLoader, 450);
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) {
      header.classList.toggle("scrolled", y > 24);
    }
    if (scrollBtn) {
      scrollBtn.classList.toggle("visible", y > 500);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (scrollBtn) {
    scrollBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });
})();
