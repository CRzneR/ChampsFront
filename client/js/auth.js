class Auth {
  constructor() {
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user"));

    const isLocal = window.location.hostname === "localhost";

    // ✅ Backend-Base-URL (ohne /api/auth)
    this.backendBaseUrl = isLocal ? "http://localhost:5001" : "https://champsback.onrender.com";

    // ✅ Auth API Base
    this.apiBaseUrl = `${this.backendBaseUrl}/api/auth`;
  }

  // Login
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        return { success: true, data };
      }
      return { success: false, message: data.message || "Login fehlgeschlagen" };
    } catch (error) {
      return { success: false, message: "Netzwerkfehler" };
    }
  }

  // Registrierung
  async register(username, email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        return { success: true, data };
      }
      return { success: false, message: data.message || "Registrierung fehlgeschlagen" };
    } catch (error) {
      return { success: false, message: "Netzwerkfehler" };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentTournamentId");
    window.location.href = "/login.html";
  }

  isLoggedIn() {
    return !!this.token;
  }
}

// 🔥 Instance global verfügbar
window.auth = new Auth();
export default window.auth;

export function initAuth() {
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) logoutBtn.addEventListener("click", () => auth.logout());

  const usernameDisplay = document.getElementById("usernameDisplay");
  if (usernameDisplay && auth.user) usernameDisplay.textContent = auth.user.username;
}
