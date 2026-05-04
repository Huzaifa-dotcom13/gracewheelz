(function () {
  "use strict";

  var FORM_ENDPOINT = "https://formsubmit.co/ajax/huzaifaamjad111222@gmail.com";

  var grid = document.getElementById("sellGrid");
  var countEl = document.getElementById("sellCount");
  var sellPrice = document.getElementById("sellPrice");
  var sellBrand = document.getElementById("sellBrand");
  var sellYear = document.getElementById("sellYear");
  var sellCondition = document.getElementById("sellCondition");
  var resetBtn = document.getElementById("resetSellFilters");

  var form = document.getElementById("inquiryForm");
  var successEl = document.getElementById("inquirySuccess");
  var errorEl = document.getElementById("inquiryError");

  function priceMatches(price, rangeVal) {
    if (!rangeVal || rangeVal === "any") return true;
    var parts = rangeVal.split("-");
    var min = parseInt(parts[0], 10);
    var max = parseInt(parts[1], 10);
    return price >= min && price <= max;
  }

  function yearMatches(cardYear, filterYear) {
    if (!filterYear || filterYear === "any") return true;
    if (filterYear === "older") return cardYear <= 2019;
    return String(cardYear) === filterYear;
  }

  function applySellFilters() {
    if (!grid) return;
    var pr = sellPrice ? sellPrice.value : "any";
    var br = sellBrand ? sellBrand.value : "any";
    var yr = sellYear ? sellYear.value : "any";
    var cond = sellCondition ? sellCondition.value : "any";

    var cards = grid.querySelectorAll(".listing-card");
    var visible = 0;

    cards.forEach(function (card) {
      var price = parseInt(card.getAttribute("data-price"), 10);
      var brand = card.getAttribute("data-brand");
      var year = parseInt(card.getAttribute("data-year"), 10);
      var condition = card.getAttribute("data-condition");

      var okPrice = priceMatches(price, pr);
      var okBrand = br === "any" || brand === br;
      var okYear = yearMatches(year, yr);
      var okCond = cond === "any" || condition === cond;

      var show = okPrice && okBrand && okYear && okCond;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    if (countEl) {
      countEl.innerHTML = "<strong>" + visible + "</strong> listings match";
    }
  }

  [sellPrice, sellBrand, sellYear, sellCondition].forEach(function (el) {
    if (el) el.addEventListener("change", applySellFilters);
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (sellPrice) sellPrice.value = "any";
      if (sellBrand) sellBrand.value = "any";
      if (sellYear) sellYear.value = "any";
      if (sellCondition) sellCondition.value = "any";
      applySellFilters();
    });
  }

  applySellFilters();

  function clearErrors() {
    if (!form) return;
    form.querySelectorAll(".form-field").forEach(function (f) {
      f.classList.remove("error");
    });
  }

  function showStatus(el, msg, isError) {
    if (!el) return;
    el.hidden = false;
    el.innerHTML =
      '<i class="fa-solid ' +
      (isError ? "fa-circle-exclamation" : "fa-circle-check") +
      '"></i><span>' +
      msg +
      "</span>";
  }

  function hideStatuses() {
    [successEl, errorEl].forEach(function (el) {
      if (!el) return;
      el.hidden = true;
      el.innerHTML = "";
    });
  }

  function validateInquiry() {
    clearErrors();
    var ok = true;

    var name = document.getElementById("inName");
    var email = document.getElementById("inEmail");
    var phone = document.getElementById("inPhone");
    var msg = document.getElementById("inMsg");

    function mark(field, condition) {
      if (!field) return;
      var wrap = field.closest(".form-field");
      if (!condition) {
        ok = false;
        if (wrap) wrap.classList.add("error");
      }
    }

    mark(name, name && name.value.trim().length >= 2);
    mark(email, email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
    var phoneVal = phone ? phone.value.replace(/\s+/g, "") : "";
    mark(phone, /^\+?\d{10,15}$/.test(phoneVal));
    mark(msg, msg && msg.value.trim().length >= 10);

    return ok;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideStatuses();

      if (!validateInquiry()) {
        showStatus(errorEl, "Please complete the form correctly.", true);
        return;
      }

      var fd = new FormData(form);
      var payload = {};
      fd.forEach(function (v, k) {
        payload[k] = v;
      });

      payload._replyto = payload.email;

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
      }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("fail");
          return res.json();
        })
        .then(function () {
          showStatus(successEl, "Inquiry sent. Our sales desk will reply soon.", false);
          form.reset();
          clearErrors();
        })
        .catch(function () {
          showStatus(errorEl, "Send failed. Email huzaifaamjad111222@gmail.com or try again.", true);
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send inquiry';
          }
        });
    });
  }
})();
