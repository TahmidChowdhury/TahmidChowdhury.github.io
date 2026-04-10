document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("page-loaded");

  const sections = Array.from(document.querySelectorAll(".reveal-section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));

  sections.forEach((section) => section.classList.add("reveal-ready"));

  if (!sections.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
