/*
 * Portfolio — ปภสิฏฐ์ สุภาผล
 * Progressive enhancement only: every page is fully readable with JavaScript off.
 *   1. TH / EN language toggle (remembered per browser, ?lang=en overrides)
 *   2. Mobile menu
 *   3. Certificate lightbox (<dialog>)
 *   4. Reveal-on-scroll
 *   5. Click ripple
 * All motion is skipped when the visitor prefers reduced motion.
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const LANG_KEY = "portfolio-lang";
  const LANGS = ["th", "en"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      const update = () => {
        applyLang(next);
        storage.set(LANG_KEY, next);
      };

      if (reduceMotion) {
        update();
        return;
      }

      btn.classList.remove("is-spinning");
      void btn.offsetWidth; // restart the animation on rapid repeat clicks
      btn.classList.add("is-spinning");
      btn.addEventListener("animationend", () => btn.classList.remove("is-spinning"), { once: true });

      // Cross-fade the whole page between languages where supported.
      if (typeof document.startViewTransition === "function") {
        document.startViewTransition(update);
      } else {
        update();
      }
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

  /* ---------- 5. Click ripple ---------- */
  const RIPPLE_HOSTS = ".btn, .nav-links a, .lang-toggle, .icon-btn, .card-link, .cert-media";

  if (!reduceMotion) {
    document.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const host = e.target.closest(RIPPLE_HOSTS);
      if (!host) return;

      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const ink = document.createElement("span");
      ink.className = "ripple";
      ink.setAttribute("aria-hidden", "true");
      ink.style.width = `${size}px`;
      ink.style.height = `${size}px`;
      ink.style.left = `${e.clientX - rect.left - size / 2}px`;
      ink.style.top = `${e.clientY - rect.top - size / 2}px`;
      host.appendChild(ink);
      ink.addEventListener("animationend", () => ink.remove(), { once: true });
    });
  }
})();
