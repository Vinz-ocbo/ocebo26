/**
 * Logos Slider — Frontend JS
 * Infinite auto-scroll + drag interaction
 */
(function () {
  "use strict";

  function initLogosSlider() {
    const slider = document.querySelector(".logos-slider");
    const track = document.querySelector(".logos-slider__track");
    if (!slider || !track) return;

    const slides = Array.from(
      track.querySelectorAll(".logos-slider__slide:not([aria-hidden])")
    );
    const gap = 40;
    let offset = 0;
    let speed = 0.5;
    let isDragging = false;
    let dragStartX = 0;
    let dragOffset = 0;

    function getSetWidth() {
      let w = 0;
      slides.forEach((s) => {
        w += s.offsetWidth + gap;
      });
      return w;
    }

    function tick() {
      if (!isDragging) {
        offset -= speed;
      }

      const setW = getSetWidth();
      if (offset <= -setW) {
        offset += setW;
      }
      if (offset > 0) {
        offset -= setW;
      }

      track.style.transform = "translateX(" + offset + "px)";
      updateOpacity();
      requestAnimationFrame(tick);
    }

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

    slider.addEventListener("mouseenter", () => {
      speed = 0;
    });
    slider.addEventListener("mouseleave", () => {
      speed = 0.5;
    });

    track.style.animation = "none";
    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLogosSlider);
  } else {
    initLogosSlider();
  }
})();
