document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("darkModeToggle");
  
    // Check for saved user preference
    const saved = localStorage.getItem("darkMode");
    let isDark = saved === "true";
  
    // If no saved preference, use system setting
    if (saved === null) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  
    // Apply mode to documentElement to match inline script
    document.documentElement.classList.toggle("dark-mode", isDark);
    toggle.checked = isDark;
  
    // Handle toggle changes
    toggle.addEventListener("change", function () {
      const isChecked = toggle.checked;
      document.documentElement.classList.toggle("dark-mode", isChecked);
      localStorage.setItem("darkMode", isChecked);
    });
  });
