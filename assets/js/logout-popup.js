document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".logout");
  const popup = document.getElementById("logout-popup");
  const confirmBtn = document.getElementById("confirm-logout");
  const cancelBtn = document.getElementById("cancel-logout");

  if (!logoutBtn || !popup) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Obtener posición del botón
    const rect = logoutBtn.getBoundingClientRect();

    // Posicionar popup al lado derecho del botón
    popup.style.top = `${rect.top + window.scrollY}px`;
    popup.style.left = `${rect.right + 10}px`;

    popup.classList.remove("hidden");
    popup.classList.add("show");
  });

  confirmBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    window.location.href = "/logout";
  });

  cancelBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  // Cerrar si se hace clic fuera del popup
  document.addEventListener("click", (e) => {
    if (!popup.contains(e.target) && e.target !== logoutBtn) {
      popup.classList.add("hidden");
    }
  });
});
