document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("page-loaded");

  const sections = Array.from(document.querySelectorAll(".reveal-section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));

  if (!sections.length || !navLinks.length) {
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

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !revealedSections.has(entry.target.id)) {
          revealedSections.add(entry.target.id);

          // Delay the class flip until after paint so mobile browsers animate
          // the transition instead of snapping straight to the visible state.
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              entry.target.classList.add("is-visible");
            });
          });

          observer.unobserve(entry.target);
        }

        visibilityMap.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      updateActiveLink();
    },
    {
      threshold: [0.08, 0.18, 0.32, 0.48],
      rootMargin: "0px 0px -12% 0px"
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
  if (initialHash && document.getElementById(initialHash)) {
    setActiveLink(initialHash);
  } else {
    setActiveLink(sections[0].id);
  }
});
