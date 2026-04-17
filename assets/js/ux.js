import { animate, inView } from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

const MAGNETIC_SELECTOR = ".btn, .nav-links a, .brand, .tag";
const CURSOR_TARGETS = "a, button, .btn, .card, .tag, .nav-links a";

const MOTION_INTENSITY = 1.25;

function initLenis() {
  if (!window.Lenis) return;
  const lenis = new window.Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function initGsapIntro() {
  if (!window.gsap) return;

  const heroTitle = document.querySelector(".hero h1");
  const heroText = document.querySelector(".hero p");
  const heroLogo = document.querySelector(".hero-logo");
  const cards = document.querySelectorAll(".card");

  if (heroLogo) {
    gsap.from(heroLogo, {
      scale: 0.88,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.to(heroLogo, {
      y: `+=${7 * MOTION_INTENSITY}`,
      repeat: -1,
      yoyo: true,
      duration: 2.2 / MOTION_INTENSITY,
      ease: "sine.inOut"
    });
  }

  if (heroTitle) {
    if (!heroTitle.dataset.splitReady) {
      const words = heroTitle.textContent.trim().split(/\s+/);
      heroTitle.innerHTML = words.map((word) => `<span class="split-word">${word}</span>`).join(" ");
      heroTitle.dataset.splitReady = "true";
    }

    const splitWords = heroTitle.querySelectorAll(".split-word");
    if (splitWords.length) {
      gsap.from(splitWords, {
        y: 34 * MOTION_INTENSITY,
        opacity: 0,
        rotateX: -70,
        transformOrigin: "top center",
        duration: 0.7,
        stagger: 0.07,
        ease: "power3.out"
      });
    }
  }

  if (heroText) {
    gsap.from(heroText, {
      y: 22,
      opacity: 0,
      duration: 0.6,
      delay: 0.12,
      ease: "power3.out"
    });
  }

  if (cards.length) {
    gsap.from(cards, {
      y: 26 * MOTION_INTENSITY,
      opacity: 0,
      duration: 0.55,
      stagger: 0.06,
      delay: 0.2,
      ease: "power2.out"
    });
  }

  const brand = document.querySelector(".brand");
  if (brand) {
    gsap.to(brand, {
      filter: "drop-shadow(0 0 10px rgba(154,92,255,0.45))",
      repeat: -1,
      yoyo: true,
      duration: 1.8,
      ease: "sine.inOut"
    });
  }

  const kpiValues = document.querySelectorAll(".kpi .value");
  if (kpiValues.length) {
    gsap.from(kpiValues, {
      opacity: 0,
      y: 8,
      duration: 0.45,
      stagger: 0.06,
      delay: 0.35,
      ease: "power2.out"
    });
  }
}

function initPageSwipeIntro() {
  if (!window.gsap) return;

  let swipe = document.querySelector(".page-swipe");
  if (!swipe) {
    swipe = document.createElement("div");
    swipe.className = "page-swipe";
    document.body.appendChild(swipe);
  }

  gsap.killTweensOf(swipe);
  gsap.set(swipe, { yPercent: 0, opacity: 1, display: "block" });
  gsap.to(swipe, {
    yPercent: -110,
    duration: 0.95 / MOTION_INTENSITY,
    ease: "power4.inOut",
    delay: 0.05,
    onComplete: () => {
      gsap.set(swipe, { display: "none" });
    }
  });
}

function initMotionEffects() {
  const attachHoverAnimation = (selector, animateIn, animateOut) => {
    document.querySelectorAll(selector).forEach((element) => {
      let activeAnimation = null;

      const onEnter = () => {
        activeAnimation?.stop?.();
        activeAnimation = animateIn(element);
      };

      const onLeave = () => {
        activeAnimation?.stop?.();
        activeAnimation = null;
        animateOut(element);
      };

      element.addEventListener("mouseenter", onEnter);
      element.addEventListener("mouseleave", onLeave);
      element.addEventListener("focus", onEnter);
      element.addEventListener("blur", onLeave);
    });
  };

  inView(
    ".card",
    (element) => {
      animate(
        element,
        { opacity: [0.35, 1], transform: ["translateY(16px)", "translateY(0px)"] },
        { duration: 0.55, easing: "ease-out" }
      );
    },
    { margin: "-10% 0px -5% 0px" }
  );

  attachHoverAnimation(
    ".btn",
    (element) => animate(element, { scale: 1.03 }, { duration: 0.18, easing: "ease-out" }),
    (element) => animate(element, { scale: 1 }, { duration: 0.2, easing: "ease-out" })
  );

  inView(
    ".kpi",
    (element) => {
      animate(
        element,
        { boxShadow: ["0 0 0 rgba(154,92,255,0)", "0 0 24px rgba(154,92,255,0.28)", "0 0 0 rgba(154,92,255,0)"] },
        { duration: 1.1, easing: "ease-in-out" }
      );
    },
    { margin: "-8% 0px" }
  );
}

function initPointerParallax() {
  const hero = document.querySelector(".hero");
  if (!hero || !window.gsap) return;

  const heroLogo = hero.querySelector(".hero-logo");
  const heroTitle = hero.querySelector("h1");
  if (!heroLogo && !heroTitle) return;

  let bounds = hero.getBoundingClientRect();
  window.addEventListener("resize", () => {
    bounds = hero.getBoundingClientRect();
  });

  hero.addEventListener("mousemove", (event) => {
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    if (heroLogo) {
      gsap.to(heroLogo, {
        x: x * 12 * MOTION_INTENSITY,
        y: y * 8 * MOTION_INTENSITY,
        duration: 0.4,
        ease: "power2.out"
      });
    }

    if (heroTitle) {
      gsap.to(heroTitle, {
        x: x * 6 * MOTION_INTENSITY,
        y: y * 4 * MOTION_INTENSITY,
        duration: 0.45,
        ease: "power2.out"
      });
    }
  });

  hero.addEventListener("mouseleave", () => {
    if (heroLogo) {
      gsap.to(heroLogo, { x: 0, y: 0, duration: 0.45, ease: "power2.out" });
    }
    if (heroTitle) {
      gsap.to(heroTitle, { x: 0, y: 0, duration: 0.45, ease: "power2.out" });
    }
  });
}

function initMagneticElements() {
  if (!window.gsap) return;

  document.querySelectorAll(MAGNETIC_SELECTOR).forEach((element) => {
    if (element.dataset.magneticBound === "true") return;
    element.dataset.magneticBound = "true";

    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * 0.16 * MOTION_INTENSITY,
        y: y * 0.18 * MOTION_INTENSITY,
        duration: 0.25,
        ease: "power2.out"
      });
    });

    const resetElementPosition = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "elastic.out(1, 0.42)"
      });
    };

    element.addEventListener("mouseleave", resetElementPosition);
    element.addEventListener("pointerleave", resetElementPosition);
    element.addEventListener("blur", resetElementPosition);
  });
}


