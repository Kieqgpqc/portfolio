/*
 * Portfolio — ปภสิฏฐ์ สุภาผล
 * Progressive enhancement only: every page is fully readable with JavaScript off.
 *   1. TH / EN language toggle (remembered per browser)
 *   2. Mobile menu
 *   3. Certificate lightbox (<dialog>)
 *   4. Reveal-on-scroll (skipped when the user prefers reduced motion)
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const LANG_KEY = "portfolio-lang";
  const LANGS = ["th", "en"];

  // localStorage can throw (private mode, blocked site data). Language still
  // switches for the current page; it just won't be remembered.
  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch { /* not persisted — see note above */ }
    },
  };

  /* ---------- 1. Language toggle ---------- */
  function applyLang(lang) {
    const safe = LANGS.includes(lang) ? lang : "th";
    root.dataset.lang = safe;
    root.lang = safe;
    document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(safe === "en"));
    });
  }

  // ?lang=en / ?lang=th in the URL wins (shareable link), then the saved choice.
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  applyLang(LANGS.includes(urlLang) ? urlLang : storage.get(LANG_KEY));

  document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = root.dataset.lang === "en" ? "th" : "en";
      applyLang(next);
      storage.set(LANG_KEY, next);
    });
  });

  /* ---------- 2. Mobile menu ---------- */
  const menuBtn = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById("site-menu");

  if (menuBtn && menu) {
    const setOpen = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    };

    menuBtn.addEventListener("click", () => {
      setOpen(menuBtn.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        menuBtn.focus();
      }
    });

    // Close when resizing up to desktop so the menu never gets stuck open.
    window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- 3. Certificate lightbox ---------- */
  const dialog = document.getElementById("lightbox");

  if (dialog && typeof dialog.showModal === "function") {
    const img = dialog.querySelector("img");
    const caption = dialog.querySelector("[data-lightbox-caption]");

    document.querySelectorAll("a[data-lightbox]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const thumb = link.querySelector("img");
        img.src = link.href;
        img.alt = thumb ? thumb.alt : "";
        caption.textContent = img.alt;
        dialog.showModal();
      });
    });

    // Click on the dimmed backdrop (outside the image panel) closes the dialog.
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => {
      img.removeAttribute("src");
    });
  }
  // Without <dialog> support the links simply open the full-size image.

  /* ---------- 4. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  }
})();
