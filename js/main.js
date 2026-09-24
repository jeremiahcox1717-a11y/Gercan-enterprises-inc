(function () {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  const filters = document.querySelectorAll("[data-filter]");
  const figures = document.querySelectorAll("[data-gallery] figure");
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.getAttribute("data-filter");
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      figures.forEach((figure) => {
        const show = kind === "all" || figure.getAttribute("data-kind") === kind;
        figure.classList.toggle("is-hidden", !show);
      });
    });
  });

  const form = document.getElementById("quote-form");
  const success = document.querySelector("[data-success]");
  const brief = document.querySelector("[data-brief]");
  const copyNote = document.querySelector("[data-copy-note]");

  const rules = {
    name: (value) => (value.trim().length < 2 ? "Enter your name." : ""),
    email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Enter a valid email."),
    phone: (value) => {
      const digits = value.replace(/\D/g, "");
      if (!value.trim()) return "";
      return digits.length < 10 ? "Use a 10-digit phone number, or leave it blank." : "";
    },
    region: (value) => (value ? "" : "Choose a region."),
    city: (value) => (value.trim().length < 2 ? "Enter the city or neighbourhood." : ""),
    message: (value) => (value.trim().length < 20 ? "Add at least a sentence about the site." : ""),
  };

  function setError(name, message) {
    const slot = form.querySelector(`[data-error-for="${name}"]`);
    const field = slot.closest(".field");
    slot.textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
  }

  function selectedScope() {
    return [...form.querySelectorAll('input[name="scope"]:checked')].map((box) => box.value);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    let firstInvalid = null;
    Object.entries(rules).forEach(([name, rule]) => {
      const message = rule(String(data.get(name) || ""));
      setError(name, message);
      if (message && !firstInvalid) firstInvalid = form.elements[name];
    });
    const scope = selectedScope();
    const scopeMessage = scope.length ? "" : "Choose at least one scope.";
    setError("scope", scopeMessage);
    if (scopeMessage && !firstInvalid) firstInvalid = form.querySelector('input[name="scope"]');
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const phone = String(data.get("phone") || "").trim();
    const lines = [
      "GERCAN Enterprises Inc. — project brief",
      `Name: ${String(data.get("name")).trim()}`,
      `Email: ${String(data.get("email")).trim()}`,
      `Phone: ${phone || "not given"}`,
      `Region: ${data.get("region")}`,
      `Place: ${String(data.get("city")).trim()}`,
      `Scope: ${scope.join(", ")}`,
      "",
      String(data.get("message")).trim(),
    ];
    brief.textContent = lines.join("\n");
    copyNote.textContent = "";
    form.hidden = true;
    success.hidden = false;
  });

  document.querySelector("[data-copy]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(brief.textContent);
      copyNote.textContent = "Copied. Paste it into an Instagram message to @gconstructioninc.";
    } catch (error) {
      copyNote.textContent = "Select the brief and copy it, then paste it into Instagram.";
    }
  });

  document.querySelector("[data-reset]").addEventListener("click", () => {
    form.reset();
    form.querySelectorAll(".error").forEach((slot) => {
      slot.textContent = "";
    });
    form.querySelectorAll(".is-invalid").forEach((field) => field.classList.remove("is-invalid"));
    success.hidden = true;
    form.hidden = false;
    form.querySelector("#name").focus();
  });
})();
