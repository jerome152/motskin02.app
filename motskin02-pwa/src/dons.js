// motskin02-pwa/functions/dons.js
//
// Onglet « Mes dons » : lit le Google Sheet des dons et renvoie UNIQUEMENT
// les lignes du fidèle connecté (identité vérifiée via son jeton Firebase Auth).
// Les e-mails listés dans DONS_ADMIN_EMAILS reçoivent en plus la vue admin globale.
//
// Structure du sheet (données à partir de la ligne 2, premier onglet) :
//   A Date | B Événement | C Mail | D Promesse de don | E Règlement | F Réf. Cardcom
//
// Le sheet est lu via un script Google Apps Script attaché au sheet (voir Code.gs),
// protégé par un secret partagé.
//
// Variables d'environnement Netlify :
//   DONS_SCRIPT_URL      URL de l'application Web Apps Script (se termine par /exec)
//   DONS_SCRIPT_SECRET   secret généré par initialiserSecret() dans Apps Script
//   DONS_ADMIN_EMAILS    e-mails admin séparés par des virgules (optionnel)

const crypto = require("crypto");

const FIREBASE_PROJECT_ID = "motskin02";
const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let certsCache = { certs: null, exp: 0 };

// ─── Utilitaires base64url ───────────────────────────────────────────────────
function b64urlDecode(str) {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

// ─── Vérification du jeton Firebase (sans dépendance externe) ───────────────
async function getFirebaseCerts() {
  if (certsCache.certs && Date.now() < certsCache.exp) return certsCache.certs;
  const r = await fetch(FIREBASE_CERTS_URL);
  if (!r.ok) throw new Error("Impossible de récupérer les certificats Firebase");
  const certs = await r.json();
  const maxAge = (r.headers.get("cache-control") || "").match(/max-age=(\d+)/);
  certsCache = { certs, exp: Date.now() + (maxAge ? Number(maxAge[1]) * 1000 : 3600 * 1000) };
  return certs;
}

async function verifyFirebaseToken(idToken) {
  const parts = String(idToken || "").split(".");
  if (parts.length !== 3) throw new Error("Jeton mal formé");

  const header = JSON.parse(b64urlDecode(parts[0]).toString("utf8"));
  const payload = JSON.parse(b64urlDecode(parts[1]).toString("utf8"));
  if (header.alg !== "RS256" || !header.kid) throw new Error("Algorithme invalide");

  const certs = await getFirebaseCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error("Certificat inconnu");

  const valid = crypto.verify(
    "sha256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    crypto.createPublicKey(cert),
    b64urlDecode(parts[2])
  );
  if (!valid) throw new Error("Signature invalide");

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error("Audience invalide");
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) throw new Error("Émetteur invalide");
  if (!payload.sub) throw new Error("Utilisateur manquant");
  if (payload.exp < now) throw new Error("Jeton expiré");
  if (payload.iat > now + 300) throw new Error("Jeton émis dans le futur");
  if (!payload.email) throw new Error("E-mail manquant");

  return String(payload.email).trim().toLowerCase();
}

// ─── Lecture et normalisation des lignes ─────────────────────────────────────
function parseAmount(v) {
  if (typeof v === "number") return v;
  if (v === null || v === undefined) return 0;
  let s = String(v).replace(/[^\d.,-]/g, "");
  if (!s) return 0;
  if (s.includes(",") && !s.includes(".")) {
    // "1,500" = milliers ; "12,5" = décimale
    s = /,\d{3}$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

const pad2 = (n) => String(n).padStart(2, "0");

function parseDateCell(raw) {
  // Cellule date Google Sheets → numéro de série (jours depuis le 30/12/1899)
  if (typeof raw === "number") {
    const ms = Math.round((raw - 25569) * 86400000);
    const d = new Date(ms);
    return { date: `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`, key: ms };
  }
  const s = String(raw ?? "").trim();
  let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (m) {
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    return { date: s, key: Date.UTC(y, Number(m[2]) - 1, Number(m[1])) };
  }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return { date: s, key: Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) };
  return { date: s, key: 0 };
}

async function readSheetRows() {
  const url = (process.env.DONS_SCRIPT_URL || "").trim();
  const secret = (process.env.DONS_SCRIPT_SECRET || "").trim();
  if (!url || !secret) throw new Error("DONS_SCRIPT_URL / DONS_SCRIPT_SECRET non configurés");

  // Apps Script répond par une redirection que fetch suit automatiquement.
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret, action: "rows" }),
  });
  const text = await r.text();
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error(`Réponse Apps Script illisible (HTTP ${r.status}) : ${text.slice(0, 120)}`);
  }
  if (j.error) throw new Error(`Apps Script : ${j.error}`);

  return (j.values || [])
    .map((cells, i) => {
      const { date, key } = parseDateCell(cells[0]);
      return {
        row: i + 2,
        key,
        date,
        evenement: String(cells[1] ?? "").trim(),
        email: String(cells[2] ?? "").trim().toLowerCase(),
        promesse: parseAmount(cells[3]),
        reglement: parseAmount(cells[4]),
      };
    })
    .filter((r) => r.email && (r.promesse || r.reglement))
    .sort((a, b) => b.key - a.key || b.row - a.row); // plus récent en premier
}

const round2 = (n) => Math.round(n * 100) / 100;

// ─── Handler ─────────────────────────────────────────────────────────────────
exports.handler = async function (event) {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  let email;
  try {
    email = await verifyFirebaseToken(authHeader.replace(/^Bearer\s+/i, ""));
  } catch (e) {
    console.warn("dons: accès refusé -", e.message);
    return { statusCode: 401, headers, body: JSON.stringify({ error: "unauthorized" }) };
  }

  try {
    const rows = await readSheetRows();

    const mine = rows.filter((r) => r.email === email);
    const promesses = mine.filter((r) => r.promesse).map((r) => ({ date: r.date, evenement: r.evenement, montant: r.promesse }));
    const reglements = mine.filter((r) => r.reglement).map((r) => ({ date: r.date, evenement: r.evenement, montant: r.reglement }));
    const totalPromesses = round2(promesses.reduce((s, x) => s + x.montant, 0));
    const totalReglements = round2(reglements.reduce((s, x) => s + x.montant, 0));

    const adminEmails = (process.env.DONS_ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = adminEmails.includes(email);

    const result = {
      email,
      isAdmin,
      totalPromesses,
      totalReglements,
      enAttente: round2(totalPromesses - totalReglements),
      promesses,
      reglements,
    };

    if (isAdmin) {
      const byEmail = {};
      for (const r of rows) {
        const f = (byEmail[r.email] = byEmail[r.email] || { email: r.email, promesses: 0, reglements: 0, lignes: [] });
        f.promesses += r.promesse;
        f.reglements += r.reglement;
        f.lignes.push({ date: r.date, evenement: r.evenement, promesse: r.promesse, reglement: r.reglement });
      }
      const fideles = Object.values(byEmail)
        .map((f) => ({ ...f, promesses: round2(f.promesses), reglements: round2(f.reglements), solde: round2(f.promesses - f.reglements) }))
        .sort((a, b) => b.solde - a.solde || a.email.localeCompare(b.email));
      const totP = round2(fideles.reduce((s, f) => s + f.promesses, 0));
      const totR = round2(fideles.reduce((s, f) => s + f.reglements, 0));
      result.admin = { totalPromesses: totP, totalReglements: totR, enAttente: round2(totP - totR), fideles };
    }

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (e) {
    console.error("dons: erreur -", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "server" }) };
  }
};