function initScrollProgress() {
  let bar = document.querySelector(".scroll-progress");
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
  }

  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

function initCustomCursor() {
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!finePointer) return;

  if (!document.querySelector(".hydra-cursor")) {
    const cursor = document.createElement("div");
    cursor.className = "hydra-cursor";
    const dot = document.createElement("div");
    dot.className = "hydra-cursor-dot";
    cursor.appendChild(dot);
    document.body.appendChild(cursor);
  }

  const cursor = document.querySelector(".hydra-cursor");
  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const current = { x: target.x, y: target.y };

  document.body.classList.add("cursor-enhanced");

  window.addEventListener("pointermove", (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
  });

  window.addEventListener("pointerdown", () => cursor.classList.add("is-click"));
  window.addEventListener("pointerup", () => cursor.classList.remove("is-click"));

  document.querySelectorAll(CURSOR_TARGETS).forEach((element) => {
    element.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
    element.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  });

  const loop = () => {
    current.x += (target.x - current.x) * 0.22;
    current.y += (target.y - current.y) * 0.22;
    cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}

function initViewTransitionHelpers() {
  window.withViewTransition = (callback) => {
    if (!document.startViewTransition) {
      callback();
      return Promise.resolve();
    }

    const transition = document.startViewTransition(() => callback());
    return transition.finished;
  };

  document.querySelectorAll(".nav-links a").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || !document.startViewTransition) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      document.startViewTransition(() => {
        window.location.href = href;
      });
    });
  });
}

initLenis();
initPageSwipeIntro();
initGsapIntro();
initMotionEffects();
initPointerParallax();
initMagneticElements();
initScrollProgress();
initCustomCursor();
initViewTransitionHelpers();
