(function () {
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

(function initHeaderScroll() {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle("header-scrolled", window.scrollY > 24);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

(function initMotion() {
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduce || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.querySelectorAll(".reveal-hero, .reveal-hero-card, .reveal-up, .feature-card, .studio-tile, .pricing-card").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const easing = "power2.out";

  /*
   * Hero is above the fold: ScrollTrigger positions like "top 88%" often never cross,
   * while fromTo with ScrollTrigger defaults to immediateRender: true → content stays opacity: 0 forever.
   * Run hero entrances without scroll; use immediateRender:false for all ScrollTrigger tweens.
   */

  gsap.fromTo(".reveal-hero > *", 
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: easing,
      stagger: 0.08,
      delay: 0.12,
      immediateRender: false,
    });

  gsap.fromTo(".reveal-hero-card",
    { opacity: 0, y: 36, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.85,
      ease: easing,
      delay: 0.22,
      immediateRender: false,
    });

  const scrollTriggerReveal = {
    toggleActions: "play none none none",
  };

  document.querySelectorAll(".reveal-up").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: easing,
        immediateRender: false,
        scrollTrigger: { ...scrollTriggerReveal, trigger: el, start: "top 90%" },
      });
  });

  document.querySelectorAll(".reveal-stagger").forEach((container) => {
    const tiles = container.querySelectorAll(".studio-tile");
    gsap.fromTo(tiles,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: easing,
        immediateRender: false,
        scrollTrigger: { ...scrollTriggerReveal, trigger: container, start: "top 90%" },
      });
  });

  const grid = document.querySelector(".reveal-grid");
  if (grid) {
    const cards = grid.querySelectorAll(".feature-card");
    gsap.fromTo(cards,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: easing,
        immediateRender: false,
        scrollTrigger: { ...scrollTriggerReveal, trigger: grid, start: "top 90%" },
      });
  }

  const pricing = document.querySelector(".reveal-pricing");
  if (pricing) {
    const cards = pricing.querySelectorAll(".pricing-card");
    gsap.fromTo(cards,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: { each: 0.14 },
        ease: easing,
        immediateRender: false,
        scrollTrigger: { ...scrollTriggerReveal, trigger: pricing, start: "top 92%" },
      });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());

  // Scenario accordion + panel switcher
  const scenarioItems = document.querySelectorAll(".scenario-item");
  const scenarioPanels = document.querySelectorAll(".scenario-panel");

  function activateScenario(index) {
    scenarioItems.forEach((item, i) => {
      const dot     = item.querySelector(".scenario-dot");
      const title   = item.querySelector(".scenario-title");
      const chevron = item.querySelector(".scenario-chevron");
      const body    = item.querySelector(".scenario-body");
      const isActive = i === index;

      dot.style.backgroundColor = isActive ? "#0055FF" : "#CCCCCC";
      title.style.color         = isActive ? "#0055FF" : "#999999";
      title.style.fontWeight    = isActive ? "500"     : "400";
      chevron.style.color       = isActive ? "#0055FF" : "#CCCCCC";
      chevron.style.transform   = isActive ? "rotate(180deg)" : "rotate(0deg)";
      // Use a large fixed ceiling so CSS transition works (0 → big number)
      body.style.maxHeight      = isActive ? body.scrollHeight + 40 + "px" : "0px";
    });

    scenarioPanels.forEach((panel, i) => {
      const isActive = i === index;
      panel.style.opacity       = isActive ? "1"    : "0";
      panel.style.pointerEvents = isActive ? "auto" : "none";
    });
  }

  // Wire up clicks
  scenarioItems.forEach((item) => {
    item.addEventListener("click", () => {
      activateScenario(Number(item.dataset.index));
    });
  });

  // Initialise first item with correct scrollHeight after layout settles
  window.addEventListener("load", () => {
    activateScenario(0);
  });
})();

(function initVerticalTabs() {
  document.querySelectorAll("[data-vertical-tabs]").forEach((root) => {
    const tablist = root.querySelector('[role="tablist"]');
    const tabs = tablist ? tablist.querySelectorAll('[role="tab"]') : root.querySelectorAll('[role="tab"]');
    const panels = root.querySelectorAll('[role="tabpanel"]');
    if (!tabs.length || tabs.length !== panels.length) return;

    const label = root.getAttribute("data-tabs-label");
    if (tablist && label && !tablist.getAttribute("aria-label")) {
      tablist.setAttribute("aria-label", label);
    }

    function select(index) {
      const n = Math.max(0, Math.min(index, tabs.length - 1));
      tabs.forEach((tab, j) => {
        const on = j === n;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        tab.classList.toggle("home-platform-tabbed__tab--active", on);
      });
      panels.forEach((panel, j) => {
        panel.hidden = j !== n;
      });
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i));

      tab.addEventListener("keydown", (e) => {
        const vert = tablist && tablist.getAttribute("aria-orientation") === "vertical";
        let next = i;
        const down = vert ? e.key === "ArrowDown" : e.key === "ArrowRight";
        const up = vert ? e.key === "ArrowUp" : e.key === "ArrowLeft";
        if (down) {
          e.preventDefault();
          next = (i + 1) % tabs.length;
        } else if (up) {
          e.preventDefault();
          next = (i - 1 + tabs.length) % tabs.length;
        } else if (e.key === "Home") {
          e.preventDefault();
          next = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          next = tabs.length - 1;
        } else {
          return;
        }
        select(next);
        tabs[next].focus();
      });
    });

    select(0);
  });
})();

(function initMobileNav() {
  const btn = document.getElementById("mobile-nav-btn");
  const nav = document.getElementById("mobile-nav");
  const closeBtn = document.getElementById("mobile-nav-close");
  const backdrop = document.getElementById("mobile-nav-backdrop");

  if (!btn || !nav) return;

  function open() {
    nav.classList.add("is-open");
    nav.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("mobile-nav-open");
    closeBtn && closeBtn.focus();
  }

  function close() {
    nav.classList.remove("is-open");
    nav.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-nav-open");
    btn.focus();
  }

  btn.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  backdrop && backdrop.addEventListener("click", close);

  nav.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Trap focus inside the drawer while open
  nav.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !nav.classList.contains("is-open")) return;
    const focusable = Array.from(
      nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Close nav when viewport reaches desktop width
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", (e) => { if (e.matches) close(); });
})();
