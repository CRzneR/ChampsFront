// client/js/api.js

import { updateDashboard } from "./dashboard.js";

// ===============================================================
// ⭐ Dynamische API-URL – funktioniert lokal (localhost) & deployed (Vercel + Render)
// ===============================================================

const API_BASE_URL = (() => {
  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  // 💻 LOKAL → Express Backend auf 5001
  if (isLocalhost) {
    return "http://localhost:5001/api";
  }

  // 🌐 PROD → Render Backend
  return "https://champsback.onrender.com/api";
})();

// ===============================================================
// Globale Variablen
// ===============================================================

let currentTournament = null;
let currentUser = null;

// ===============================================================
// Turnier erstellen
// ===============================================================
export async function createTournament(tournamentData) {
  const token = localStorage.getItem("token");

  // 1) Token prüfen
  if (!token || token === "null" || token === "undefined") {
    throw new Error("Nicht eingeloggt: Token fehlt. Bitte neu einloggen.");
  }

  // 2) JWT-Heuristik (optional, aber super hilfreich)
  if (!token.startsWith("eyJ")) {
    throw new Error("Token sieht nicht wie ein JWT aus. Bitte neu einloggen.");
  }

  const response = await fetch(`${API_BASE_URL}/tournaments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tournamentData),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let msg = "Fehler beim Erstellen des Turniers";
    try {
      const json = JSON.parse(text);
      msg = json.message || msg;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  const tournament = await response.json();
  currentTournament = tournament;
  window.tournamentData = tournament;
  localStorage.setItem("currentTournamentId", tournament._id);
  return tournament;
}

// ===============================================================
// Turnier laden
// ===============================================================
export async function loadTournament(tournamentId) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Fehler beim Laden des Turniers");

    const tournament = await response.json();
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
    return tournament;
  } catch (error) {
    console.error("❌ Fehler beim Turnierladen:", error);
    throw error;
  }
}

// ===============================================================
// Alle Turniere des Users laden
// ===============================================================
export async function loadUserTournaments() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Fehler beim Laden der Turniere");

    return await response.json();
  } catch (error) {
    console.error("❌ Fehler beim Laden der Turnierliste:", error);
    return [];
  }
}

// ===============================================================
// Match Ergebnis speichern
// ===============================================================
export async function saveMatchResult(tournamentId, matchData) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) throw new Error("Fehler beim Speichern des Matches");

    const tournament = await response.json();
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
    return tournament;
  } catch (error) {
    console.error("❌ Fehler beim Match-Speichern:", error);
    throw error;
  }
}

// ===============================================================
// Playoff-Match speichern
// ===============================================================
export async function savePlayoffMatchResult(tournamentId, matchData) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/playoffs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) throw new Error("Fehler beim Speichern des Playoff-Matches");

    const tournament = await response.json();
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
    return tournament;
  } catch (error) {
    console.error("❌ Fehler beim Playoff-Speichern:", error);
    throw error;
  }
}

// ===============================================================
// App initialisieren
// ===============================================================
export async function initializeApp() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    currentUser = user;

    try {
      const tournaments = await loadUserTournaments();

      if (tournaments.length > 0) {
        let id = localStorage.getItem("currentTournamentId");
        if (!id) id = tournaments[0]._id;

        currentTournament = await loadTournament(id);
      } else {
        currentTournament = null;
        window.tournamentData = null;
        localStorage.removeItem("currentTournamentId");
      }

      updateDashboard();
    } catch (error) {
      console.error("❌ Fehler beim Initialisieren:", error);
    }
  }
}

// ===============================================================
// Refresh
// ===============================================================
export async function refreshTournament() {
  const id = localStorage.getItem("currentTournamentId");
  if (!id) return null;
  return await loadTournament(id);
}

// Getter
export function getCurrentTournament() {
  return currentTournament;
}

export function getCurrentUser() {
  return currentUser;
}
