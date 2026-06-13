
/* ================= TABS ================= */
(function () {
  const tabs = { home: "panel-home", rsvp: "panel-rsvp" };
  const hashFor = { home: "#inicio", rsvp: "#rsvp" };

  function showTab(name, push) {
    if (!tabs[name]) name = "home";
    Object.entries(tabs).forEach(function ([key, id]) {
      document.getElementById(id).classList.toggle("active", key === name);
    });
    document.body.classList.toggle("rsvp-active", name === "rsvp");
    document.querySelectorAll("[data-tab]").forEach(function (a) {
      if (a.closest(".tab-nav")) a.classList.toggle("active", a.getAttribute("data-tab") === name);
    });
    if (push !== false) history.replaceState(null, "", hashFor[name]);
    if (name === "rsvp") window.dispatchEvent(new Event("rsvp:show"));
    window.dispatchEvent(new Event("resize"));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function fromHash() {
    const h = location.hash;
    if (h === "#rsvp") return "rsvp";
    return "home";
  }

  document.addEventListener("click", function (e) {
    const a = e.target.closest("[data-tab]");
    if (!a) return;
    e.preventDefault();
    showTab(a.getAttribute("data-tab"));
  });

  window.addEventListener("hashchange", function () { showTab(fromHash(), false); });
  showTab(fromHash(), false);
})();


/* ================= COUNTDOWN + CALENDAR ================= */
(function () {
  const weddingDate = new Date("2026-10-03T12:30:00+02:00");

  function updateCountdown() {
    const el = document.getElementById("countdown");
    if (!el) return;
    const now = new Date();
    const ms = weddingDate - now;
    const days = Math.ceil(ms / 86400000);
    if (days > 0) {
      el.textContent = (t("countdown.days") || "Faltan {days} días").replace("{days}", days);
    } else if (days === 0) {
      el.textContent = t("countdown.today") || "¡Hoy es el gran día!";
    } else {
      el.textContent = t("countdown.past") || "¡Ya estamos casados!";
    }
  }

  function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function escapeICS(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  function createCalendarFile() {
    const filename = t("calendar.filename") || "boda-mapi-daan.ics";
    const now = formatICSDate(new Date());
    const events = [
      {
        uid: "preboda-mapi-daan-2026@mapi-daan-2026.com",
        summary: t("calendar.preboda.title") || "Preboda de Mapi y Daan",
        start: new Date("2026-10-02T20:00:00+02:00"),
        end: new Date("2026-10-02T23:30:00+02:00"),
        location: "Bar Gorría, Villafranca, Navarra",
        description: "Comienzo en Bar Gorría. Sed puntuales, habrá sorpresas."
      },
      {
        uid: "boda-mapi-daan-2026@mapi-daan-2026.com",
        summary: t("calendar.title") || "Boda de Mapi y Daan",
        start: new Date("2026-10-03T12:30:00+02:00"),
        end: new Date("2026-10-04T02:00:00+02:00"),
        location: "Villafranca / Castejón, Navarra",
        description: "Ceremonia en Terraza Padres Carmelitas. Cóctel, comida y baile en Hotel Luze El Villa. Recena y fiesta en Casino Gayarre."
      }
    ];

    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mapi & Daan//Wedding 2026//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    events.forEach(function (ev) {
      lines.push("BEGIN:VEVENT", "UID:" + ev.uid, "DTSTAMP:" + now, "DTSTART:" + formatICSDate(ev.start), "DTEND:" + formatICSDate(ev.end), "SUMMARY:" + escapeICS(ev.summary), "LOCATION:" + escapeICS(ev.location), "DESCRIPTION:" + escapeICS(ev.description), "END:VEVENT");
    });
    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("calendar-btn");
    if (btn) btn.addEventListener("click", createCalendarFile);
    updateCountdown();
  });
  window.addEventListener("languagechange", updateCountdown);
})();

/* ================= RSVP → Google Sheet =================
   Sends one group row + one per-guest details array.
   Apps Script should use the companion apps-script/Code.gs file. */
const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxRntO0ylCtCm0Bz96d81fb57_0R50AmS2L2WFOdRxxVj5htRx5zzIx5d-1H7wbmIA0Ng/exec";

