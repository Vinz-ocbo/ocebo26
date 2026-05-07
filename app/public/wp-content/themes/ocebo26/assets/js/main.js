/**
 * OCEBO 2026 — Main JavaScript (interactivité critique)
 *
 * Nav, header, mobile menu, dropdowns, accordions, FAQ, counters,
 * scroll reveal, logos slider.
 *
 * Les effets cosmétiques (Parallax, DotMesh, ScrollLace) vivent dans
 * main-fx.js, chargé en parallèle via <script defer> dans le HTML/WP
 * enqueue. Init chunkée côté main-fx.js pour ne pas créer de long task
 * malgré le chargement eager.
 *
 * Vanilla JS — no dependencies.
 */
(function () {
  "use strict";

  /* ============================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================ */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      ".reveal, .reveal-stagger"
    );
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* ============================================
     HEADER SCROLL STATE
     ============================================ */
  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastScrollY = 0;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY;

          header.classList.toggle("is-scrolled", currentY > 50);

          if (delta > 0 && currentY > 100) {
            // Scrolling down
            header.classList.add("is-hidden");
          } else if (delta < -20) {
            // Scrolling up more than 20px
            header.classList.remove("is-hidden");
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ============================================
     MOBILE MENU
     ============================================ */
  function initMobileMenu() {
    const burger = document.querySelector(".nav__burger");
    const mobileMenu = document.getElementById("mobile-menu");
    const header = document.querySelector(".site-header");
    if (!burger || !mobileMenu) return;

    function expandAccordion(toggle) {
      const id = toggle.getAttribute("aria-controls");
      const panel = id ? document.getElementById(id) : null;
      if (!panel) return;
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      panel.style.maxHeight = "0px";
      void panel.offsetHeight;
      panel.style.maxHeight = panel.scrollHeight + "px";
      function onEnd(e) {
        if (e.propertyName !== "max-height") return;
        panel.style.maxHeight = "none";
        panel.removeEventListener("transitionend", onEnd);
      }
      panel.addEventListener("transitionend", onEnd);
    }

    function collapseAccordion(toggle, instant) {
      const id = toggle.getAttribute("aria-controls");
      const panel = id ? document.getElementById(id) : null;
      if (!panel) return;
      toggle.setAttribute("aria-expanded", "false");
      if (instant) {
        panel.hidden = true;
        panel.style.maxHeight = "";
        return;
      }
      panel.style.maxHeight = panel.scrollHeight + "px";
      void panel.offsetHeight;
      panel.style.maxHeight = "0px";
      function onEnd(e) {
        if (e.propertyName !== "max-height") return;
        panel.hidden = true;
        panel.style.maxHeight = "";
        panel.removeEventListener("transitionend", onEnd);
      }
      panel.addEventListener("transitionend", onEnd);
    }

    function openMenu() {
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Fermer le menu");
      mobileMenu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      // Header doit rester visible pour exposer la croix de fermeture
      if (header) header.classList.remove("is-hidden");
    }

    function closeMenu() {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
      mobileMenu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      // Replie tous les sous-menus pour qu'on retrouve l'état initial à la prochaine ouverture
      mobileMenu
        .querySelectorAll(".mobile-menu__toggle[aria-expanded='true']")
        .forEach(function (t) { collapseAccordion(t, true); });
    }

    burger.addEventListener("click", function () {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu(); else openMenu();
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        closeMenu();
        burger.focus();
      }
    });

    // Accordion toggles (sous-menus de niveau 2)
    mobileMenu.querySelectorAll(".mobile-menu__toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        if (expanded) collapseAccordion(toggle, false);
        else expandAccordion(toggle);
      });
    });
  }

  /* ============================================
     DROPDOWN PORTAL
     Sort les .nav__dropdown du DOM du .site-header pour les rattacher à <body>.
     Pourquoi : le backdrop-filter du header (.is-scrolled) crée un backdrop-root
     qui piège le rendering des descendants — le backdrop-filter d'un dropdown
     enfant ne voit alors plus la page mais la couche compositée du header,
     d'où la perte de flou. En sortant les dropdowns à body level, les deux
     glass coexistent.
     Position calculée en position:fixed depuis le bounding rect du header
     et du trigger.
     ============================================ */
  function initDropdownPortal() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const items = document.querySelectorAll(".nav__item");
    if (!items.length) return;

    let portal = document.getElementById("nav-dropdown-portal");
    if (!portal) {
      portal = document.createElement("div");
      portal.id = "nav-dropdown-portal";
      document.body.appendChild(portal);
    }

    items.forEach(function (item) {
      const dropdown = item.querySelector(".nav__dropdown");
      const trigger = item.querySelector('.nav__link[aria-haspopup="true"]');
      if (!dropdown || !trigger) return;

      portal.appendChild(dropdown);

      let hideTimer = null;

      function reposition() {
        const headerRect = header.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const cx = triggerRect.left + triggerRect.width / 2;
        // 6px sous le bandeau header pour éviter tout chevauchement, et
        // 170 = 340/2 pour centrer le dropdown (width fixe en CSS) sur le trigger.
        dropdown.style.top = (headerRect.bottom + 6) + "px";
        dropdown.style.left = (cx - 170) + "px";
      }

      function open() {
        window.clearTimeout(hideTimer);
        reposition();
        dropdown.classList.add("is-open");
        item.classList.add("has-open-dropdown");
        trigger.setAttribute("aria-expanded", "true");
      }

      function close() {
        dropdown.classList.remove("is-open");
        item.classList.remove("has-open-dropdown");
        trigger.setAttribute("aria-expanded", "false");
      }

      function scheduleClose() {
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(close, 180);
      }

      function isFocusInside(target) {
        return !!target && (item.contains(target) || dropdown.contains(target));
      }

      item.addEventListener("mouseenter", open);
      item.addEventListener("mouseleave", scheduleClose);
      dropdown.addEventListener("mouseenter", open);
      dropdown.addEventListener("mouseleave", scheduleClose);

      trigger.addEventListener("focus", open);
      item.addEventListener("focusout", function (e) {
        if (!isFocusInside(e.relatedTarget)) scheduleClose();
      });
      dropdown.addEventListener("focusout", function (e) {
        if (!isFocusInside(e.relatedTarget)) scheduleClose();
      });

      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (dropdown.classList.contains("is-open")) close();
          else open();
        }
      });

      function onEscape(e) {
        if (e.key === "Escape" && dropdown.classList.contains("is-open")) {
          close();
          trigger.focus();
        }
      }
      item.addEventListener("keydown", onEscape);
      dropdown.addEventListener("keydown", onEscape);

      window.addEventListener("resize", function () {
        if (dropdown.classList.contains("is-open")) reposition();
      });
    });
  }

  /* ============================================
     HOVER INDICATOR (logique partagée)
     Glissement d'une pastille de fond sous l'item survolé,
     animée d'un item à l'autre. Utilisé par les dropdowns nav et la FAQ.
     ============================================ */
  function initHoverIndicator(container, items, indicator, shouldShow) {
    let firstShow = true;

    function moveTo(item) {
      const animate = !firstShow;
      if (!animate) {
        indicator.style.transition = "none";
      }
      // Calcul via getBoundingClientRect : robuste quelle que soit la profondeur
      // du DOM et le offsetParent (notamment pour <summary> dans <details>).
      const itemRect = item.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      indicator.style.left = (itemRect.left - containerRect.left) + "px";
      indicator.style.top = (itemRect.top - containerRect.top) + "px";
      indicator.style.width = itemRect.width + "px";
      indicator.style.height = itemRect.height + "px";
      if (!animate) {
        void indicator.offsetHeight;
        indicator.style.transition = "";
        firstShow = false;
      }
      indicator.classList.add("is-active");
    }

    function hide() {
      indicator.classList.remove("is-active");
    }

    function maybeMove(item) {
      if (shouldShow && !shouldShow(item)) {
        hide();
        return;
      }
      moveTo(item);
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () { maybeMove(item); });
      item.addEventListener("focus", function () { maybeMove(item); });
    });

    container.addEventListener("mouseleave", hide);
    container.addEventListener("focusout", function (e) {
      if (!container.contains(e.relatedTarget)) hide();
    });
  }

  /* ============================================
     DROPDOWN HOVER INDICATOR
     ============================================ */
  function initDropdownIndicator() {
    document.querySelectorAll(".nav__dropdown-inner").forEach(function (inner) {
      const indicator = document.createElement("div");
      indicator.className = "nav__dropdown-indicator";
      indicator.setAttribute("aria-hidden", "true");
      // En dernier enfant : ne décale pas les :nth-child des liens (stagger).
      // Le z-index du CSS le maintient derrière les liens.
      inner.appendChild(indicator);

      const links = inner.querySelectorAll(".nav__dropdown-link");
      initHoverIndicator(inner, links, indicator);
    });
  }

  /* ============================================
     FAQ HOVER INDICATOR
     ============================================ */
  function initFaqIndicator() {
    document.querySelectorAll(".faq__list").forEach(function (list) {
      // .faq__list reçoit .reveal-stagger ailleurs : tout enfant direct hérite
      // d'une transition opacity/transform qui écrase la nôtre. On encapsule
      // donc .faq__list dans un wrapper et on place l'indicateur en sibling.
      const wrap = document.createElement("div");
      wrap.className = "faq__wrap";
      list.parentElement.insertBefore(wrap, list);
      wrap.appendChild(list);

      const indicator = document.createElement("div");
      indicator.className = "faq__indicator";
      indicator.setAttribute("aria-hidden", "true");
      wrap.appendChild(indicator);

      const headers = list.querySelectorAll(".accordion__header");
      initHoverIndicator(wrap, headers, indicator, function (header) {
        // Ne pas afficher l'indicateur sur les questions ouvertes :
        // elles ont déjà leur propre fond cyan.
        const accordion = header.closest(".accordion");
        return !accordion || !accordion.hasAttribute("open");
      });
    });
  }

  /* ============================================
     ACCORDION ANIMATION (FAQ)
     ============================================ */
  function initAccordions() {
    const accordions = document.querySelectorAll(".accordion");

    accordions.forEach((details) => {
      const summary = details.querySelector(".accordion__header");
      const body = details.querySelector(".accordion__body");
      if (!summary || !body) return;

      let isAnimating = false;

      summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (isAnimating) return;

        if (details.open) {
          // Close
          isAnimating = true;
          const startHeight = details.offsetHeight;
          const endHeight = summary.offsetHeight;

          const anim = details.animate(
            { height: [startHeight + "px", endHeight + "px"] },
            { duration: 300, easing: "ease" }
          );

          anim.onfinish = () => {
            details.open = false;
            isAnimating = false;
            details.style.height = "";
            details.style.overflow = "";
          };

          details.style.overflow = "hidden";
        } else {
          // Open
          details.open = true;
          isAnimating = true;

          const startHeight = summary.offsetHeight;
          const endHeight = details.offsetHeight;

          const anim = details.animate(
            { height: [startHeight + "px", endHeight + "px"] },
            { duration: 300, easing: "ease" }
          );

          details.style.overflow = "hidden";

          anim.onfinish = () => {
            isAnimating = false;
            details.style.height = "";
            details.style.overflow = "";
          };
        }
      });
    });
  }

  /* ============================================
     COUNTER ANIMATION (Chiffres clefs)
     ============================================ */
  function initCounters() {
    const counters = document.querySelectorAll(".card-chiffre");
    if (!counters.length) return;

    function animateCounter(el) {
      const numberEl = el.querySelector(".card-chiffre__number");
      const target = parseInt(el.dataset.target, 10);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        numberEl.textContent = prefix + current.toLocaleString("fr-FR") + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ============================================
     LOGOS SLIDER — Infinite loop + drag
     ============================================ */
  function initLogosSlider() {
    const slider = document.querySelector(".logos-slider");
    const track = document.querySelector(".logos-slider__track");
    if (!slider || !track) return;

    const slides = Array.from(
      track.querySelectorAll(".logos-slider__slide:not([aria-hidden])")
    );
    const gap = 40; // matches --space-5
    let offset = 0;
    let speed = 0.5; // px per frame
    let isDragging = false;
    let dragStartX = 0;
    let dragOffset = 0;
    let rafActive = false;
    let isInView = false;

    // Measure one set width (original slides only)
    function getSetWidth() {
      let w = 0;
      slides.forEach((s) => {
        w += s.offsetWidth + gap;
      });
      return w;
    }

    // Auto-scroll tick — pause hors viewport
    function tick() {
      if (!rafActive) return;

      if (!isDragging) {
        offset -= speed;
      }

      const setW = getSetWidth();
      if (offset <= -setW) offset += setW;
      if (offset > 0) offset -= setW;

      track.style.transform = "translateX(" + offset + "px)";
      updateOpacity();
      requestAnimationFrame(tick);
    }

    function startTick() {
      if (rafActive) return;
      rafActive = true;
      requestAnimationFrame(tick);
    }
    function stopTick() {
      rafActive = false;
    }

    // Opacity based on center distance
    function updateOpacity() {
      const sliderRect = slider.getBoundingClientRect();
      const center = sliderRect.left + sliderRect.width / 2;
      const allSlides = track.querySelectorAll(".logos-slider__slide");

      allSlides.forEach((slide) => {
        const slideRect = slide.getBoundingClientRect();
        const slideCenter = slideRect.left + slideRect.width / 2;
        const distance = Math.abs(center - slideCenter);
        const maxDist = sliderRect.width / 2;

        slide.classList.remove("is-center", "is-near");

        if (distance < 80) {
          slide.classList.add("is-center");
        } else if (distance < maxDist * 0.4) {
          slide.classList.add("is-near");
        }
      });
    }

    // Drag handlers
    function onDown(e) {
      isDragging = true;
      dragStartX = e.clientX ?? e.touches[0].clientX;
      dragOffset = offset;
      slider.classList.add("is-dragging");
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;
      const x = e.clientX ?? e.touches[0].clientX;
      offset = dragOffset + (x - dragStartX);
    }

    function onUp() {
      if (!isDragging) return;
      isDragging = false;
      slider.classList.remove("is-dragging");
    }

    slider.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    slider.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);

    // Pause auto-scroll on hover (but allow drag)
    slider.addEventListener("mouseenter", () => {
      speed = 0;
    });
    slider.addEventListener("mouseleave", () => {
      if (isInView) speed = 0.5;
    });

    // Disable CSS animation — we drive everything from JS
    track.style.animation = "none";

    // Auto-scroll uniquement quand le slider est visible (économie CPU)
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInView = true;
            speed = 0.5;
            startTick();
          } else {
            isInView = false;
            stopTick();
          }
        });
      }, { threshold: 0.1 });
      io.observe(slider);
    } else {
      isInView = true;
      startTick();
    }
  }

  /* ============================================
     ADD REVEAL CLASSES TO SECTIONS
     ============================================ */
  function addRevealClasses() {
    // Section headers
    document.querySelectorAll(
      ".hero__content, .bloc-liste__header, .section-header, .contact__inner > h2"
    ).forEach((el) => el.classList.add("reveal"));

    // Stagger grids
    document.querySelectorAll(
      ".acces-direct__grid, .pourquoi__list, .chiffres__grid, .faq__list"
    ).forEach((el) => el.classList.add("reveal-stagger"));

    // Individual reveals
    document.querySelectorAll(
      ".bloc-liste__body, .contact-form, .logos-slider, .logos__desc"
    ).forEach((el) => el.classList.add("reveal"));
  }

  /* ============================================
     INIT — exécution à DOMContentLoaded
     ============================================ */
  function init() {
    addRevealClasses();
    initScrollReveal();
    initHeaderScroll();
    initMobileMenu();
    initDropdownPortal();
    initDropdownIndicator();
    initAccordions();
    initFaqIndicator();
    initCounters();
    initLogosSlider();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
