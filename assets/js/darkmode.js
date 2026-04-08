document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("darkModeToggle");
  if (!toggle) {
    return;
  }

  const saved = localStorage.getItem("darkMode");
  let isDark = saved === "true";

  if (saved === null) {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  document.documentElement.classList.toggle("dark-mode", isDark);
  toggle.checked = isDark;

  toggle.addEventListener("change", function () {
    const isChecked = toggle.checked;
    document.documentElement.classList.toggle("dark-mode", isChecked);
    localStorage.setItem("darkMode", isChecked);
  });
});
