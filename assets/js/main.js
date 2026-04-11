document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("page-loaded");

  const sections = Array.from(document.querySelectorAll(".reveal-section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
  const siteNavLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const siteHeader = document.querySelector(".site-header");
  const siteNav = document.querySelector(".site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const greetTexts = Array.from(document.querySelectorAll(".greet-text"));
  const scrollThreshold = 28;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMenu = function () {
    if (!siteHeader || !menuToggle) {
      return;
    }

    siteHeader.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  const updateHeaderState = function () {
    if (!siteHeader) {
      return;
    }

    siteHeader.classList.toggle("is-scrolled", window.scrollY > scrollThreshold);
  };

  if (siteHeader && siteNav && menuToggle) {
    menuToggle.addEventListener("click", function () {
      const isOpen = siteHeader.classList.toggle("is-menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNavLinks.forEach((link) => {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  if (greetTexts.length > 1 && !prefersReducedMotion) {
    let activeGreetingIndex = 0;

    window.setInterval(function () {
      greetTexts[activeGreetingIndex].classList.remove("greet-visible");
      activeGreetingIndex = (activeGreetingIndex + 1) % greetTexts.length;
      greetTexts[activeGreetingIndex].classList.add("greet-visible");
    }, 1600);
  }

  sections.forEach((section) => section.classList.add("reveal-ready"));

  if (!sections.length) {
    return;
  }

  const visibilityMap = new Map(sections.map((section) => [section.id, 0]));
  const revealedSections = new Set();

  const setActiveLink = function (sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === "#" + sectionId;
      link.classList.toggle("is-active", isActive);
    });
  };

  const updateActiveLink = function () {
    if (!navLinks.length) {
      return;
    }

    let activeSectionId = sections[0].id;
    let highestRatio = 0;

    visibilityMap.forEach((ratio, sectionId) => {
      if (ratio >= highestRatio) {
        highestRatio = ratio;
        activeSectionId = sectionId;
      }
    });

    setActiveLink(activeSectionId);
  };

  const revealSection = function (section) {
    if (revealedSections.has(section.id)) {
      return;
    }

    revealedSections.add(section.id);

    if (prefersReducedMotion) {
      section.classList.add("is-visible");
      return;
    }

    // Wait for the prepared hidden state to paint before flipping visible.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        section.classList.add("is-visible");
      });
    });
  };

  if (typeof window.IntersectionObserver !== "function") {
    sections.forEach((section) => revealSection(section));
    if (navLinks.length) {
      setActiveLink(sections[0].id);
    }
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !revealedSections.has(entry.target.id)) {
          revealSection(entry.target);
          observer.unobserve(entry.target);
        }

        visibilityMap.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      updateActiveLink();
    },
    {
      threshold: [0, 0.04, 0.12, 0.24, 0.4],
      rootMargin: "0px 0px -6% 0px"
    }
  );

  sections.forEach((section) => observer.observe(section));

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      closeMenu();
      setActiveLink(targetId);
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
      window.history.replaceState(null, "", "#" + targetId);
    });
  });

  const initialHash = window.location.hash.replace("#", "");
  if (navLinks.length && initialHash && document.getElementById(initialHash)) {
    setActiveLink(initialHash);
  } else if (navLinks.length) {
    setActiveLink(sections[0].id);
  }
});
