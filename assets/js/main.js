document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("page-loaded");

  const sections = Array.from(document.querySelectorAll(".reveal-section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));

  if (!sections.length || !navLinks.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const visibilityMap = new Map(sections.map((section) => [section.id, 0]));

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
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }

        visibilityMap.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      updateActiveLink();
    },
    {
      threshold: [0.15, 0.3, 0.45, 0.6],
      rootMargin: "-12% 0px -18% 0px"
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
