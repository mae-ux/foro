const menuBtn = document.getElementById("menu-btn");
const navbar = document.querySelector(".navbar");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    navbar.classList.toggle("show");
  });
}
