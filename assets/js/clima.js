const climaSpan = document.getElementById("clima");
const modoBtn = document.getElementById("modo-btn");
const themeLink = document.getElementById("theme-style");

// === 1. OBTENER COORDENADAS ===
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // === 2. LLAMAR A LA API DEL CLIMA ===
     
      const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

      fetch(API_URL)
        .then(response => response.json())
        .then(data => {
          if (data.current_weather) {
            const temp = data.current_weather.temperature;
            const weatherCode = data.current_weather.weathercode;

            // Opcional: puedes personalizar el icono según el código de clima
            const icono = getWeatherIcon(weatherCode);
            climaSpan.textContent = `${icono} ${temp}°C`;
          } else {
            climaSpan.textContent = "No disponible";
          }
        })
        .catch(() => {
          climaSpan.textContent = "Error al cargar clima";
        });
    },
    (error) => {
      climaSpan.textContent = "Ubicación denegada";
      console.error("Error obteniendo ubicación:", error);
    }
  );
} else {
  climaSpan.textContent = "Sin soporte de ubicación";
}

// === 3. FUNCIÓN PARA ICONOS SEGÚN CLIMA ===
function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 61, 80].includes(code)) return "🌦️";
  if ([63, 65, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

// === 4. CAMBIO DE MODO DÍA/NOCHE ===
let modoNoche = false;
modoBtn.addEventListener("click", () => {
  modoNoche = !modoNoche;
  if (modoNoche) {
    themeLink.href = "css/dark.css";
    modoBtn.textContent = "🌞";
  } else {
    themeLink.href = "css/login.css";
    modoBtn.textContent = "🌙";
  }
});
