(function () {
  "use strict";

  var FORM_ENDPOINT = "https://formsubmit.co/ajax/huzaifaamjad111222@gmail.com";

  var grid = document.getElementById("rentalGrid");
  var countEl = document.getElementById("rentalCount");
  var filterType = document.getElementById("filterType");
  var priceRange = document.getElementById("priceRange");
  var transmission = document.getElementById("transmission");
  var fuelType = document.getElementById("fuelType");
  var resetBtn = document.getElementById("resetFilters");

  var form = document.getElementById("bookingForm");
  var successEl = document.getElementById("bookingSuccess");
  var errorEl = document.getElementById("bookingError");
  var submitBtn = document.getElementById("bookingSubmit");

  function getSelectedTypes() {
    if (!filterType) return [];
    var boxes = filterType.querySelectorAll('input[type="checkbox"]:checked');
    return Array.prototype.map.call(boxes, function (b) {
      return b.value;
    });
  }

  function priceMatches(day, rangeVal) {
    if (!rangeVal || rangeVal === "any") return true;
    var parts = rangeVal.split("-");
    var min = parseInt(parts[0], 10);
    var max = parseInt(parts[1], 10);
    return day >= min && day <= max;
  }

  function applyFilters() {
    if (!grid) return;
    var types = getSelectedTypes();
    var pr = priceRange ? priceRange.value : "any";
    var tr = transmission ? transmission.value : "any";
    var fu = fuelType ? fuelType.value : "any";

    var cards = grid.querySelectorAll(".rental-card");
    var visible = 0;

    cards.forEach(function (card) {
      var type = card.getAttribute("data-type");
      var day = parseInt(card.getAttribute("data-day"), 10);
      var trans = card.getAttribute("data-trans");
      var fuel = card.getAttribute("data-fuel");

      var okType = types.length === 0 || types.indexOf(type) !== -1;
      var okPrice = priceMatches(day, pr);
      var okTrans = tr === "any" || trans === tr;
      var okFuel = fu === "any" || fuel === fu;

      var show = okType && okPrice && okTrans && okFuel;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    if (countEl) {
      countEl.innerHTML = "<strong>" + visible + "</strong> vehicles match";
    }
  }

  if (filterType) {
    filterType.addEventListener("change", applyFilters);
  }
  [priceRange, transmission, fuelType].forEach(function (el) {
    if (el) el.addEventListener("change", applyFilters);
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (filterType) {
        filterType.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
          cb.checked = true;
        });
      }
      if (priceRange) priceRange.value = "any";
      if (transmission) transmission.value = "any";
      if (fuelType) fuelType.value = "any";
      applyFilters();
    });
  }

  applyFilters();

  function clearFieldErrors() {
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

  function validateBooking() {
    clearFieldErrors();
    var ok = true;

    var name = document.getElementById("bkName");
    var phone = document.getElementById("bkPhone");
    var email = document.getElementById("bkEmail");
    var car = document.getElementById("bkCar");
    var duration = document.getElementById("bkDuration");
    var pickup = document.getElementById("bkPickup");
    var ret = document.getElementById("bkReturn");

    function mark(field, condition) {
      if (!field) return;
      var wrap = field.closest(".form-field");
      if (!condition) {
        ok = false;
        if (wrap) wrap.classList.add("error");
      }
    }

    mark(name, name && name.value.trim().length >= 2);

    var phoneVal = phone ? phone.value.replace(/\s+/g, "") : "";
    mark(phone, /^\+?\d{10,15}$/.test(phoneVal));

    mark(email, email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));

    mark(car, car && car.value.length > 0);
    mark(duration, duration && duration.value.length > 0);

    var pDate = pickup && pickup.value ? new Date(pickup.value) : null;
    var rDate = ret && ret.value ? new Date(ret.value) : null;
    mark(pickup, !!pDate && !isNaN(pDate.getTime()));
    mark(ret, !!rDate && !isNaN(rDate.getTime()) && (!pDate || rDate > pDate));

    return ok;
  }

  var pickupInput = document.getElementById("bkPickup");
  var returnInput = document.getElementById("bkReturn");
  var today = new Date().toISOString().split("T")[0];
  if (pickupInput) {
    pickupInput.min = today;
    pickupInput.addEventListener("change", function () {
      if (returnInput && pickupInput.value) {
        var next = new Date(pickupInput.value);
        next.setDate(next.getDate() + 1);
        returnInput.min = next.toISOString().split("T")[0];
      }
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideStatuses();

      if (!validateBooking()) {
        showStatus(errorEl, "Please fix the highlighted fields.", true);
        return;
      }

      var fd = new FormData(form);
      var payload = {};
      fd.forEach(function (v, k) {
        payload[k] = v;
      });

      payload._replyto = payload.email;

      payload.message =
        "GraceWheels rental booking\n\n" +
        "Name: " +
        payload.name +
        "\n" +
        "Phone: " +
        payload.phone +
        "\n" +
        "Email: " +
        payload.email +
        "\n" +
        "Car: " +
        payload.car +
        "\n" +
        "Duration: " +
        payload.duration_type +
        "\n" +
        "Pickup: " +
        payload.pickup_date +
        "\n" +
        "Return: " +
        payload.return_date;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
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
          if (!res.ok) throw new Error("Network error");
          return res.json();
        })
        .then(function () {
          showStatus(
            successEl,
            "Booking received. Our team will confirm availability and contact you shortly.",
            false
          );
          form.reset();
          clearFieldErrors();
          if (pickupInput) pickupInput.min = today;
        })
        .catch(function () {
          showStatus(
            errorEl,
            "Could not send right now. Please email huzaifaamjad111222@gmail.com directly or try again.",
            true
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit booking';
          }
        });
    });
  }
})();
