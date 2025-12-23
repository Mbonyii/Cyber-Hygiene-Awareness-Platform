// Highlight the active nav link based on current path.
(function markActiveLink() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll("nav a.nav-link").forEach((link) => {
    const linkPath = link.getAttribute("href") || "";
    if (linkPath === path) {
      link.classList.add("active");
    }
  });
})();