(function () {
  const form = document.getElementById("rsvp-form");
  const contactNameInput = document.getElementById("contactName");
  const guestNameFieldsEl = document.getElementById("guest-name-fields");
  const guestCountSelect = document.getElementById("personas");
  const guestDetailsEl = document.getElementById("guest-details");

  function getGuestNameInputs() {
    return Array.from(guestNameFieldsEl ? guestNameFieldsEl.querySelectorAll(".guest-name-input") : []);
  }

  function getAllGuestNames() {
    return getGuestNameInputs()
      .map(function (input) { return (input.value || "").trim(); })
      .filter(Boolean);
  }

  function renderGuestNameFields() {
    if (!guestNameFieldsEl) return;
    const count = Number(guestCountSelect.value || 0);
    if (!count || isAttendanceNo()) {
      guestNameFieldsEl.innerHTML = "";
      renderGuestDetails();
      return;
    }

    const previous = getGuestNameInputs().map(function (input) { return input.value || ""; });
    const contactName = (contactNameInput && contactNameInput.value || "").trim();

    guestNameFieldsEl.innerHTML = Array.from({ length: count }, function (_, i) {
      const current = previous[i] || (i === 0 ? contactName : "");
      const label = `${t("rsvp.guest")} ${i + 1}`;
      return `
        <label class="guest-name-card">
          <span>${label}</span>
          <input type="text" class="guest-name-input" name="guestName${i}" value="${current.replace(/"/g, "&quot;")}" placeholder="${t("rsvp.guestName.placeholder") || t("rsvp.q3.placeholder")}">
        </label>`;
    }).join("");

    getGuestNameInputs().forEach(function (input) {
      input.addEventListener("input", renderGuestDetails);
    });

    renderGuestDetails();
  }

  function menuOptionsHtml(selected) {
    const options = [
      ["Ninguno", t("rsvp.menu.none")],
      ["Vegetariano", t("rsvp.menu.vegetarian")],
      ["Vegano", t("rsvp.menu.vegan")],
      ["Sin gluten", t("rsvp.menu.glutenFree")],
      ["Otro", t("rsvp.menu.other")]
    ];
    const selectedNormalized = selected || "Ninguno";
    return options.map(function (opt) {
      return `<option value="${opt[0]}"${selectedNormalized === opt[0] ? " selected" : ""}>${opt[1]}</option>`;
    }).join("");
  }

  function langToSpanish(lang) {
    if (lang === "en") return "Inglés";
    if (lang === "nl") return "Neerlandés";
    return "Español";
  }


  function updatePluralLabels() {
    const count = Number(guestCountSelect.value || 0);
    const singular = count === 1;
    const q4 = document.querySelector('[data-i18n="rsvp.q4"], [data-i18n="rsvp.q4.singular"]');
    const q5 = document.querySelector('[data-i18n="rsvp.q5"], [data-i18n="rsvp.q5.singular"]');
    const q8 = document.querySelector('[data-i18n="rsvp.q8"], [data-i18n="rsvp.q8.singular"]');
    if (q4) { q4.setAttribute('data-i18n', singular ? 'rsvp.q4.singular' : 'rsvp.q4'); q4.textContent = t(singular ? 'rsvp.q4.singular' : 'rsvp.q4'); }
    if (q5) { q5.setAttribute('data-i18n', singular ? 'rsvp.q5.singular' : 'rsvp.q5'); q5.textContent = t(singular ? 'rsvp.q5.singular' : 'rsvp.q5'); }
    if (q8) { q8.setAttribute('data-i18n', singular ? 'rsvp.q8.singular' : 'rsvp.q8'); q8.textContent = t(singular ? 'rsvp.q8.singular' : 'rsvp.q8'); }
  }

  function renderGuestDetails() {
    if (!guestDetailsEl) return;
    const existing = {};
    guestDetailsEl.querySelectorAll(".guest-detail-card").forEach(function (card) {
      const name = card.getAttribute("data-name") || "";
      existing[name] = {
        menu: (card.querySelector(".guest-menu") || {}).value || "",
        allergies: (card.querySelector(".guest-allergies") || {}).value || ""
      };
    });

    const finalNames = getAllGuestNames();

    if (!finalNames.length) {
      guestDetailsEl.innerHTML = `<p class="guest-details-empty">${t("rsvp.q6.empty")}</p>`;
      return;
    }

    guestDetailsEl.innerHTML = finalNames.map(function (name, index) {
      const safe = name.replace(/"/g, "&quot;");
      const old = existing[name] || {};
      return `
        <section class="guest-detail-card" data-name="${safe}">
          <h3>${name}</h3>
          <div class="guest-detail-grid">
            <label>
              <span>${t("rsvp.menu.label")}</span>
              <select class="guest-menu" name="guestMenu${index}">${menuOptionsHtml(old.menu || "")}</select>
            </label>
            <label>
              <span>${t("rsvp.allergies.label")}</span>
              <input type="text" class="guest-allergies" name="guestAllergies${index}" placeholder="${t("rsvp.allergies.placeholder")}" value="${(old.allergies || "").replace(/"/g, "&quot;")}">
            </label>
          </div>
        </section>`;
    }).join("");
  }

  function isAttendanceNo() {
    const checked = form.querySelector('input[name="asistencia"]:checked');
    return !!(checked && checked.value === "no");
  }

  function updateGuestNamesVisibility() {
    const row = document.getElementById("guest-names-row");
    if (!row) return;
    const count = Number(guestCountSelect.value || 0);
    row.hidden = isAttendanceNo() || count === 0;
    if (!row.hidden) renderGuestNameFields();
    else if (guestNameFieldsEl) guestNameFieldsEl.innerHTML = "";
  }

  window.renderGuestDetails = renderGuestDetails;
  if (contactNameInput) contactNameInput.addEventListener("input", function () { renderGuestNameFields(); });
  guestCountSelect.addEventListener("change", function () { updateGuestNamesVisibility(); updatePluralLabels(); renderGuestNameFields(); });
  window.addEventListener("languagechange", function () { updatePluralLabels(); renderGuestDetails(); });
  updateGuestNamesVisibility();
  updatePluralLabels();
  renderGuestDetails();
  updateAttendanceFlow();

  document.querySelectorAll(".copy-code").forEach(function (button) {
    button.addEventListener("click", async function () {
      const code = button.getAttribute("data-copy") || "MARIAPILAR&DAAN26";
      try {
        await navigator.clipboard.writeText(code);
      } catch (err) {
        const temp = document.createElement("textarea");
        temp.value = code;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      button.dataset.feedback = t("stay.luze.copied.long") || t("stay.luze.copied") || "Código copiado ✓";
      button.classList.add("is-copied");
      button.setAttribute("aria-label", button.dataset.feedback);
      setTimeout(function () {
        button.classList.remove("is-copied");
        button.setAttribute("aria-label", t("stay.luze.copy"));
      }, 2000);
    });
  });

  function resetRsvpFormView(clearFields) {
    const panel = document.getElementById("success-panel");
    if (clearFields) {
      form.reset();
      updateGuestNamesVisibility();
      renderGuestDetails();
    }
    updateAttendanceFlow();
    document.getElementById("panel-rsvp")?.classList.remove("rsvp-submitted");
    const heading = document.querySelector("#panel-rsvp .rsvp-heading");
    if (heading) heading.style.display = "block";
    form.style.display = "block";
    if (panel) panel.style.display = "none";
    const status = document.getElementById("form-status");
    if (status) { status.className = "form-status"; status.textContent = ""; }
    const btnLabel = document.querySelector("#submit-btn span");
    if (btnLabel) btnLabel.textContent = t("rsvp.submit");
  }

  function updateAttendanceFlow() {
    const checked = form.querySelector('input[name="asistencia"]:checked');
    const isYes = !!(checked && checked.value === "si");
    const isNo = !!(checked && checked.value === "no");

    document.querySelectorAll(".attendance-yes-only").forEach(function (row) {
      row.hidden = !isYes;
    });

    if (!isYes) {
      guestCountSelect.value = "";
      updatePluralLabels();
      if (guestNameFieldsEl) guestNameFieldsEl.innerHTML = "";
      if (form.cancion) form.cancion.value = "";
      form.querySelectorAll('input[name="autobus"], input[name="preboda"]').forEach(function (input) { input.checked = false; });
      if (guestDetailsEl) guestDetailsEl.innerHTML = "";
    } else {
      updateGuestNamesVisibility();
      updatePluralLabels();
      renderGuestNameFields();
    }
  }

  form.querySelectorAll('input[name="asistencia"]').forEach(function (input) {
    input.addEventListener("change", updateAttendanceFlow);
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".reset-rsvp")) {
      e.preventDefault();
      resetRsvpFormView(true);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  window.addEventListener("rsvp:show", function () {
    resetRsvpFormView(true);
  });

  function clearValidationState() {
    form.querySelectorAll(".field-invalid").forEach(function (el) { el.classList.remove("field-invalid"); });
    form.querySelectorAll(".field-invalid-group").forEach(function (el) { el.classList.remove("field-invalid-group"); });
  }

  function markInvalid(el) {
    if (!el) return;
    el.classList.add("field-invalid");
  }

  function markRadioInvalid(name) {
    const first = form.querySelector('input[name="' + name + '"]');
    if (!first) return;
    const group = first.closest(".radio-group") || first.closest(".form-row");
    if (group) group.classList.add("field-invalid-group");
  }

  function firstInvalidElement() {
    return form.querySelector(".field-invalid, .field-invalid-group");
  }

  function validateRsvpBeforeSubmit() {
    clearValidationState();

    const missing = [];
    const contactName = form.contactName;
    const phone = form.phone;
    const attendance = form.querySelector('input[name="asistencia"]:checked');

    if (!contactName || !contactName.value.trim()) {
      missing.push("contactName");
      markInvalid(contactName);
    }
    if (!phone || !phone.value.trim()) {
      missing.push("phone");
      markInvalid(phone);
    }
    if (!attendance) {
      missing.push("attendance");
      markRadioInvalid("asistencia");
    }

    const isAttending = attendance && attendance.value === "si";
    if (isAttending) {
      const guestCount = Number(guestCountSelect.value || 0);
      if (!guestCount) {
        missing.push("guestCount");
        markInvalid(guestCountSelect);
      }

      updateGuestNamesVisibility();
      renderGuestNameFields();

      const guestInputs = getGuestNameInputs();
      if (guestCount && guestInputs.length < guestCount) {
        missing.push("guestNames");
      }
      guestInputs.forEach(function (input) {
        if (!input.value.trim()) {
          missing.push("guestName");
          markInvalid(input);
        }
      });

      if (!form.querySelector('input[name="autobus"]:checked')) {
        missing.push("bus");
        markRadioInvalid("autobus");
      }
      if (!form.querySelector('input[name="preboda"]:checked')) {
        missing.push("prewedding");
        markRadioInvalid("preboda");
      }

      // Menu selection is explicit per guest. Allergies/intolerances remain optional.
      guestDetailsEl.querySelectorAll(".guest-menu").forEach(function (select) {
        if (!select.value) {
          missing.push("menu");
          markInvalid(select);
        }
      });
    }

    if (missing.length) {
      const status = document.getElementById("form-status");
      if (status) {
        status.className = "form-status error";
        status.textContent = t("rsvp.required") || "Por favor, completa todos los campos obligatorios.";
      }
      const target = firstInvalidElement();
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof target.focus === "function") {
          setTimeout(function () { try { target.focus({ preventScroll: true }); } catch (e) {} }, 250);
        }
      }
      return false;
    }
    return true;
  }

  form.addEventListener("input", function (e) {
    if (e.target && e.target.classList) e.target.classList.remove("field-invalid");
  });

  form.addEventListener("change", function (e) {
    if (e.target && e.target.classList) e.target.classList.remove("field-invalid");
    const row = e.target && e.target.closest ? e.target.closest(".radio-group") : null;
    if (row) row.classList.remove("field-invalid-group");
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const status = document.getElementById("form-status");
    const btnLabel = document.querySelector("#submit-btn span");

    if (!validateRsvpBeforeSubmit()) return;

    const attendance = form.querySelector('input[name="asistencia"]:checked');
    const isAttending = attendance.value === "si";
    let guestNames = [];
    let guestDetails = [];
    if (isAttending) {
      updateGuestNamesVisibility();
      guestNames = getAllGuestNames();
      guestDetails = Array.from(guestDetailsEl.querySelectorAll(".guest-detail-card")).map(function (card) {
        return {
          name: card.getAttribute("data-name") || "",
          menu: (card.querySelector(".guest-menu") || {}).value || "",
          allergies: (card.querySelector(".guest-allergies") || {}).value.trim() || ""
        };
      }).filter(function (g) { return g.name || g.menu || g.allergies; });
    } else {
      updateAttendanceFlow();
    }
    const data = {
      language: langToSpanish(window.currentLang || document.documentElement.lang || "es"),
      attendance: attendance.value,
      contactName: form.contactName ? form.contactName.value.trim() : "",
      phone: form.phone ? form.phone.value.trim() : "",
      guestCount: isAttending ? (form.personas.value || "") : "",
      guestNames: isAttending ? guestNames : [],
      prewedding: isAttending ? ((form.querySelector('input[name="preboda"]:checked') || {}).value || "") : "",
      bus: isAttending ? ((form.querySelector('input[name="autobus"]:checked') || {}).value || "") : "",
      guestDetails: isAttending ? guestDetails : [],
      song: isAttending ? form.cancion.value.trim() : "",
      notes: "",
      message: form.mensaje.value.trim(),
      source: "mapi-daan-2026.com"
    };

    status.className = "form-status";
    status.textContent = t("rsvp.sending");
    btnLabel.textContent = t("rsvp.sending");

    try {
      await fetch(SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      form.style.display = "none";
      document.getElementById("panel-rsvp")?.classList.add("rsvp-submitted");
      const heading = document.querySelector("#panel-rsvp .rsvp-heading");
      if (heading) heading.style.display = "none";
      status.textContent = "";
      const panel = document.getElementById("success-panel");
      const successMessage = document.getElementById("success-message");
      if (successMessage) {
        const key = attendance.value === "no" ? "rsvp.success.no.text" : "rsvp.success.text";
        successMessage.textContent = t(key);
        successMessage.setAttribute("data-i18n", key);
      }
      panel.style.display = "block";
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      status.className = "form-status error";
      status.textContent = t("rsvp.error");
      btnLabel.textContent = t("rsvp.submit");
    }
  });
})();

