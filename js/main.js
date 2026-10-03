(function () {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  const progressBar = document.querySelector("[data-progress-bar]");
  const toTop = document.querySelector("[data-to-top]");
  if (year) year.textContent = String(new Date().getFullYear());

  const sectionLinks = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function setCurrent(id) {
    sectionLinks.forEach((link) => {
      const on = id && link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-current", on);
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  const onScroll = () => {
    header.classList.toggle("is-stuck", window.scrollY > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
    const showTop = window.scrollY > 700;
    toTop.classList.toggle("is-visible", showTop);
    toTop.setAttribute("aria-hidden", showTop ? "false" : "true");
    toTop.tabIndex = showTop ? 0 : -1;
    if (window.scrollY < 40) setCurrent("");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (sections.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("has-reveal");
  }
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
  );
  if (document.documentElement.classList.contains("has-reveal")) {
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  }

  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible || window.scrollY < 40) return;
      setCurrent(visible.target.id);
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: [0.1, 0.25, 0.5, 0.75, 1] }
  );
  sections.forEach((section) => spy.observe(section));

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  function closeNav() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      toggle.focus();
    }
  });

  const filters = document.querySelectorAll("[data-filter]");
  const gallery = document.querySelector("[data-gallery]");
  const figures = gallery.querySelectorAll("figure");
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.getAttribute("data-filter");
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      let shown = 0;
      figures.forEach((figure) => {
        const show = kind === "all" || figure.getAttribute("data-kind") === kind;
        figure.classList.toggle("is-hidden", !show);
        if (show) shown += 1;
      });
      gallery.dataset.count = String(shown);
      if (lightbox.open) lightbox.close();
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
    const text = brief.textContent;
    try {
      await navigator.clipboard.writeText(text);
      copyNote.textContent = "Copied. Paste it into an Instagram message to @gconstructioninc.";
    } catch (error) {
      const range = document.createRange();
      range.selectNodeContents(brief);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyNote.textContent = "Clipboard blocked. The brief is selected — copy it, then paste it into Instagram.";
    }
  });

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImg = lightbox.querySelector("[data-lightbox-img]");
  const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
  const lightboxCount = lightbox.querySelector("[data-lightbox-count]");
  const lightboxPrev = lightbox.querySelector("[data-lightbox-prev]");
  const lightboxNext = lightbox.querySelector("[data-lightbox-next]");
  let lightboxItems = [];
  let lightboxIndex = 0;

  function visibleFigures() {
    return [...figures].filter((figure) => !figure.classList.contains("is-hidden"));
  }

  function renderLightbox() {
    const figure = lightboxItems[lightboxIndex];
    const image = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    lightboxImg.src = image.currentSrc || image.src;
    lightboxImg.alt = image.alt;
    lightboxCaption.replaceChildren();
    caption.childNodes.forEach((node) => lightboxCaption.appendChild(node.cloneNode(true)));
    lightboxCount.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
    const single = lightboxItems.length < 2;
    lightboxPrev.hidden = single;
    lightboxNext.hidden = single;
  }

  function openLightbox(figure) {
    lightboxItems = visibleFigures();
    lightboxIndex = Math.max(0, lightboxItems.indexOf(figure));
    renderLightbox();
    if (!lightbox.open) lightbox.showModal();
  }

  function stepLightbox(delta) {
    if (lightboxItems.length < 2) return;
    lightboxIndex = (lightboxIndex + delta + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  }

  gallery.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => openLightbox(button.closest("figure")));
  });
  lightbox.querySelector("[data-lightbox-close]").addEventListener("click", () => lightbox.close());
  lightboxPrev.addEventListener("click", () => stepLightbox(-1));
  lightboxNext.addEventListener("click", () => stepLightbox(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepLightbox(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepLightbox(-1);
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
