/**
 * OCEBO 2026 — Main JavaScript
 * Vanilla JS — no dependencies
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
    if (!burger || !mobileMenu) return;

    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.setAttribute("aria-hidden", String(isOpen));
      document.body.style.overflow = isOpen ? "" : "hidden";
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        burger.getAttribute("aria-expanded") === "true"
      ) {
        burger.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        burger.focus();
      }
    });
  }

  /* ============================================
     DROPDOWN MENU — KEYBOARD ACCESSIBILITY
     ============================================ */
  function initDropdownKeyboard() {
    const dropdownItems = document.querySelectorAll(
      '.nav__item [aria-haspopup="true"]'
    );

    dropdownItems.forEach((trigger) => {
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const expanded = trigger.getAttribute("aria-expanded") === "true";
          trigger.setAttribute("aria-expanded", String(!expanded));
        }
      });

      // Close dropdown on Escape
      const parent = trigger.closest(".nav__item");
      parent.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          trigger.setAttribute("aria-expanded", "false");
          trigger.focus();
        }
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
     PARALLAX (Chiffres clefs cards)
     ============================================ */
  function initParallax() {
    const cards = document.querySelectorAll(".card-chiffre");
    if (!cards.length) return;

    const MAX_OFFSET = 80;
    const EASE = 0.08;

    // Store each card's current animated position
    const state = new Map();
    cards.forEach((card) => {
      card.style.transition = "none";
      card.style.willChange = "transform";
      state.set(card, { x: 0, y: 0, targetX: 0, targetY: 0 });
    });

    // On mouse move over the chiffres section, compute repulsion
    const section = document.querySelector(".section--chiffres");
    if (!section) return;

    function handlePointer(mx, my) {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const radius = 400;
        if (dist < radius && dist > 0) {
          const force = (1 - dist / radius) * MAX_OFFSET;
          const angle = Math.atan2(dy, dx);
          state.get(card).targetX = Math.cos(angle) * force;
          state.get(card).targetY = Math.sin(angle) * force;
        } else {
          state.get(card).targetX = 0;
          state.get(card).targetY = 0;
        }
      });
    }

    function resetTargets() {
      cards.forEach((card) => {
        const s = state.get(card);
        s.targetX = 0;
        s.targetY = 0;
      });
    }

    section.addEventListener("mousemove", (e) => {
      handlePointer(e.clientX, e.clientY);
    });

    section.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      handlePointer(t.clientX, t.clientY);
    }, { passive: true });

    section.addEventListener("mouseleave", resetTargets);
    section.addEventListener("touchend", resetTargets);

    // Animation loop — lerp toward target
    function tick() {
      cards.forEach((card) => {
        const s = state.get(card);
        s.x += (s.targetX - s.x) * EASE;
        s.y += (s.targetY - s.y) * EASE;

        // Clamp
        const len = Math.sqrt(s.x * s.x + s.y * s.y);
        if (len > MAX_OFFSET) {
          s.x = (s.x / len) * MAX_OFFSET;
          s.y = (s.y / len) * MAX_OFFSET;
        }

        card.style.transform =
          "translate(" + s.x.toFixed(1) + "px," + s.y.toFixed(1) + "px)";
      });

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
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
    let rafId = null;

    // Measure one set width (original slides only)
    function getSetWidth() {
      let w = 0;
      slides.forEach((s) => {
        w += s.offsetWidth + gap;
      });
      return w;
    }

    // Auto-scroll tick
    function tick() {
      if (!isDragging) {
        offset -= speed;
      }

      const setW = getSetWidth();
      // Wrap around: when we've scrolled past one full set, reset
      if (offset <= -setW) {
        offset += setW;
      }
      if (offset > 0) {
        offset -= setW;
      }

      track.style.transform = "translateX(" + offset + "px)";
      updateOpacity();
      rafId = requestAnimationFrame(tick);
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
      speed = 0.5;
    });

    // Disable CSS animation — we drive everything from JS
    track.style.animation = "none";
    rafId = requestAnimationFrame(tick);
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
     INIT
     ============================================ */
  function init() {
    addRevealClasses();
    initScrollReveal();
    initHeaderScroll();
    initMobileMenu();
    initDropdownKeyboard();
    initAccordions();
    initCounters();
    initParallax();
    initLogosSlider();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
