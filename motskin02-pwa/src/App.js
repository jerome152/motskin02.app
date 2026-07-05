
import React, { useState, useEffect } from "react";
// ─── Firebase ────────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "motskin02.firebaseapp.com",
  projectId: "motskin02",
  storageBucket: "motskin02.firebasestorage.app",
  messagingSenderId: "761597022549",
  appId: "1:761597022549:web:4e20e61a1dd271682e5fdc"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);



import logoSrc from "./logo.jpg";
const LOGO_SRC = logoSrc;
import { PRIERES } from "./prieres-data";
import { TEHILIM_JOUR } from "./tehilim-data";

const HEBCAL_API = "https://www.hebcal.com/shabbat?cfg=json&geonameid=293807&b=20&M=on";

// Colors from logo: sky blue gradient, dark navy, black
const C = {
  skyBlue: "#5bbfea",
  skyBlueLight: "#a8ddf4",
  navy: "#1a2e52",
  navyDark: "#0d1b30",
  black: "#1a1a1a",
  white: "#ffffff",
  gray: "#6b7280",
  lightGray: "#f0f4f8",
  danger: "#dc2626",
  text: "#1a1a1a",
};

function addMinutes(timeStr, mins, round5 = false) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  let total = h * 60 + m + mins;
  if (round5) total = Math.round(total / 5) * 5;
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60).toString().padStart(2, "0");
  const mm = (((total % 60) + 60) % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatTime(isoOrTime) {
  if (!isoOrTime) return "";
  if (isoOrTime.includes("T")) {
    const d = new Date(isoOrTime);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return isoOrTime;
}

// Fetches the real Hebrew calendar date (e.g. "כ״ב בְּסִיוָן תשפ״ו") for a given JS Date
async function fetchHebrewDate(date) {
  try {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const r = await fetch(`https://www.hebcal.com/converter?cfg=json&gy=${yyyy}&gm=${mm}&gd=${dd}&g2h=1`);
    const j = await r.json();
    return j.hebrew || "";
  } catch {
    return "";
  }
}

const T = {
  fr: {
    appName: "Beth Haknesset Motskin02",
    shabbatFetes: "Chabbat & Fêtes",
    activites: "Activités",
    location: "Location",
    reglements: "Règlements",
    admin: "Admin",
    login: "Connexion",
    logout: "Déconnexion",
    password: "Mot de passe",
    connect: "Se connecter",
    wrongPwd: "Mot de passe incorrect",
    addEvent: "Ajouter un événement",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    moveUp: "↑",
    moveDown: "↓",
    shabbat: "Chabbat",
    fete: "Fête",
    nom: "Nom",
    allumage: "Allumage",
    minhaBefore: "Minha (avant entrée)",
    chakharit: "Chakharit Hodou",
    paracha: "Paracha",
    kiddouch: "Kiddouch",
    chiour: "Chiour Rabbi Yaacov",
    minhaAfternoon: "Minha (après-midi)",
    seoudaChl: "Seouda Chlichit",
    arvit: "Arvit Motsa'ch",
    birkatHalevana: "Birkat HaLevana",
    prochaineDate: "Prochaine date",
    titre: "Titre",
    date: "Date",
    heure: "Heure",
    public: "Public",
    tarif: "Tarif",
    description: "Description",
    contact: "Contacter sur WhatsApp",
    paiementCB: "Paiement par CB",
    reglementText: "Pour régler votre cotisation ou un événement :",
    loadingShabbat: "Chargement des horaires...",
    chooseType: "Type",
    showBirkat: "Afficher Birkat HaLevana",
    showProchaine: "Afficher Prochaine date",
    entree: "Entrée (allumage)",
    sortie: "Sortie (Havdala)",
    uploadPhoto: "Télécharger une photo",
    langue: "Langue",
    annonces: "Annonces",
    addAnnonce: "Publier une annonce",
    prenom: "Prénom",
    nom2: "Nom",
    texte: "Message",
    prenomReq: "Prénom obligatoire",
    nomReq: "Nom obligatoire",
    texteReq: "Message obligatoire",
    annonceAdded: "Annonce publiée !",
    pensee: "Pensée du jour",
    miniEtude: "Mini étude",
    programme: "Semaine",
    penseeDuJour: "Pensée du jour",
    ajouterPensee: "Ajouter une pensée",
    gererPensees: "Gérer les pensées",
    source: "Source / Référence (français)",
    sourceHe: "Source / Référence (hébreu)",
    contenuPensee: "Texte de la pensée (français)",
    contenuPenseeHe: "Texte de la pensée (hébreu, optionnel)",
    semaineDu: "Semaine du",
    partager: "Partager",
    ajouterCreneau: "Ajouter un créneau",
    jourSemaine: "Jour",
    intitule: "Intitulé",
    horaire: "Horaire",
    lieuOptionnel: "Lieu (optionnel)",
    aucunProgramme: "Aucun programme cette semaine pour le moment.",
    dimanche: "Dimanche", lundi: "Lundi", mardi: "Mardi", mercredi: "Mercredi", jeudi: "Jeudi", vendredi: "Vendredi", samedi: "Samedi",
  },
  he: {
    appName: "בית הכנסת מוצקין 02",
    shabbatFetes: "שבת וחגים",
    activites: "פעילויות",
    location: "השכרה",
    reglements: "תשלומים",
    admin: "מנהל",
    login: "כניסה",
    logout: "יציאה",
    password: "סיסמה",
    connect: "התחבר",
    wrongPwd: "סיסמה שגויה",
    addEvent: "הוסף אירוע",
    save: "שמור",
    cancel: "ביטול",
    delete: "מחק",
    edit: "ערוך",
    moveUp: "↑",
    moveDown: "↓",
    shabbat: "שבת",
    fete: "חג",
    nom: "שם",
    allumage: "הדלקת נרות",
    minhaBefore: "מנחה (לפני כניסה)",
    chakharit: "שחרית הודו",
    paracha: "קריאת הפרשה",
    kiddouch: "קידוש",
    chiour: "שיעור רב יעקב",
    minhaAfternoon: "מנחה (אחה\"צ)",
    seoudaChl: "סעודה שלישית",
    arvit: "ערבית מוצ\"ש",
    birkatHalevana: "ברכת הלבנה",
    prochaineDate: "תאריך הבא",
    titre: "כותרת",
    date: "תאריך",
    heure: "שעה",
    public: "קהל",
    tarif: "מחיר",
    description: "תיאור",
    contact: "צור קשר בוואטסאפ",
    paiementCB: "תשלום בכרטיס אשראי",
    reglementText: "לתשלום דמי חבר או אירוע:",
    loadingShabbat: "טוען זמנים...",
    chooseType: "סוג",
    showBirkat: "הצג ברכת הלבנה",
    showProchaine: "הצג תאריך הבא",
    entree: "כניסה",
    sortie: "יציאה",
    uploadPhoto: "העלה תמונה",
    langue: "שפה",
    annonces: "הודעות",
    addAnnonce: "פרסם הודעה",
    prenom: "שם פרטי",
    nom2: "שם משפחה",
    texte: "הודעה",
    prenomReq: "שם פרטי חובה",
    nomReq: "שם משפחה חובה",
    texteReq: "הודעה חובה",
    annonceAdded: "ההודעה פורסמה!",
    pensee: "מחשבת היום",
    miniEtude: "לימוד יומי",
    programme: "שבוע",
    penseeDuJour: "מחשבת היום",
    ajouterPensee: "הוסף מחשבה",
    gererPensees: "ניהול מחשבות",
    source: "מקור (צרפתית)",
    sourceHe: "מקור (עברית)",
    contenuPensee: "טקסט המחשבה (צרפתית)",
    contenuPenseeHe: "טקסט המחשבה (עברית, אופציונלי)",
    semaineDu: "שבוע מתאריך",
    partager: "שתף",
    ajouterCreneau: "הוסף שעה",
    jourSemaine: "יום",
    intitule: "כותרת",
    horaire: "שעה",
    lieuOptionnel: "מקום (אופציונלי)",
    aucunProgramme: "אין תוכנית לשבוע זה כרגע.",
    dimanche: "ראשון", lundi: "שני", mardi: "שלישי", mercredi: "רביעי", jeudi: "חמישי", vendredi: "שישי", samedi: "שבת",
  },
};

const KEYS = { shabbatEvents: "m02_shabbat", activities: "m02_activities", locations: "m02_locations", annonces: "m02_annonces", pensees: "m02_pensees", programme: "m02_programme" };

// Default rotating thoughts (used if admin hasn't added custom ones, or mixed in with them)
const DEFAULT_PENSEES = [
  { texte: "Celui qui sauve une vie sauve un monde entier.", source: "Talmud, Sanhédrin 37a", texteHe: "כל המקיים נפש אחת, מעלה עליו כאילו קיים עולם מלא.", sourceHe: "תלמוד, סנהדרין ל״ז א" },
  { texte: "Tout commencement est difficile.", source: "Mekhilta, Yitro", texteHe: "כל התחלות קשות.", sourceHe: "מכילתא, יתרו" },
  { texte: "Qui est riche ? Celui qui se réjouit de son sort.", source: "Pirké Avot 4:1", texteHe: "איזהו עשיר? השמח בחלקו.", sourceHe: "פרקי אבות ד׳ א׳" },
  { texte: "N'aie pas peur, fils de Jacob, lève-toi et agis.", source: "Inspiré de Béréchit", texteHe: "אל תירא, בן יעקב, קום ועשה.", sourceHe: "בהשראת בראשית" },
  { texte: "Là où il n'y a pas de farine, il n'y a pas de Torah ; là où il n'y a pas de Torah, il n'y a pas de farine.", source: "Pirké Avot 3:21", texteHe: "אם אין קמח, אין תורה; אם אין תורה, אין קמח.", sourceHe: "פרקי אבות ג׳ כ״א" },
  { texte: "Ne juge pas ton prochain avant de t'être mis à sa place.", source: "Pirké Avot 2:4", texteHe: "אל תדין את חברך עד שתגיע למקומו.", sourceHe: "פרקי אבות ב׳ ד׳" },
  { texte: "Toute la Torah repose sur la paix.", source: "Michna, Guittin 59b", texteHe: "כל התורה כולה לשם שלום.", sourceHe: "משנה, גיטין נ״ט ב" },
  { texte: "Si je ne suis pas pour moi, qui le sera ? Si je ne suis que pour moi, que suis-je ? Et si pas maintenant, quand ?", source: "Hillel, Pirké Avot 1:14", texteHe: "אם אין אני לי, מי לי? וכשאני לעצמי, מה אני? ואם לא עכשיו, אימתי?", sourceHe: "הלל, פרקי אבות א׳ י״ד" },
  { texte: "La modestie est la porte d'entrée de toute sagesse.", source: "Pensée juive traditionnelle", texteHe: "הענווה היא שער לכל חכמה.", sourceHe: "מחשבה יהודית מסורתית" },
  { texte: "Un sourire vaut plus que mille mots de réconfort.", source: "Tradition orale", texteHe: "חיוך שווה יותר מאלף מילות ניחומים.", sourceHe: "מסורת בעל פה" },
];

async function loadData(collectionName) {
  // Get local data first as fallback
  let localData = [];
  try {
    const local = localStorage.getItem(collectionName);
    if (local) localData = JSON.parse(local);
  } catch {}

  // Load from Firebase
  try {
    const snap = await getDocs(collection(db, collectionName));
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => {
      if (a._order !== undefined && b._order !== undefined) return a._order - b._order;
      return 0;
    });
    try { localStorage.setItem(collectionName, JSON.stringify(data)); } catch {}
    return data;
  } catch(e) {
    console.error("Firebase load error:", e);
    return localData;
  }
}

async function saveItem(collectionName, item, order) {
  try {
    await setDoc(doc(db, collectionName, item.id), { ...item, _order: order });
  } catch(e) { console.error(e); }
}

async function deleteItem(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch(e) { console.error(e); }
}

// Compress image to stay safely under Firestore's 1MB document limit
async function compressImage(base64Data, maxWidth = 700, quality = 0.6) {
  if (!base64Data || !base64Data.startsWith("data:image")) return base64Data;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      let result = canvas.toDataURL("image/jpeg", quality);
      // If still too large, compress further in steps
      let q = quality;
      while (result.length > 350000 && q > 0.25) {
        q -= 0.1;
        result = canvas.toDataURL("image/jpeg", q);
      }
      resolve(result);
    };
    img.onerror = () => resolve(base64Data);
    img.src = base64Data;
  });
}

async function saveData(collectionName, dataArray) {
  // Save to localStorage immediately
  try { localStorage.setItem(collectionName, JSON.stringify(dataArray)); } catch {}
  // Save to Firestore, preserving each item's own _order if already set
  const results = await Promise.allSettled(dataArray.map((item) =>
    setDoc(doc(db, collectionName, item.id), { ...item, _order: item._order ?? 0 })
  ));
  const failed = results.filter(r => r.status === "rejected");
  if (failed.length > 0) {
    console.error("Firebase save errors:", failed.map(f => f.reason));
    alert("⚠️ Certaines données n'ont pas pu être sauvegardées (photo trop volumineuse ?). Essayez avec une photo plus légère.");
  }
}

async function notifyUsers(title, message) {
  try {
    await fetch("/.netlify/functions/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message }),
    });
  } catch(e) { console.error("Notification error:", e); }
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f0f4f8; color: #1a1a1a; }
  button { cursor: pointer; border: none; outline: none; font-family: inherit; }
  input, textarea, select { font-family: inherit; }
`;

function Header({ lang, setLang, isAdmin, onAdminClick, t }) {
  return (
    <header style={{
      background: `linear-gradient(160deg, #5bbfea 0%, #3a9cc8 50%, #1a2e52 100%)`,
      padding: "10px 14px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={LOGO_SRC} alt="Motskin02" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", border: "2px solid rgba(255,255,255,0.6)" }} />
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 15, lineHeight: 1.2, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
            {t.appName}
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>Ra'anana, Israel 🇮🇱</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        <button onClick={() => setLang(l => l === "fr" ? "he" : "fr")}
          style={{ background: "rgba(255,255,255,0.2)", color: C.white, border: "1px solid rgba(255,255,255,0.5)", borderRadius: 20, padding: "4px 10px", fontSize: 12 }}>
          {lang === "fr" ? "עברית" : "Français"}
        </button>
        {isAdmin && (
          <button onClick={onAdminClick}
            style={{ background: C.white, color: C.navy, border: "1px solid rgba(255,255,255,0.5)", borderRadius: 20, padding: "4px 10px", fontSize: 12 }}>
            {t.logout}
          </button>
        )}
      </div>
    </header>
  );
}

function TabBar({ tab, setTab, t, lang }) {
  const tabs = [
    { key: "pensee", icon: "💭", label: lang === "he" ? t.miniEtude : "Mini étude" },
    { key: "programme", icon: "📋", label: t.programme },
    { key: "shabbat", icon: "🇮🇱", label: t.shabbatFetes },
    { key: "activites", icon: "📅", label: t.activites },
    { key: "annonces", icon: "📢", label: t.annonces },
    { key: "boiteaoutils", icon: "📔", label: lang === "he" ? "סידור" : "Sidour" },
    { key: "location", icon: "🏛️", label: t.location },
    { key: "reglements", icon: "💳", label: t.reglements },
  ];

  const scrollRef = React.useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  function updateFades() {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateFades();
    const el = scrollRef.current;
    if (!el) return;
    const onResize = () => updateFades();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100 }}>
      <nav
        ref={scrollRef}
        onScroll={updateFades}
        style={{ background: C.white, borderTop: `2px solid ${C.skyBlue}`, display: "flex", overflowX: "auto", boxShadow: "0 -2px 10px rgba(0,0,0,0.1)" }}
      >
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} style={{
            flex: "1 0 12.5%", minWidth: 58, padding: "6px 2px 8px",
            background: tab === tb.key ? `linear-gradient(180deg, ${C.navy} 0%, #1e3d6e 100%)` : "transparent",
            color: tab === tb.key ? C.skyBlueLight : C.gray,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1, transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 16 }}>{tb.icon}</span>
            <span style={{ fontSize: 7.5, fontWeight: 600, textAlign: "center", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{tb.label}</span>
          </button>
        ))}
      </nav>

      {/* Fade + animated chevron hints showing more tabs are reachable by scrolling */}
      {showRightFade && (
        <div style={{ position: "absolute", top: 2, bottom: 0, right: 0, width: 34, pointerEvents: "none", background: "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 70%)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 2 }}>
          <span style={{ color: C.skyBlue, fontSize: 14, animation: "tabHintPulse 1.6s ease-in-out infinite" }}>›</span>
        </div>
      )}
      {showLeftFade && (
        <div style={{ position: "absolute", top: 2, bottom: 0, left: 0, width: 34, pointerEvents: "none", background: "linear-gradient(to left, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 70%)", display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 2 }}>
          <span style={{ color: C.skyBlue, fontSize: 14, animation: "tabHintPulse 1.6s ease-in-out infinite" }}>‹</span>
        </div>
      )}
      <style>{`
        @keyframes tabHintPulse {
          0%, 100% { opacity: 0.35; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}

function AdminModal({ onLogin, onClose, t }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);
  function tryLogin() {
    if (pwd === "motskin02") { onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 16, padding: 28, width: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src={LOGO_SRC} alt="logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover" }} />
          <h2 style={{ color: C.navy, marginTop: 10, fontSize: 18 }}>{t.admin}</h2>
        </div>
        <input type="password" placeholder={t.password} value={pwd}
          onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && tryLogin()}
          style={{ width: "100%", padding: "10px 14px", border: `2px solid ${err ? C.danger : C.skyBlue}`, borderRadius: 8, fontSize: 15, marginBottom: 12, outline: "none" }} />
        {err && <div style={{ color: C.danger, fontSize: 12, marginBottom: 8 }}>{t.wrongPwd}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, background: C.lightGray, color: C.gray, borderRadius: 8, fontSize: 14 }}>{t.cancel}</button>
          <button onClick={tryLogin} style={{ flex: 2, padding: 10, background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, color: C.skyBlueLight, borderRadius: 8, fontSize: 14, fontWeight: 600 }}>{t.connect}</button>
        </div>
      </div>
    </div>
  );
}

const lbl = { display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 4, marginTop: 8 };
const inp = { display: "block", width: "100%", padding: "9px 12px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, marginBottom: 4, outline: "none" };
const moveBtn = { background: C.lightGray, color: C.navy, borderRadius: 6, padding: "4px 10px", fontSize: 14 };

function Chip({ children, color }) {
  return <span style={{ background: color || `${C.skyBlue}22`, color: C.navy, padding: "3px 9px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{children}</span>;
}

function Row({ label, value, bold }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f0f4f8" }}>
      <span style={{ color: C.gray, fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, fontSize: 13, color: C.navy }}>{value}</span>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", border: `1px solid ${C.skyBlue}33`, ...style }}>
      {children}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 300, overflowY: "auto" }}>
      <div style={{ background: C.white, margin: "20px 12px", borderRadius: 16, padding: 20 }}>
        {children}
      </div>
    </div>
  );
}

function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ width: "100%", padding: 12, marginBottom: 14, background: `linear-gradient(135deg, ${C.skyBlue}, #3a9cc8)`, color: C.white, borderRadius: 10, fontWeight: 700, fontSize: 15, boxShadow: "0 3px 10px rgba(91,191,234,0.3)" }}>
      + {label}
    </button>
  );
}

function AdminBtns({ onEdit, onDelete, t, onUp, onDown }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      {onUp && <button onClick={onUp} style={moveBtn}>{t.moveUp}</button>}
      {onDown && <button onClick={onDown} style={moveBtn}>{t.moveDown}</button>}
      <button onClick={onEdit} style={{ background: C.lightGray, color: C.navy, borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>{t.edit}</button>
      <button onClick={onDelete} style={{ background: "#fee2e2", color: C.danger, borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>{t.delete}</button>
    </div>
  );
}

function ModalButtons({ onCancel, onSave, t }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: 12, background: C.lightGray, color: C.gray, borderRadius: 8 }}>{t.cancel}</button>
      <button onClick={onSave} style={{ flex: 2, padding: 12, background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, color: C.skyBlueLight, borderRadius: 8, fontWeight: 700 }}>{t.save}</button>
    </div>
  );
}

function PhotoInput({ photoData, onChange, t }) {
  const [uploading, setUploading] = useState(false);
  function handle(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target.result);
      onChange(compressed);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }
  return (
    <>
      <label style={lbl}>{t.uploadPhoto}</label>
      <input type="file" accept="image/*" onChange={handle} style={{ marginBottom: 8 }} />
      {uploading && <div style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>Compression en cours...</div>}
      {photoData && !uploading && <img src={photoData} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} alt="" />}
    </>
  );
}

// ─── SHABBAT TAB ─────────────────────────────────────────────────────────────
function ShabbatTab({ isAdmin, t, activeTab }) {
  const [events, setEvents] = useState([]);
  const [nextShabbat, setNextShabbat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    setLoading(true);
    loadData(KEYS.shabbatEvents).then(d => { setEvents(d); setLoading(false); });
    fetchNext();
  }, [activeTab]);

  async function fetchNext() {
    try {
      const r = await fetch(HEBCAL_API);
      const j = await r.json();
      const candle = (j.items || []).find(i => i.category === "candles");
      const havdalah = (j.items || []).find(i => i.category === "havdalah");
      if (candle) setNextShabbat({ candle: candle.date, havdalah: havdalah?.date });
    } catch {}
  }

  function blankForm() {
    const c = nextShabbat ? formatTime(nextShabbat.candle) : "19:00";
    const h = nextShabbat ? formatTime(nextShabbat.havdalah) : "20:10";
    return { type: "shabbat", nom: "", photoData: "", entree: c, sortie: h, chakharit: "08:30", paracha: "", kiddouch: "", chiour: "12:00", showChiourBefore: false, chiourBeforeText: "", seoudaText: "", birkat: false, prochaineDate: false, prochaineText: "" };
  }

  function openAdd() { setForm(blankForm()); setEditing(null); setShowForm(true); }
  function openEdit(ev) { setForm({ ...ev }); setEditing(ev.id); setShowForm(true); }

  async function save() {
    const isNew = !editing;
    const base = { ...form, minhaBefore: addMinutes(form.entree, -5, true), minhaAfternoon: addMinutes(form.sortie, -90, true), arvit: addMinutes(form.sortie, -10, true) };
    let updated;
    if (editing) {
      const entry = { ...base, id: editing };
      updated = events.map(e => e.id === editing ? entry : e);
    } else {
      // Nouvel événement : _order=0 pour être en tête, on décale les autres
      const entry = { ...base, id: Date.now().toString(), _order: 0 };
      const shifted = events.map((e, i) => ({ ...e, _order: i + 1 }));
      updated = [entry, ...shifted];
    }
    setEvents(updated);
    await saveData(KEYS.shabbatEvents, updated);
    setShowForm(false);
    if (isNew) {
      const typeLabel = entry.type === "shabbat" ? "Chabbat" : "Fête";
      notifyUsers(`🇮🇱 ${typeLabel} : ${entry.nom}`, "Nouveaux horaires disponibles sur l'application");
    }
  }

  async function del(id) {
    if (!confirm("Supprimer ?")) return;
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    await deleteItem(KEYS.shabbatEvents, id);
    await saveData(KEYS.shabbatEvents, updated);
  }

  async function moveEv(idx, dir) {
    const arr = [...events];
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setEvents(arr);
    await saveData(KEYS.shabbatEvents, arr);
  }

  return (
    <div style={{ padding: "14px 12px 80px" }}>
      {nextShabbat && (
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, borderRadius: 12, padding: "12px 16px", marginBottom: 14, color: C.white }}>
          <div style={{ color: C.skyBlueLight, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>⏰ Prochains horaires • Ra'anana</div>
          <div style={{ fontSize: 13 }}>🕯️ {t.allumage}: <strong style={{ color: "#a8ddf4" }}>{formatTime(nextShabbat.candle)}</strong></div>
          {nextShabbat.havdalah && <div style={{ fontSize: 13 }}>✨ Havdala: <strong style={{ color: "#a8ddf4" }}>{formatTime(nextShabbat.havdalah)}</strong></div>}
        </div>
      )}
      {loading && <div style={{ textAlign: "center", padding: 20, color: C.gray }}>{t.loadingShabbat}</div>}
      {isAdmin && <AddBtn onClick={openAdd} label={t.addEvent} />}
      {events.map(ev => (
        <Card key={ev.id}>
          {ev.photoData && <img src={ev.photoData} alt={ev.nom} style={{ width: "100%", height: 160, objectFit: "cover" }} />}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <span style={{ background: ev.type === "shabbat" ? C.navy : C.skyBlue, color: C.white, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  {ev.type === "shabbat" ? t.shabbat : t.fete}
                </span>
                <div style={{ fontWeight: 800, fontSize: 18, color: C.navy, marginTop: 6 }}>{ev.nom}</div>
              </div>
              {isAdmin && <AdminBtns onUp={() => moveEv(idx, -1)} onDown={() => moveEv(idx, 1)} onEdit={() => openEdit(ev)} onDelete={() => del(ev.id)} t={t} />}
            </div>
            <Row label={`🕯️ ${t.allumage}`} value={ev.entree} />
            <Row label={`🙏 ${t.minhaBefore}`} value={ev.minhaBefore} />
            {ev.showChiourBefore && ev.chiourBeforeText && <Row label={`📚 Chiour`} value={ev.chiourBeforeText} />}
            <Row label={`☀️ ${t.chakharit}`} value={ev.chakharit} />
            <Row label={`📖 ${t.paracha}`} value={ev.paracha} />
            <Row label={`🍷 ${t.kiddouch}`} value={ev.kiddouch} />
            <Row label={`📚 ${t.chiour}`} value={ev.chiour} />
            <Row label={`🌅 ${t.minhaAfternoon}`} value={ev.minhaAfternoon} />
            {ev.type === "shabbat" && <Row label={`🍞 ${t.seoudaChl}`} value={ev.seoudaText} />}
            <Row label={`🌙 ${t.arvit}`} value={ev.arvit} />
            {ev.birkat && <div style={{ background: `${C.skyBlue}22`, padding: "6px 10px", borderRadius: 8, marginTop: 6, fontSize: 12, color: C.navy, fontWeight: 600 }}>🌙 {t.birkatHalevana}</div>}
            {ev.prochaineDate && ev.prochaineText && <Row label={`📅 ${t.prochaineDate}`} value={ev.prochaineText} />}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button onClick={() => shareShabbatEvent(ev, t, nextShabbat)} style={{ background: "#25D366", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "none" }}>
                📤 {t.partager}
              </button>
            </div>
          </div>
        </Card>
      ))}
      {showForm && (
        <Modal>
          <h3 style={{ color: C.navy, marginBottom: 12 }}>{t.addEvent}</h3>
          <label style={lbl}>{t.chooseType}</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
            <option value="shabbat">{t.shabbat}</option>
            <option value="fete">{t.fete}</option>
          </select>
          <label style={lbl}>{t.nom}</label>
          <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inp} />
          <PhotoInput photoData={form.photoData} onChange={d => setForm(f => ({ ...f, photoData: d }))} t={t} />
          <label style={lbl}>{t.entree}</label>
          <input type="time" value={form.entree} onChange={e => setForm(f => ({ ...f, entree: e.target.value }))} style={inp} />
          <label style={lbl}>{t.sortie}</label>
          <input type="time" value={form.sortie} onChange={e => setForm(f => ({ ...f, sortie: e.target.value }))} style={inp} />
          <label style={lbl}>{t.chakharit}</label>
          <input type="time" value={form.chakharit} onChange={e => setForm(f => ({ ...f, chakharit: e.target.value }))} style={inp} />
          <label style={lbl}>{t.paracha}</label>
          <input value={form.paracha} onChange={e => setForm(f => ({ ...f, paracha: e.target.value }))} style={inp} />
          <label style={lbl}>{t.kiddouch}</label>
          <input value={form.kiddouch} onChange={e => setForm(f => ({ ...f, kiddouch: e.target.value }))} style={inp} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
            <input type="checkbox" checked={form.showChiourBefore} onChange={e => setForm(f => ({ ...f, showChiourBefore: e.target.checked }))} id="chiourBefore" />
            <label htmlFor="chiourBefore" style={{ fontSize: 14 }}>📚 Chiour (après Minha)</label>
          </div>
          {form.showChiourBefore && (
            <>
              <label style={lbl}>Texte du Chiour</label>
              <input value={form.chiourBeforeText || ""} onChange={e => setForm(f => ({ ...f, chiourBeforeText: e.target.value }))} style={inp} placeholder="Ex: Rav Yaacov - Pirké Avot" />
            </>
          )}
          <label style={lbl}>{t.chiour}</label>
          <input type="time" value={form.chiour} onChange={e => setForm(f => ({ ...f, chiour: e.target.value }))} style={inp} />
          {form.type === "shabbat" && (
            <>
              <label style={lbl}>{t.seoudaChl}</label>
              <input value={form.seoudaText} onChange={e => setForm(f => ({ ...f, seoudaText: e.target.value }))} style={inp} />
            </>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
            <input type="checkbox" checked={form.birkat} onChange={e => setForm(f => ({ ...f, birkat: e.target.checked }))} id="birkat" />
            <label htmlFor="birkat" style={{ fontSize: 14 }}>{t.showBirkat}</label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
            <input type="checkbox" checked={form.prochaineDate} onChange={e => setForm(f => ({ ...f, prochaineDate: e.target.checked }))} id="proch" />
            <label htmlFor="proch" style={{ fontSize: 14 }}>{t.showProchaine}</label>
          </div>
          {form.prochaineDate && (
            <>
              <label style={lbl}>{t.prochaineDate}</label>
              <input value={form.prochaineText} onChange={e => setForm(f => ({ ...f, prochaineText: e.target.value }))} style={inp} />
            </>
          )}
          <ModalButtons onCancel={() => setShowForm(false)} onSave={save} t={t} />
        </Modal>
      )}
    </div>
  );
}

// ─── ACTIVITES TAB ───────────────────────────────────────────────────────────
function ActivitesTab({ isAdmin, t, activeTab }) {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { loadData(KEYS.activities).then(setEvents); }, [activeTab]);

  async function save() {
    const isNew = !editing;
    const entry = { ...form, id: editing || Date.now().toString() };
    const updated = editing ? events.map(e => e.id === editing ? entry : e) : [entry, ...events];
    setEvents(updated); await saveData(KEYS.activities, updated); setShowForm(false);
    if (isNew) {
      notifyUsers(`📅 Nouvelle activité : ${entry.titre}`, entry.date ? `Le ${entry.date}` : "Découvrez les détails sur l'application");
    }
  }

  async function del(id) {
    if (!confirm("Supprimer ?")) return;
    const u = events.filter(e => e.id !== id); setEvents(u);
    await deleteItem(KEYS.activities, id);
    await saveData(KEYS.activities, u);
  }

  async function move(idx, dir) {
    const arr = [...events]; const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]]; setEvents(arr); await saveData(KEYS.activities, arr);
  }

  return (
    <div style={{ padding: "14px 12px 80px" }}>
      {isAdmin && <AddBtn onClick={() => { setForm({ titre: "", date: "", heure: "", heureFin: "", showHeureFin: false, public: "", tarif: "", description: "", photoData: "" }); setEditing(null); setShowForm(true); }} label={t.addEvent} />}
      {events.map((ev, idx) => (
        <Card key={ev.id}>
          {ev.photoData && <img src={ev.photoData} alt={ev.titre} style={{ width: "100%", height: 160, objectFit: "cover" }} />}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 8 }}>{ev.titre}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
              {ev.date && <Chip>📅 {ev.date}</Chip>}
              {ev.heure && <Chip>🕐 {ev.heure}{ev.showHeureFin && ev.heureFin ? ` → ${ev.heureFin}` : ""}</Chip>}
              {ev.public && <Chip>👥 {ev.public}</Chip>}
              {ev.tarif && <Chip>💰 {ev.tarif}</Chip>}
            </div>
            {ev.description && <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.5, marginTop: 8 }}>{ev.description}</p>}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <button onClick={() => shareEvent(ev)} style={{ background: "#25D366", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "none" }}>
                📤 {t.partager}
              </button>
              {isAdmin && <AdminBtns onUp={() => move(idx, -1)} onDown={() => move(idx, 1)} onEdit={() => { setForm({ ...ev, description: ev.description || "" }); setEditing(ev.id); setShowForm(true); }} onDelete={() => del(ev.id)} t={t} />}
            </div>
          </div>
        </Card>
      ))}
      {showForm && (
        <Modal>
          <h3 style={{ color: C.navy, marginBottom: 12 }}>{t.addEvent}</h3>
          <label style={lbl}>{t.titre}</label>
          <input value={form.titre || ""} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} style={inp} />
          <PhotoInput photoData={form.photoData} onChange={d => setForm(f => ({ ...f, photoData: d }))} t={t} />
          <label style={lbl}>{t.date} <span style={{fontWeight:400, color:"#6b7280", fontSize:12}}>(date ou texte libre ex: "Chaque lundi")</span></label>
          <input type="text" value={form.date || ""} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} placeholder="Ex: 25/06/2025 ou Chaque lundi" />
          <label style={lbl}>{t.heure}</label>
          <input type="time" value={form.heure || ""} onChange={e => setForm(f => ({ ...f, heure: e.target.value }))} style={inp} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
            <input type="checkbox" checked={form.showHeureFin || false} onChange={e => setForm(f => ({ ...f, showHeureFin: e.target.checked }))} id="heureFin" />
            <label htmlFor="heureFin" style={{ fontSize: 14 }}>🕐 Ajouter une heure de fin</label>
          </div>
          {form.showHeureFin && (
            <>
              <label style={lbl}>Heure de fin</label>
              <input type="time" value={form.heureFin || ""} onChange={e => setForm(f => ({ ...f, heureFin: e.target.value }))} style={inp} />
            </>
          )}
          <label style={lbl}>{t.public}</label>
          <input value={form.public || ""} onChange={e => setForm(f => ({ ...f, public: e.target.value }))} style={inp} />
          <label style={lbl}>{t.tarif}</label>
          <input value={form.tarif || ""} onChange={e => setForm(f => ({ ...f, tarif: e.target.value }))} style={inp} />
          <label style={lbl}>Description <span style={{fontWeight:400, color:"#6b7280", fontSize:12}}>(optionnel)</span></label>
          <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inp, height: 80, resize: "vertical" }} placeholder="Détails de l'événement..." />
          <ModalButtons onCancel={() => setShowForm(false)} onSave={save} t={t} />
        </Modal>
      )}
    </div>
  );
}

// ─── LOCATION TAB ────────────────────────────────────────────────────────────
function LocationTab({ isAdmin, t, activeTab }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { loadData(KEYS.locations).then(setItems); }, [activeTab]);

  async function save() {
    const entry = { ...form, id: editing || Date.now().toString() };
    const updated = editing ? items.map(e => e.id === editing ? entry : e) : [entry, ...items];
    setItems(updated); await saveData(KEYS.locations, updated); setShowForm(false);
  }

  async function del(id) {
    if (!confirm("Supprimer ?")) return;
    const u = items.filter(e => e.id !== id); setItems(u);
    await deleteItem(KEYS.locations, id);
    await saveData(KEYS.locations, u);
  }

  async function move(idx, dir) {
    const arr = [...items]; const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]]; setItems(arr); await saveData(KEYS.locations, arr);
  }

  return (
    <div style={{ padding: "14px 12px 80px" }}>
      {isAdmin && <AddBtn onClick={() => { setForm({ titre: "", texte: "", photoData: "" }); setEditing(null); setShowForm(true); }} label={t.addEvent} />}
      {items.map((ev, idx) => (
        <Card key={ev.id}>
          {ev.photoData && <img src={ev.photoData} alt={ev.titre} style={{ width: "100%", height: 160, objectFit: "cover" }} />}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 6 }}>{ev.titre}</div>
            {ev.texte && <p style={{ fontSize: 13, color: C.gray, marginBottom: 12, lineHeight: 1.5 }}>{ev.texte}</p>}
            <a href="https://wa.me/972555002021" target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: C.white, padding: "9px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              💬 {t.contact}
            </a>
            {isAdmin && <AdminBtns onUp={() => move(idx, -1)} onDown={() => move(idx, 1)} onEdit={() => { setForm({ ...ev, description: ev.description || "" }); setEditing(ev.id); setShowForm(true); }} onDelete={() => del(ev.id)} t={t} />}
          </div>
        </Card>
      ))}
      {showForm && (
        <Modal>
          <h3 style={{ color: C.navy, marginBottom: 12 }}>Location</h3>
          <label style={lbl}>{t.titre}</label>
          <input value={form.titre || ""} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} style={inp} />
          <PhotoInput photoData={form.photoData} onChange={d => setForm(f => ({ ...f, photoData: d }))} t={t} />
          <label style={lbl}>{t.description}</label>
          <textarea value={form.texte || ""} onChange={e => setForm(f => ({ ...f, texte: e.target.value }))} style={{ ...inp, height: 80, resize: "vertical" }} />
          <ModalButtons onCancel={() => setShowForm(false)} onSave={save} t={t} />
        </Modal>
      )}
    </div>
  );
}

// ─── REGLEMENTS TAB ──────────────────────────────────────────────────────────
function ReglementsTab({ t }) {
  return (
    <div style={{ padding: "32px 20px 80px", textAlign: "center" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, borderRadius: 20, padding: "32px 24px", marginBottom: 24, boxShadow: "0 4px 20px rgba(26,46,82,0.3)" }}>
        <img src={LOGO_SRC} alt="logo" style={{ width: 90, height: 90, borderRadius: 16, objectFit: "cover", marginBottom: 16 }} />
        <h2 style={{ color: C.white, marginBottom: 8, fontSize: 22 }}>{t.reglements}</h2>
        <p style={{ color: C.skyBlueLight, fontSize: 14, lineHeight: 1.6 }}>{t.reglementText}</p>
      </div>
      <a href="https://secure.cardcom.solutions/EA/EA5/7O0bbu78x0q6tm73LFNAQ/PaymentSP" target="_blank" rel="noopener"
        style={{ display: "block", padding: "18px 24px", background: `linear-gradient(135deg, ${C.skyBlue}, #3a9cc8)`, color: C.white, borderRadius: 14, textDecoration: "none", fontWeight: 700, fontSize: 18, boxShadow: "0 4px 16px rgba(91,191,234,0.4)" }}>
        💳 {t.paiementCB}
      </a>
    </div>
  );
}


// ─── ANNONCES TAB ────────────────────────────────────────────────────────────
async function shareAnnonce(a) {
  const lines = [`👤 ${a.prenom} ${a.nom}`, `🗓️ ${a.date}`, "", a.texte];
  try {
    const cardDataUrl = await generateShareCard({ title: "📢 Annonce", lines, photoData: a.photoData });
    await shareCardImage(cardDataUrl, "annonce");
  } catch (e) {
    console.error("Share card error:", e);
    shareAsText("📢 Annonce", lines);
  }
}

function AnnoncesTab({ isAdmin, t, activeTab }) {
  const [annonces, setAnnonces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ prenom: "", nom: "", texte: "", photoData: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => { loadData(KEYS.annonces).then(setAnnonces); }, [activeTab]);

  function validate() {
    const e = {};
    if (!form.prenom.trim()) e.prenom = t.prenomReq;
    if (!form.nom.trim()) e.nom = t.nomReq;
    if (!form.texte.trim()) e.texte = t.texteReq;
    return e;
  }

  async function publish() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const entry = { ...form, id: Date.now().toString(), date: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }), time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
    const updated = [entry, ...annonces];
    setAnnonces(updated);
    await saveData(KEYS.annonces, updated);
    setForm({ prenom: "", nom: "", texte: "", photoData: "" });
    setErrors({});
    setShowForm(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    notifyUsers(`📢 ${entry.prenom} ${entry.nom}`, entry.texte.slice(0, 100));
  }

  async function del(id) {
    if (!confirm("Supprimer ?")) return;
    const u = annonces.filter(e => e.id !== id);
    setAnnonces(u);
    await deleteItem(KEYS.annonces, id);
    await saveData(KEYS.annonces, u);
  }

  function getInitials(prenom, nom) {
    return ((prenom?.[0] || "") + (nom?.[0] || "")).toUpperCase();
  }

  return (
    <div style={{ padding: "14px 12px 80px" }}>
      {success && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 14px", borderRadius: 10, marginBottom: 12, fontWeight: 600, fontSize: 14, textAlign: "center" }}>
          ✅ {t.annonceAdded}
        </div>
      )}

      <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: 12, marginBottom: 14, background: `linear-gradient(135deg, ${C.skyBlue}, #3a9cc8)`, color: C.white, borderRadius: 10, fontWeight: 700, fontSize: 15, boxShadow: "0 3px 10px rgba(91,191,234,0.3)" }}>
        ✏️ {t.addAnnonce}
      </button>

      {annonces.map(a => (
        <Card key={a.id}>
          {a.photoData && <img src={a.photoData} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, display: "flex", alignItems: "center", justifyContent: "center", color: C.skyBlueLight, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {getInitials(a.prenom, a.nom)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{a.prenom} {a.nom}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{a.date} à {a.time}</div>
              </div>
              {isAdmin && (
                <button onClick={() => del(a.id)} style={{ background: "#fee2e2", color: C.danger, borderRadius: 6, padding: "4px 8px", fontSize: 12 }}>{t.delete}</button>
              )}
            </div>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 10 }}>{a.texte}</p>
            <button
              onClick={() => shareAnnonce(a)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600 }}
            >
              <span>💬</span> Partager sur WhatsApp
            </button>
          </div>
        </Card>
      ))}

      {annonces.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: C.gray }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📢</div>
          <p style={{ fontSize: 14 }}>Soyez le premier à publier une annonce !</p>
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 300, overflowY: "auto" }}>
          <div style={{ background: C.white, margin: "20px 12px", borderRadius: 16, padding: 20 }}>
            <h3 style={{ color: C.navy, marginBottom: 12 }}>✏️ {t.addAnnonce}</h3>

            <label style={lbl}>{t.prenom} *</label>
            <input value={form.prenom} onChange={e => { setForm(f => ({ ...f, prenom: e.target.value })); setErrors(er => ({ ...er, prenom: "" })); }}
              style={{ ...inp, borderColor: errors.prenom ? C.danger : "#d1d5db" }} placeholder={t.prenom} />
            {errors.prenom && <div style={{ color: C.danger, fontSize: 11, marginBottom: 4 }}>{errors.prenom}</div>}

            <label style={lbl}>{t.nom2} *</label>
            <input value={form.nom} onChange={e => { setForm(f => ({ ...f, nom: e.target.value })); setErrors(er => ({ ...er, nom: "" })); }}
              style={{ ...inp, borderColor: errors.nom ? C.danger : "#d1d5db" }} placeholder={t.nom2} />
            {errors.nom && <div style={{ color: C.danger, fontSize: 11, marginBottom: 4 }}>{errors.nom}</div>}

            <label style={lbl}>{t.uploadPhoto}</label>
            <input type="file" accept="image/*" onChange={e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = ev => setForm(f => ({ ...f, photoData: ev.target.result })); r.readAsDataURL(file); }} style={{ marginBottom: 8 }} />
            {form.photoData && <img src={form.photoData} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} alt="" />}

            <label style={lbl}>{t.texte} *</label>
            <textarea value={form.texte} onChange={e => { setForm(f => ({ ...f, texte: e.target.value })); setErrors(er => ({ ...er, texte: "" })); }}
              style={{ ...inp, height: 100, resize: "vertical", borderColor: errors.texte ? C.danger : "#d1d5db" }} placeholder={t.texte} />
            {errors.texte && <div style={{ color: C.danger, fontSize: 11, marginBottom: 4 }}>{errors.texte}</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => { setShowForm(false); setErrors({}); }} style={{ flex: 1, padding: 12, background: C.lightGray, color: C.gray, borderRadius: 8 }}>{t.cancel}</button>
              <button onClick={publish} style={{ flex: 2, padding: 12, background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, color: C.skyBlueLight, borderRadius: 8, fontWeight: 700 }}>📢 {t.addAnnonce}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PENSEE DU JOUR TAB ──────────────────────────────────────────────────────
function getDayIndex() {
  // Days since epoch, stable across the day for everyone
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}

async function sharePensee(pensee, customTitle) {
  const title = customTitle || "💭 Pensée du jour";
  const lines = [pensee.texte];
  if (pensee.source) lines.push(`— ${pensee.source}`);
  if (pensee.texteHe) {
    lines.push("");
    lines.push(pensee.texteHe);
    if (pensee.sourceHe) lines.push(`— ${pensee.sourceHe}`);
  }
  try {
    const cardDataUrl = await generateShareCard({ title, lines, photoData: null });
    await shareCardImage(cardDataUrl, title.replace(/[^a-z0-9]/gi, "_"));
  } catch (e) {
    console.error("Share card error:", e);
    shareAsText(title, lines);
  }
}

// Generates one combined image for Mini étude: Pensée du jour + Tehilim du jour + Motskin02 logo,
// with the canvas height growing as needed so nothing is ever cut off.
async function generateMiniEtudeShareCard(pensee, tehilim) {
  const W = 800;
  const PAD = 44;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  function wrapLines(text, maxWidth) {
    const paragraphs = String(text).split("\n");
    const lines = [];
    paragraphs.forEach(para => {
      if (para.trim() === "") { lines.push(""); return; }
      const words = para.split(" ");
      let line = "";
      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + " ";
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          lines.push(line.trim());
          line = words[i] + " ";
        } else {
          line = test;
        }
      }
      if (line.trim()) lines.push(line.trim());
    });
    return lines;
  }

  const headerH = 110;
  const sectionGap = 30;
  const sepH = 30;
  const footerH = 70;

  // Pensée content (French, optionally Hebrew)
  ctx.font = "italic 24px Arial, sans-serif";
  const penseeFraLines = wrapLines(`« ${pensee.texte} »`, W - PAD * 2);
  const penseeSourceLines = pensee.source ? wrapLines(`— ${pensee.source}`, W - PAD * 2) : [];
  let penseeHebLines = [];
  if (pensee.texteHe) {
    ctx.font = "26px 'Arial Hebrew', 'Times New Roman', serif";
    penseeHebLines = wrapLines(`« ${pensee.texteHe} »`, W - PAD * 2 - 20);
  }
  const penseeSourceHeLines = pensee.sourceHe ? wrapLines(`— ${pensee.sourceHe}`, W - PAD * 2 - 20) : [];

  // Tehilim content (Hebrew + French)
  ctx.font = "24px 'Arial Hebrew', 'Times New Roman', serif";
  const tehilimHebLines = wrapLines(tehilim.hebreu, W - PAD * 2 - 20);
  ctx.font = "19px Arial, sans-serif";
  const tehilimFraLines = wrapLines(tehilim.francais, W - PAD * 2);

  const penseeFraLineH = 32;
  const penseeHebLineH = 36;
  const tehilimHebLineH = 34;
  const tehilimFraLineH = 27;

  const penseeBlockH = 50 /* icon+label */ + penseeFraLines.length * penseeFraLineH + penseeSourceLines.length * 28
    + (penseeHebLines.length ? 20 + penseeHebLines.length * penseeHebLineH : 0) + penseeSourceHeLines.length * 26;
  const tehilimLabelH = 60;
  const tehilimBlockH = tehilimLabelH + tehilimHebLines.length * tehilimHebLineH + 20 + tehilimFraLines.length * tehilimFraLineH;

  const H = headerH + 30 + penseeBlockH + sectionGap + sepH + sectionGap + tehilimBlockH + footerH + PAD;

  canvas.width = W;
  canvas.height = H;

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, "#f0f4f8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Header band with logo
  ctx.fillStyle = "#1a2e52";
  ctx.fillRect(0, 0, W, headerH);
  const logoImg = await new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = LOGO_SRC;
  });
  if (logoImg) {
    const logoSize = 70;
    ctx.save();
    ctx.beginPath();
    ctx.arc(PAD + logoSize / 2, headerH / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, PAD, headerH / 2 - logoSize / 2, logoSize, logoSize);
    ctx.restore();
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial, sans-serif";
  ctx.fillText("Mini étude du jour", PAD + 88, headerH / 2 + 8);

  let y = headerH + 50;

  // Section 1: Pensée du jour
  ctx.textAlign = "center";
  ctx.font = "bold 20px Arial, sans-serif";
  ctx.fillStyle = "#1a2e52";
  ctx.fillText("💭 Pensée du jour", W / 2, y);
  y += 38;

  ctx.font = "italic 24px Arial, sans-serif";
  ctx.fillStyle = "#374151";
  penseeFraLines.forEach(line => { ctx.fillText(line, W / 2, y); y += penseeFraLineH; });
  if (penseeSourceLines.length) {
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillStyle = "#3a9cc8";
    penseeSourceLines.forEach(line => { ctx.fillText(line, W / 2, y); y += 28; });
  }
  if (penseeHebLines.length) {
    y += 20;
    ctx.font = "26px 'Arial Hebrew', 'Times New Roman', serif";
    ctx.fillStyle = "#1a2e52";
    penseeHebLines.forEach(line => { ctx.fillText(line, W / 2, y); y += penseeHebLineH; });
    if (penseeSourceHeLines.length) {
      ctx.font = "bold 18px 'Arial Hebrew', 'Times New Roman', serif";
      ctx.fillStyle = "#3a9cc8";
      penseeSourceHeLines.forEach(line => { ctx.fillText(line, W / 2, y); y += 26; });
    }
  }

  y += sectionGap;
  ctx.strokeStyle = "#5bbfea55";
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += sectionGap;

  // Section 2: Tehilim du jour
  ctx.font = "bold 20px Arial, sans-serif";
  ctx.fillStyle = "#1a2e52";
  ctx.fillText(`📜 Tehilim du jour — Psaume ${tehilim.numero}`, W / 2, y);
  y += 24;
  ctx.font = "14px Arial, sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.fillText(tehilim.titre, W / 2, y);
  y += 36;

  ctx.font = "24px 'Arial Hebrew', 'Times New Roman', serif";
  ctx.fillStyle = "#1a2e52";
  ctx.textAlign = "right";
  tehilimHebLines.forEach(line => { ctx.fillText(line, W - PAD, y); y += tehilimHebLineH; });

  y += 20;
  ctx.font = "19px Arial, sans-serif";
  ctx.fillStyle = "#374151";
  ctx.textAlign = "left";
  tehilimFraLines.forEach(line => { ctx.fillText(line, PAD, y); y += tehilimFraLineH; });

  // Footer
  y = H - 50;
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillStyle = "#1a2e52";
  ctx.textAlign = "center";
  ctx.fillText("🇮🇱 Beth Haknesset Motskin02", W / 2, y);

  return canvas.toDataURL("image/jpeg", 0.9);
}

async function shareMiniEtude(pensee, tehilim) {
  try {
    const cardDataUrl = await generateMiniEtudeShareCard(pensee, tehilim);
    await shareCardImage(cardDataUrl, "mini-etude-du-jour");
  } catch (e) {
    console.error("Share card error:", e);
    shareAsText("Mini étude du jour", [pensee.texte, "", `Tehilim ${tehilim.numero}`]);
  }
}

function PenseeTab({ isAdmin, t, activeTab, lang, onAdminClick }) {
  const [pensees, setPensees] = useState([]);
  const [showManage, setShowManage] = useState(false);
  const [form, setForm] = useState({ texte: "", source: "", texteHe: "", sourceHe: "" });
  const [hebrewDate, setHebrewDate] = useState("");

  useEffect(() => {
    loadData(KEYS.pensees).then(setPensees);
    fetchHebrewDate(new Date()).then(setHebrewDate);
  }, [activeTab]);

  // Combine admin-added pensees with default ones for a richer rotation
  const allPensees = [...DEFAULT_PENSEES, ...pensees];
  const todayIndex = getDayIndex() % allPensees.length;
  const todayPensee = allPensees[todayIndex];

  // Daily psalm: independent rotation so it doesn't always change in sync with the quote
  const tehilimIndex = (getDayIndex() + 2) % TEHILIM_JOUR.length;
  const todayTehilim = TEHILIM_JOUR[tehilimIndex];

  async function add() {
    if (!form.texte.trim()) return;
    const entry = { ...form, id: Date.now().toString() };
    const updated = [...pensees, entry];
    setPensees(updated);
    await saveData(KEYS.pensees, updated);
    setForm({ texte: "", source: "", texteHe: "", sourceHe: "" });
  }

  async function del(id) {
    if (!confirm("Supprimer ?")) return;
    const updated = pensees.filter(p => p.id !== id);
    setPensees(updated);
    await deleteItem(KEYS.pensees, id);
    await saveData(KEYS.pensees, updated);
  }

  const dateStrFr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ padding: "20px 16px 80px" }}>
      <div style={{
        background: `linear-gradient(150deg, ${C.navy} 0%, #2a4a7c 60%, ${C.skyBlue} 130%)`,
        borderRadius: 20, padding: "32px 24px", marginBottom: 20,
        boxShadow: "0 6px 24px rgba(26,46,82,0.35)", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ fontSize: 12, color: C.skyBlueLight, textTransform: "capitalize", marginBottom: 18, letterSpacing: 0.5 }}>
          {dateStrFr} {hebrewDate && <span dir="rtl">• {hebrewDate}</span>}
        </div>
        <div style={{ fontSize: 34, marginBottom: 16 }}>💭</div>

        {/* French */}
        <p style={{ color: C.white, fontSize: 18, lineHeight: 1.6, fontWeight: 500, marginBottom: 6, fontStyle: "italic" }}>
          « {todayPensee.texte} »
        </p>
        {todayPensee.source && (
          <div style={{ color: C.skyBlueLight, fontSize: 12, fontWeight: 600, marginBottom: 18 }}>— {todayPensee.source}</div>
        )}

        {todayPensee.texteHe && (
          <>
            <div style={{ height: 1, background: "rgba(255,255,255,0.25)", margin: "0 30px 18px" }} />
            {/* Hebrew */}
            <p dir="rtl" style={{ color: C.white, fontSize: 19, lineHeight: 1.8, fontWeight: 500, marginBottom: 6 }}>
              « {todayPensee.texteHe} »
            </p>
            {todayPensee.sourceHe && (
              <div dir="rtl" style={{ color: C.skyBlueLight, fontSize: 13, fontWeight: 600 }}>— {todayPensee.sourceHe}</div>
            )}
          </>
        )}
      </div>

      <div style={{
        background: C.white, borderRadius: 18, padding: "22px 20px", marginBottom: 20,
        boxShadow: "0 2px 14px rgba(0,0,0,0.06)", border: `1px solid ${C.skyBlue}33`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 22 }}>📜</span>
          <div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>Tehilim du jour</div>
            <div style={{ fontSize: 11, color: C.gray }}>Psaume {todayTehilim.numero} — {todayTehilim.titre}</div>
          </div>
        </div>

        <div dir="rtl" style={{ fontSize: 16, lineHeight: 1.8, color: C.text, marginBottom: 12, fontFamily: "serif" }}>
          {todayTehilim.hebreu}
        </div>

        <div style={{ height: 1, background: C.lightGray, margin: "12px 0" }} />

        <div style={{ fontSize: 13, lineHeight: 1.6, color: C.gray }}>
          {todayTehilim.francais}
        </div>
      </div>

      {isAdmin && (
        <button onClick={() => setShowManage(true)} style={{ width: "100%", padding: 12, background: C.lightGray, color: C.navy, borderRadius: 10, fontWeight: 600, fontSize: 14, border: `1px solid ${C.skyBlue}55`, marginBottom: 12 }}>
          ⚙️ {t.gererPensees}
        </button>
      )}

      <button
        onClick={() => shareMiniEtude(todayPensee, todayTehilim)}
        style={{ width: "100%", padding: 12, background: "#25D366", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none" }}
      >
        💬 {t.partager}
      </button>

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <button
          onClick={onAdminClick}
          aria-label="admin"
          style={{ background: "transparent", border: "none", color: isAdmin ? C.skyBlue : "#cbd5e1", fontSize: 20, padding: 10, letterSpacing: 3 }}
        >
          •••
        </button>
      </div>

      {showManage && (
        <Modal>
          <h3 style={{ color: C.navy, marginBottom: 12 }}>{t.gererPensees}</h3>

          <label style={lbl}>{t.contenuPensee}</label>
          <textarea value={form.texte} onChange={e => setForm(f => ({ ...f, texte: e.target.value }))} style={{ ...inp, height: 60, resize: "vertical" }} placeholder="Ex: La vraie richesse..." />

          <label style={lbl}>{t.source}</label>
          <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={inp} placeholder="Ex: Pirké Avot 2:7" />

          <label style={lbl}>{t.contenuPenseeHe}</label>
          <textarea dir="rtl" value={form.texteHe} onChange={e => setForm(f => ({ ...f, texteHe: e.target.value }))} style={{ ...inp, height: 60, resize: "vertical" }} placeholder="כתוב כאן בעברית..." />

          <label style={lbl}>{t.sourceHe}</label>
          <input dir="rtl" value={form.sourceHe} onChange={e => setForm(f => ({ ...f, sourceHe: e.target.value }))} style={inp} placeholder="מקור בעברית" />

          <button onClick={add} style={{ width: "100%", padding: 10, background: `linear-gradient(135deg, ${C.skyBlue}, #3a9cc8)`, color: C.white, borderRadius: 8, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
            + {t.ajouterPensee}
          </button>

          {pensees.length > 0 && (
            <div style={{ borderTop: `1px solid ${C.lightGray}`, paddingTop: 12 }}>
              {pensees.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${C.lightGray}` }}>
                  <div style={{ flex: 1, paddingRight: 8 }}>
                    <div style={{ fontSize: 13, color: C.text }}>{p.texte}</div>
                    {p.source && <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>— {p.source}</div>}
                    {p.texteHe && <div dir="rtl" style={{ fontSize: 13, color: C.text, marginTop: 4 }}>{p.texteHe}</div>}
                  </div>
                  <button onClick={() => del(p.id)} style={{ background: "#fee2e2", color: C.danger, borderRadius: 6, padding: "3px 8px", fontSize: 11, flexShrink: 0 }}>{t.delete}</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button onClick={() => setShowManage(false)} style={{ width: "100%", padding: 10, background: C.lightGray, color: C.gray, borderRadius: 8 }}>{t.cancel}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SEMAINE TAB (Programme de la semaine, avec historique) ─────────────────
const ZMANIM_API = "https://www.hebcal.com/zmanim?cfg=json&geonameid=293807";

function getWeekId(date) {
  // Returns the Sunday (start of week) for a given date, as YYYY-MM-DD
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getCurrentWeekId() {
  return getWeekId(new Date());
}

function weekRangeLabelFr(weekId) {
  const start = new Date(weekId + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} – ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
}

async function weekRangeLabelHe(weekId) {
  const start = new Date(weekId + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const [startHe, endHe] = await Promise.all([fetchHebrewDate(start), fetchHebrewDate(end)]);
  return `${startHe} – ${endHe}`;
}

// Default day events. These act as seed data: rendered until the admin has explicitly
// initialized that day's data in Firebase (after which admin edits/deletes fully apply).
const DEFAULT_DAY_EVENTS = {
  dimanche: [{ key: "default-kollel", intitule: "Kollel", horaire: "20:15", lieu: "" }],
  lundi: [{ key: "default-tanya", intitule: "Tanya Mental en hébreu — avec le Rav Oded Kravtchik", horaire: "20:30", lieu: "" }],
  mardi: [{ key: "default-orot", intitule: "Orot du Rav Kook — par Rabbi Yaacov", horaire: "", lieu: "" }],
};

// Generates a shareable "card" image (canvas) combining the event's photo (if any),
// title, time/place info, and the synagogue logo — styled like a label/poster.
async function generateShareCard({ title, lines, photoData }) {
  const W = 800;
  const PAD = 40;
  const hasPhoto = !!photoData;
  const photoH = hasPhoto ? 420 : 0;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  const ctx = canvas.getContext("2d");

  // Wrap a block of text into multiple lines that fit maxWidth, respecting existing line breaks
  function wrapBlock(text, maxWidth) {
    const paragraphs = String(text).split("\n");
    const out = [];
    paragraphs.forEach(para => {
      if (para.trim() === "") { out.push(""); return; }
      const words = para.split(" ");
      let line = "";
      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + " ";
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          out.push(line.trim());
          line = words[i] + " ";
        } else {
          line = test;
        }
      }
      if (line.trim()) out.push(line.trim());
    });
    return out;
  }

  // Pre-measure: title wrap
  ctx.font = "bold 38px Arial, sans-serif";
  const titleLines = wrapBlock(title, W - 80);

  // Pre-measure: each info line individually wrapped (these may be long Hebrew/French paragraphs)
  ctx.font = "28px Arial, sans-serif";
  const wrappedLineGroups = lines.map(line => wrapBlock(line, W - PAD * 2));
  const totalInfoLines = wrappedLineGroups.reduce((sum, group) => sum + group.length, 0);

  const titleBlockH = 64 + titleLines.length * 46;
  const infoBlockH = totalInfoLines * 44;
  const footerH = 90;
  const H = photoH + titleBlockH + infoBlockH + footerH;

  canvas.height = H;

  // Background gradient (navy to sky blue, matching the app's identity)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1a2e52");
  grad.addColorStop(1, "#3a9cc8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  let y = 0;

  // Photo on top, if provided
  if (hasPhoto) {
    const img = await new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = photoData;
    });
    if (img) {
      // Cover-fit the photo into the photo area
      const scale = Math.max(W / img.width, photoH / img.height);
      const sw = W / scale, sh = photoH / scale;
      const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, photoH);
    }
    y = photoH;
  }

  // Text block
  ctx.textAlign = "center";

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px Arial, sans-serif";
  y += 64;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, y + i * 46);
  });
  y += (titleLines.length - 1) * 46;

  // Info lines (time, place, etc.) — each wrapped individually so nothing overflows
  ctx.font = "28px Arial, sans-serif";
  ctx.fillStyle = "#dceefb";
  wrappedLineGroups.forEach(group => {
    group.forEach(wline => {
      y += 44;
      ctx.fillText(wline, W / 2, y);
    });
  });

  // Footer with logo + synagogue name
  y = H - 50;
  const footerLogo = await new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = LOGO_SRC;
  });
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillStyle = "#a8ddf4";
  const footerText = "Beth Haknesset Motskin02";
  if (footerLogo) {
    const logoSize = 34;
    const textWidth = ctx.measureText(footerText).width;
    const totalWidth = logoSize + 10 + textWidth;
    const startX = W / 2 - totalWidth / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(startX + logoSize / 2, y - logoSize / 2 + 8, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(footerLogo, startX, y - logoSize + 8, logoSize, logoSize);
    ctx.restore();
    ctx.textAlign = "left";
    ctx.fillText(footerText, startX + logoSize + 10, y);
    ctx.textAlign = "center";
  } else {
    ctx.fillText(footerText, W / 2, y);
  }

  return canvas.toDataURL("image/jpeg", 0.85);
}

// Generates a faithful reproduction of the full Shabbat/Fête label as a shareable image:
// photo, badge + name, the "next times" header, then every label/value row.
async function generateShabbatShareCard(ev, t, nextShabbat) {
  const W = 800;
  const PAD = 50;
  const hasPhoto = !!ev.photoData;
  const photoH = hasPhoto ? 380 : 0;

  // Build the list of rows to render, mirroring the on-screen card exactly
  const rows = [];
  if (nextShabbat) {
    rows.push({ kind: "header", text: "⏰ Prochains horaires • Ra'anana" });
    rows.push({ label: `🕯️ ${t.allumage}`, value: formatTime(nextShabbat.candle) });
    if (nextShabbat.havdalah) rows.push({ label: "✨ Havdala", value: formatTime(nextShabbat.havdalah) });
  }
  rows.push({ label: `🙏 ${t.minhaBefore}`, value: ev.minhaBefore });
  if (ev.showChiourBefore && ev.chiourBeforeText) rows.push({ label: "📚 Chiour", value: ev.chiourBeforeText });
  rows.push({ label: `☀️ ${t.chakharit}`, value: ev.chakharit });
  if (ev.paracha) rows.push({ label: `📖 ${t.paracha}`, value: ev.paracha });
  if (ev.kiddouch) rows.push({ label: `🍷 ${t.kiddouch}`, value: ev.kiddouch });
  rows.push({ label: `📚 ${t.chiour}`, value: ev.chiour });
  rows.push({ label: `🌅 ${t.minhaAfternoon}`, value: ev.minhaAfternoon });
  if (ev.type === "shabbat" && ev.seoudaText) rows.push({ label: `🍞 ${t.seoudaChl}`, value: ev.seoudaText });
  rows.push({ label: `🌙 ${t.arvit}`, value: ev.arvit });
  if (ev.birkat) rows.push({ kind: "banner", text: `🌙 ${t.birkatHalevana}` });
  if (ev.prochaineDate && ev.prochaineText) rows.push({ label: `📅 ${t.prochaineDate}`, value: ev.prochaineText });

  const rowH = 42;
  const headerH = 50;
  const bannerH = 56;
  let bodyH = 0;
  rows.forEach(r => { bodyH += r.kind === "header" ? headerH : r.kind === "banner" ? bannerH : rowH; });

  const titleH = 110; // badge + name
  const footerH = 70;
  const H = photoH + titleH + bodyH + footerH + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, "#f0f4f8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  let y = 0;

  // Photo
  if (hasPhoto) {
    const img = await new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = ev.photoData;
    });
    if (img) {
      const scale = Math.max(W / img.width, photoH / img.height);
      const sw = W / scale, sh = photoH / scale;
      const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, photoH);
    }
    y = photoH;
  }

  // Badge + name block (navy background)
  ctx.fillStyle = "#1a2e52";
  ctx.fillRect(0, y, W, titleH);
  const badgeText = ev.type === "shabbat" ? t.shabbat : t.fete;
  ctx.font = "bold 22px Arial, sans-serif";
  const badgeW = ctx.measureText(badgeText).width + 36;
  ctx.fillStyle = ev.type === "shabbat" ? "#3a9cc8" : "#5bbfea";
  roundRect(ctx, PAD, y + 22, badgeW, 36, 18);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(badgeText, PAD + 18, y + 47);
  ctx.font = "bold 34px Arial, sans-serif";
  ctx.fillText(ev.nom || "", PAD, y + 95);
  y += titleH;

  // Rows
  ctx.textAlign = "left";
  rows.forEach(r => {
    if (r.kind === "header") {
      ctx.fillStyle = "#1a2e52";
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.fillText(r.text, PAD, y + 32);
      y += headerH;
    } else if (r.kind === "banner") {
      ctx.fillStyle = "#5bbfea33";
      roundRect(ctx, PAD, y + 6, W - PAD * 2, bannerH - 16, 10);
      ctx.fillStyle = "#1a2e52";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.fillText(r.text, PAD + 16, y + bannerH / 2 + 7);
      y += bannerH;
    } else {
      ctx.strokeStyle = "#e5e7eb";
      ctx.beginPath();
      ctx.moveTo(PAD, y + rowH - 6);
      ctx.lineTo(W - PAD, y + rowH - 6);
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "24px Arial, sans-serif";
      ctx.fillText(r.label, PAD, y + 28);

      ctx.fillStyle = "#1a2e52";
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(r.value || "—", W - PAD, y + 28);
      ctx.textAlign = "left";

      y += rowH;
    }
  });

  // Footer
  y += 20;
  const shabbatFooterLogo = await new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = LOGO_SRC;
  });
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillStyle = "#1a2e52";
  const shabbatFooterText = "🇮🇱 Beth Haknesset Motskin02";
  if (shabbatFooterLogo) {
    ctx.textAlign = "left";
    const logoSize = 32;
    const textWidth = ctx.measureText(shabbatFooterText).width;
    const totalWidth = logoSize + 10 + textWidth;
    const startX = W / 2 - totalWidth / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(startX + logoSize / 2, y + 24 - logoSize / 2 + 8, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(shabbatFooterLogo, startX, y + 24 - logoSize + 8, logoSize, logoSize);
    ctx.restore();
    ctx.fillText(shabbatFooterText, startX + logoSize + 10, y + 24);
    ctx.textAlign = "center";
  } else {
    ctx.fillText(shabbatFooterText, W / 2, y + 24);
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

async function shareShabbatEvent(ev, t, nextShabbat) {
  try {
    const cardDataUrl = await generateShabbatShareCard(ev, t, nextShabbat);
    await shareCardImage(cardDataUrl, ev.nom);
  } catch (e) {
    console.error("Share card error:", e);
    const lines = [`🕯️ ${ev.entree}`, `☀️ ${ev.chakharit}`];
    shareAsText(ev.nom, lines);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, curY);
      line = words[i] + " ";
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}

function countWrappedLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  let line = "";
  let count = 1;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      count++;
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  return count;
}

// Shares an event as a generated image card via native share (WhatsApp, etc.) or falls back to text
async function shareEvent(item) {
  const title = item.intitule || item.titre;
  const lines = [];
  if (item.date) lines.push(`📅 ${item.date}`);
  if (item.horaire) lines.push(`🕐 ${item.horaire}${item.heureFin ? ` → ${item.heureFin}` : ""}`);
  if (item.heure) lines.push(`🕐 ${item.heure}${item.showHeureFin && item.heureFin ? ` → ${item.heureFin}` : ""}`);
  if (item.lieu) lines.push(`📍 ${item.lieu}`);
  if (item.public) lines.push(`👥 ${item.public}`);
  if (item.tarif) lines.push(`💰 ${item.tarif}`);
  if (item.description) lines.push(item.description.length > 80 ? item.description.slice(0, 80) + "…" : item.description);

  try {
    const cardDataUrl = await generateShareCard({ title, lines, photoData: item.photoData });
    await shareCardImage(cardDataUrl, title);
  } catch (e) {
    console.error("Share card error:", e);
    shareAsText(title, lines);
  }
}

async function shareCardImage(dataUrl, filenameBase) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], `${(filenameBase || "evenement").replace(/[^a-z0-9]/gi, "_")}.jpg`, { type: "image/jpeg" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file] });
  } else {
    // Fallback: open the image in a new tab so the user can save/share it manually
    window.open(dataUrl, "_blank");
  }
}

function shareAsText(title, lines) {
  const text = [`📅 ${title}`, ...lines, "", "Beth Haknesset Motskin02"].join("\n");
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }
}

function EventCard({ item, isAdmin, onUp, onDown, onEdit, onDelete, t }) {
  return (
    <Card style={{ marginBottom: 8 }}>
      {item.photoData && <img src={item.photoData} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} />}
      <div style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: C.navy, fontSize: 14 }}>{item.intitule}</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
              {item.date && <span>📅 {item.date} </span>}
              {item.horaire && <span>🕐 {item.horaire}{item.heureFin ? ` → ${item.heureFin}` : ""}</span>}
              {item.lieu && <span> · 📍 {item.lieu}</span>}
            </div>
            {item.description && <p style={{ fontSize: 12, color: C.gray, lineHeight: 1.5, marginTop: 6 }}>{item.description}</p>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <button onClick={() => shareEvent(item)} style={{ background: "#25D366", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
            📤 {t.partager}
          </button>
          {isAdmin && (
            <>
              {onUp && <button onClick={onUp} style={moveBtn}>{t.moveUp}</button>}
              {onDown && <button onClick={onDown} style={moveBtn}>{t.moveDown}</button>}
              <button onClick={onEdit} style={{ background: C.lightGray, color: C.navy, borderRadius: 6, padding: "4px 8px", fontSize: 11 }}>{t.edit}</button>
              <button onClick={onDelete} style={{ background: "#fee2e2", color: C.danger, borderRadius: 6, padding: "4px 8px", fontSize: 11 }}>{t.delete}</button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}


function WeekBlock({ weekId, isAdmin, t, events, dayExtras, onAdd, onEdit, onEditDefault, onDelete, onMove, onExtrasEdit }) {
  const jours = [
    { key: "dimanche", label: t.dimanche },
    { key: "lundi", label: t.lundi },
    { key: "mardi", label: t.mardi },
    { key: "mercredi", label: t.mercredi },
    { key: "jeudi", label: t.jeudi },
    { key: "vendredi", label: t.vendredi },
    { key: "samedi", label: t.samedi },
  ];
  const rangeFr = weekRangeLabelFr(weekId);
  const [rangeHe, setRangeHe] = useState("");

  useEffect(() => {
    weekRangeLabelHe(weekId).then(setRangeHe);
  }, [weekId]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, borderRadius: 12, padding: "12px 16px", marginBottom: 14, color: C.white, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: C.skyBlueLight, fontWeight: 700 }}>📋 {t.semaineDu} {rangeFr}</div>
        {rangeHe && <div style={{ fontSize: 12, color: C.skyBlueLight, marginTop: 2 }} dir="rtl">{rangeHe}</div>}
      </div>

      {jours.map(jour => {
        // All items for this day (default seeds first, then custom events), ordered by _order if present
        const defaultsForDay = DEFAULT_DAY_EVENTS[jour.key] || [];
        const visibleDefaults = defaultsForDay
          .filter(def => !events.some(c => c.id === `${weekId}_${def.key}`))
          .map(def => ({ ...def, id: `${weekId}_${def.key}`, isSeed: true }));
        const customItems = events.filter(c => c.jour === jour.key && !c.deleted);
        const allItems = [...visibleDefaults, ...customItems].sort((a, b) => (a._order ?? 999) - (b._order ?? 999));

        const extras = dayExtras[jour.key];
        const hasExtras = extras && (extras.seoudaEnabled || extras.petitDejEnabled);
        const hasAnything = allItems.length > 0 || hasExtras;

        if (!hasAnything && !isAdmin) return null;

        return (
          <div key={jour.key} style={{ marginBottom: 14 }}>
            {(hasAnything || isAdmin) && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{jour.label}</div>
                {isAdmin && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onExtrasEdit(jour.key)} style={{ background: C.lightGray, color: C.navy, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>
                      🍞 Seouda / 🥐 P'tit-déj
                    </button>
                    <button onClick={() => onAdd(jour.key)} style={{ background: C.lightGray, color: C.navy, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                      + {t.ajouterCreneau}
                    </button>
                  </div>
                )}
              </div>
            )}

            {allItems.map((item, idx) => (
              <EventCard key={item.id} item={item} isAdmin={isAdmin}
                onUp={() => onMove(jour.key, allItems, idx, -1)}
                onDown={() => onMove(jour.key, allItems, idx, 1)}
                onEdit={() => item.isSeed ? onEditDefault(weekId, jour.key, item) : onEdit(item)}
                onDelete={() => onDelete(item.id, item.isSeed, jour.key, item)}
                t={t} />
            ))}

            {hasExtras && (
              <Card style={{ marginBottom: 8 }}>
                <div style={{ padding: "10px 14px" }}>
                  {extras.seoudaEnabled && extras.seoudaTexte && (
                    <div style={{ fontSize: 13, color: C.navy, marginBottom: extras.petitDejEnabled ? 6 : 0 }}>🍞 <strong>Seouda après Arvit :</strong> {extras.seoudaTexte}</div>
                  )}
                  {extras.petitDejEnabled && extras.petitDejTexte && (
                    <div style={{ fontSize: 13, color: C.navy }}>🥐 <strong>Petit-déjeuner :</strong> {extras.petitDejTexte}</div>
                  )}
                </div>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProgrammeTab({ isAdmin, t, activeTab, lang }) {
  const [sunset, setSunset] = useState(null);
  const [minhaOverride, setMinhaOverride] = useState(null);
  const [allEvents, setAllEvents] = useState([]); // all weeks' events combined
  const [allExtras, setAllExtras] = useState({}); // { [weekId]: { [jourKey]: extrasDoc } }
  const [weekIds, setWeekIds] = useState([getCurrentWeekId()]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [showMinhaEdit, setShowMinhaEdit] = useState(false);
  const [minhaInput, setMinhaInput] = useState("");
  const [showExtrasEdit, setShowExtrasEdit] = useState(null); // { weekId, jour } or null
  const [extrasForm, setExtrasForm] = useState({ seoudaEnabled: false, seoudaTexte: "", petitDejEnabled: false, petitDejTexte: "" });

  useEffect(() => {
    fetchSunset();
    loadData(KEYS.programme).then(data => {
      const events = data.filter(d => d.type === "event");
      setAllEvents(events);
      const minhaDoc = data.find(d => d.type === "minha_override");
      setMinhaOverride(minhaDoc ? minhaDoc.value : null);
      const extras = {};
      data.filter(d => d.type === "day_extras").forEach(d => {
        if (!extras[d.semaine]) extras[d.semaine] = {};
        extras[d.semaine][d.jour] = d;
      });
      setAllExtras(extras);

      const currentId = getCurrentWeekId();
      const weeksWithData = new Set([currentId]);
      events.forEach(e => { if (e.semaine) weeksWithData.add(e.semaine); });
      Object.keys(extras).forEach(w => weeksWithData.add(w));
      const sorted = Array.from(weeksWithData).sort((a, b) => b.localeCompare(a));

      // Auto-copie : si la semaine en cours n'a pas encore d'événements personnalisés,
      // on duplique automatiquement tous les événements de la semaine précédente
      // (avec leurs photos, descriptions, horaires, etc.)
      const currentWeekEvents = events.filter(e => e.semaine === currentId && e.type === "event" && !e.deleted);
      if (currentWeekEvents.length === 0) {
        const prevWeekId = sorted.find(w => w < currentId);
        if (prevWeekId) {
          const prevEvents = events.filter(e => e.semaine === prevWeekId && e.type === "event" && !e.deleted);
          if (prevEvents.length > 0) {
            const copied = prevEvents.map(e => ({
              ...e,
              id: "copy_" + currentId + "_" + e.id,
              semaine: currentId,
            }));
            const allUpdated = [...events, ...copied];
            setAllEvents(allUpdated);
            // Persistance immédiate des copies dans Firebase
            const minhaDocCopy = data.find(d => d.type === "minha_override");
            const extrasDocsCopy = Object.keys(extras).flatMap(wId =>
              Object.keys(extras[wId]).map(jk => ({
                ...extras[wId][jk], id: "extras_" + wId + "_" + jk, type: "day_extras", jour: jk, semaine: wId,
              }))
            );
            await saveData(KEYS.programme, [
              ...allUpdated,
              ...(minhaDocCopy ? [minhaDocCopy] : []),
              ...extrasDocsCopy,
            ]);
            weeksWithData.add(currentId);
          }
        }
      }

      setWeekIds(Array.from(weeksWithData).sort((a, b) => b.localeCompare(a)));
    });
  }, [activeTab]);

  async function fetchSunset() {
    try {
      const r = await fetch(ZMANIM_API);
      const j = await r.json();
      if (j.times && j.times.sunset) setSunset(formatTime(j.times.sunset));
    } catch {}
  }

  const defaultMinha = sunset ? addMinutes(sunset, -15, true) : null;
  const minhaTime = minhaOverride || defaultMinha;

  async function persistAll(updatedEvents, updatedMinha, updatedExtras) {
    const minhaDoc = { id: "minha_override", type: "minha_override", value: updatedMinha !== undefined ? updatedMinha : minhaOverride };
    const extrasSource = updatedExtras || allExtras;
    const extrasDocs = [];
    Object.keys(extrasSource).forEach(weekId => {
      Object.keys(extrasSource[weekId]).forEach(jourKey => {
        extrasDocs.push({ ...extrasSource[weekId][jourKey], id: `extras_${weekId}_${jourKey}`, type: "day_extras", jour: jourKey, semaine: weekId });
      });
    });
    const all = [...updatedEvents, minhaDoc, ...extrasDocs];
    await saveData(KEYS.programme, all);
  }

  async function saveMinha() {
    const updated = minhaInput.trim() || null;
    setMinhaOverride(updated);
    await persistAll(allEvents, updated, undefined);
    setShowMinhaEdit(false);
  }
  async function resetMinha() {
    setMinhaOverride(null);
    await persistAll(allEvents, null, undefined);
    setShowMinhaEdit(false);
  }

  function openExtrasEdit(weekId, jourKey) {
    const existing = (allExtras[weekId] && allExtras[weekId][jourKey]) || {};
    setExtrasForm({
      seoudaEnabled: existing.seoudaEnabled || false,
      seoudaTexte: existing.seoudaTexte || "",
      petitDejEnabled: existing.petitDejEnabled || false,
      petitDejTexte: existing.petitDejTexte || "",
    });
    setShowExtrasEdit({ weekId, jour: jourKey });
  }

  async function saveExtras() {
    const { weekId, jour } = showExtrasEdit;
    const updatedExtras = { ...allExtras, [weekId]: { ...(allExtras[weekId] || {}), [jour]: extrasForm } };
    setAllExtras(updatedExtras);
    await persistAll(allEvents, undefined, updatedExtras);
    setShowExtrasEdit(null);
  }

  function openAdd(weekId, jourKey) {
    setForm({ jour: jourKey, semaine: weekId, intitule: "", date: "", horaire: "", heureFin: "", showHeureFin: false, lieu: "", description: "", photoData: "" });
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(item) {
    setForm({ ...item, showHeureFin: !!item.heureFin });
    setEditing(item.id);
    setShowForm(true);
  }
  function openEditDefault(weekId, jourKey, def) {
    setForm({ jour: jourKey, semaine: weekId, intitule: def.intitule, date: "", horaire: def.horaire, heureFin: "", showHeureFin: false, lieu: def.lieu || "", description: "", photoData: "" });
    setEditing(`${weekId}_${def.key}`);
    setShowForm(true);
  }

  async function save() {
    const exists = allEvents.some(c => c.id === editing);
    const existingOrder = exists ? allEvents.find(c => c.id === editing)._order : allEvents.filter(e => e.jour === form.jour && e.semaine === form.semaine).length;
    const entry = { ...form, type: "event", id: editing || Date.now().toString(), _order: existingOrder ?? 0 };
    const updated = editing && exists ? allEvents.map(c => c.id === editing ? entry : c) : [...allEvents, entry];
    setAllEvents(updated);
    await persistAll(updated, undefined, undefined);
    setShowForm(false);
  }

  async function del(id, isSeed, jourKey, item) {
    if (!confirm("Supprimer ?")) return;
    if (isSeed) {
      const weekId = id.substring(0, 10);
      const entry = { id, type: "event", deleted: true, jour: jourKey, semaine: weekId };
      const updated = [...allEvents.filter(c => c.id !== id), entry];
      setAllEvents(updated);
      await persistAll(updated, undefined, undefined);
    } else {
      const updated = allEvents.filter(c => c.id !== id);
      setAllEvents(updated);
      await deleteItem(KEYS.programme, id);
      await persistAll(updated, undefined, undefined);
    }
  }

  // Reorder items within a day: works across seed + custom items by persisting explicit _order on all of them
  async function move(jourKey, allItemsForDay, idx, dir) {
    const to = idx + dir;
    if (to < 0 || to >= allItemsForDay.length) return;
    const reordered = [...allItemsForDay];
    [reordered[idx], reordered[to]] = [reordered[to], reordered[idx]];

    // Materialize every item in this reordered list as a real event with updated _order,
    // converting any seed defaults into persisted events so the new order sticks.
    const weekId = reordered[0]?.semaine || (reordered[0]?.id || "").substring(0, 10) || getCurrentWeekId();
    const updatedEvents = [...allEvents];
    reordered.forEach((item, newIdx) => {
      const realId = item.id;
      const existingIdx = updatedEvents.findIndex(e => e.id === realId);
      const materialized = {
        id: realId,
        type: "event",
        jour: jourKey,
        semaine: item.semaine || weekId,
        intitule: item.intitule,
        date: item.date || "",
        horaire: item.horaire || "",
        heureFin: item.heureFin || "",
        lieu: item.lieu || "",
        description: item.description || "",
        photoData: item.photoData || "",
        _order: newIdx,
      };
      if (existingIdx >= 0) updatedEvents[existingIdx] = materialized;
      else updatedEvents.push(materialized);
    });
    setAllEvents(updatedEvents);
    await persistAll(updatedEvents, undefined, undefined);
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target.result);
      setForm(f => ({ ...f, photoData: compressed }));
    };
    reader.readAsDataURL(file);
  }

  const jours = [
    { key: "dimanche", label: t.dimanche },
    { key: "lundi", label: t.lundi },
    { key: "mardi", label: t.mardi },
    { key: "mercredi", label: t.mercredi },
    { key: "jeudi", label: t.jeudi },
    { key: "vendredi", label: t.vendredi },
    { key: "samedi", label: t.samedi },
  ];

  return (
    <div style={{ padding: "16px 12px 80px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontWeight: 800, color: C.navy, fontSize: 16, marginBottom: 8 }}>🕯️ Horaire des Tfilot — Tous les jours</div>
        <Card>
          <div style={{ padding: "14px 16px" }}>
            <Row label="☀️ Chakharit" value="08:00" bold />
            <Row label="📚 Chiour avec Rabbi Yossef" value="09:00" bold />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
              <span style={{ color: C.gray, fontSize: 13 }}>🙏 Minha suivie de Arvit</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.navy }}>{minhaTime || "—"}</span>
                {isAdmin && (
                  <button onClick={() => { setMinhaInput(minhaOverride || ""); setShowMinhaEdit(true); }} style={{ background: C.lightGray, color: C.navy, borderRadius: 6, padding: "2px 7px", fontSize: 11 }}>✏️</button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ fontWeight: 800, color: C.navy, fontSize: 16, marginBottom: 8 }}>📅 Événements par jour</div>

      {weekIds.map(weekId => (
        <WeekBlock
          key={weekId}
          weekId={weekId}
          isAdmin={isAdmin}
          t={t}
          events={allEvents.filter(e => e.semaine === weekId)}
          dayExtras={allExtras[weekId] || {}}
          onAdd={(jourKey) => openAdd(weekId, jourKey)}
          onEdit={openEdit}
          onEditDefault={openEditDefault}
          onDelete={del}
          onMove={move}
          onExtrasEdit={(jourKey) => openExtrasEdit(weekId, jourKey)}
        />
      ))}

      {showMinhaEdit && (
        <Modal>
          <h3 style={{ color: C.navy, marginBottom: 12 }}>Heure de Minha</h3>
          <label style={lbl}>Heure personnalisée (laisser vide pour calcul automatique)</label>
          <input type="time" value={minhaInput} onChange={e => setMinhaInput(e.target.value)} style={inp} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={resetMinha} style={{ flex: 1, padding: 10, background: C.lightGray, color: C.gray, borderRadius: 8, fontSize: 13 }}>Revenir au calcul auto</button>
            <button onClick={saveMinha} style={{ flex: 1, padding: 10, background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, color: C.skyBlueLight, borderRadius: 8, fontWeight: 700, fontSize: 13 }}>{t.save}</button>
          </div>
          <button onClick={() => setShowMinhaEdit(false)} style={{ width: "100%", marginTop: 8, padding: 10, background: "transparent", color: C.gray, borderRadius: 8, fontSize: 13 }}>{t.cancel}</button>
        </Modal>
      )}

      {showExtrasEdit && (
        <Modal>
          <h3 style={{ color: C.navy, marginBottom: 12 }}>Seouda / Petit-déj — {jours.find(j => j.key === showExtrasEdit.jour)?.label}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input type="checkbox" checked={extrasForm.seoudaEnabled} onChange={e => setExtrasForm(f => ({ ...f, seoudaEnabled: e.target.checked }))} id="seoudaEnabled" />
            <label htmlFor="seoudaEnabled" style={{ fontSize: 14 }}>🍞 Seouda après Arvit</label>
          </div>
          {extrasForm.seoudaEnabled && (
            <textarea value={extrasForm.seoudaTexte} onChange={e => setExtrasForm(f => ({ ...f, seoudaTexte: e.target.value }))} style={{ ...inp, height: 60, resize: "vertical", marginBottom: 12 }} placeholder="Ex: Seouda offerte par la famille Cohen..." />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input type="checkbox" checked={extrasForm.petitDejEnabled} onChange={e => setExtrasForm(f => ({ ...f, petitDejEnabled: e.target.checked }))} id="petitDejEnabled" />
            <label htmlFor="petitDejEnabled" style={{ fontSize: 14 }}>🥐 Petit-déjeuner</label>
          </div>
          {extrasForm.petitDejEnabled && (
            <textarea value={extrasForm.petitDejTexte} onChange={e => setExtrasForm(f => ({ ...f, petitDejTexte: e.target.value }))} style={{ ...inp, height: 60, resize: "vertical", marginBottom: 12 }} placeholder="Ex: Petit-déjeuner après Chakharit..." />
          )}
          <ModalButtons onCancel={() => setShowExtrasEdit(null)} onSave={saveExtras} t={t} />
        </Modal>
      )}

      {showForm && (
        <Modal>
          <h3 style={{ color: C.navy, marginBottom: 12 }}>{t.ajouterCreneau}</h3>
          <label style={lbl}>{t.jourSemaine}</label>
          <select value={form.jour} onChange={e => setForm(f => ({ ...f, jour: e.target.value }))} style={inp}>
            {jours.map(j => <option key={j.key} value={j.key}>{j.label}</option>)}
          </select>
          <label style={lbl}>{t.intitule}</label>
          <input value={form.intitule || ""} onChange={e => setForm(f => ({ ...f, intitule: e.target.value }))} style={inp} placeholder="Ex: Chiour Rav Yaacov" />
          <PhotoInput photoData={form.photoData} onChange={d => setForm(f => ({ ...f, photoData: d }))} t={t} />
          <label style={lbl}>{t.date} <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 12 }}>(optionnel, date ou texte libre)</span></label>
          <input type="text" value={form.date || ""} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} placeholder="Ex: 25/06/2026" />
          <label style={lbl}>{t.horaire}</label>
          <input type="time" value={form.horaire || ""} onChange={e => setForm(f => ({ ...f, horaire: e.target.value }))} style={inp} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
            <input type="checkbox" checked={form.showHeureFin || false} onChange={e => setForm(f => ({ ...f, showHeureFin: e.target.checked }))} id="heureFinProg" />
            <label htmlFor="heureFinProg" style={{ fontSize: 14 }}>🕐 Ajouter une heure de fin</label>
          </div>
          {form.showHeureFin && (
            <>
              <label style={lbl}>Heure de fin</label>
              <input type="time" value={form.heureFin || ""} onChange={e => setForm(f => ({ ...f, heureFin: e.target.value }))} style={inp} />
            </>
          )}
          <label style={lbl}>{t.lieuOptionnel}</label>
          <input value={form.lieu || ""} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))} style={inp} placeholder="Ex: Salle principale" />
          <label style={lbl}>Description <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 12 }}>(optionnel)</span></label>
          <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inp, height: 70, resize: "vertical" }} placeholder="Détails de l'événement..." />
          <ModalButtons onCancel={() => setShowForm(false)} onSave={save} t={t} />
        </Modal>
      )}
    </div>
  );
}

// ─── BOÎTE À OUTILS TAB (Prières) ────────────────────────────────────────────
function FormatSelector({ onSelect }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 18, padding: 26, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>📖</div>
        <h3 style={{ color: C.navy, marginBottom: 6, fontSize: 18 }}>Comment souhaitez-vous lire les prières ?</h3>
        <p style={{ color: C.gray, fontSize: 13, marginBottom: 18 }}>Vous pourrez changer ce choix à tout moment.</p>
        <button onClick={() => onSelect("hebreu")} style={{ width: "100%", padding: 12, marginBottom: 8, background: C.lightGray, color: C.navy, borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
          א Hébreu uniquement
        </button>
        <button onClick={() => onSelect("phonetique")} style={{ width: "100%", padding: 12, marginBottom: 8, background: C.lightGray, color: C.navy, borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
          Aa Hébreu + phonétique
        </button>
        <button onClick={() => onSelect("francais")} style={{ width: "100%", padding: 12, background: `linear-gradient(135deg, ${C.skyBlue}, #3a9cc8)`, color: C.white, borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
          🇫🇷 Hébreu + traduction française
        </button>
      </div>
    </div>
  );
}

// Generates a shareable card for a Sidour prayer: Hebrew text + French translation + Motskin02 logo
async function generatePriereShareCard(priere) {
  const W = 800;
  const PAD = 44;
  const MAX_SAFE_HEIGHT = 8000; // stays well within mobile browser canvas limits
  // No truncation: every word of the prayer is kept; font size adapts so very long
  // prayers (e.g. Birkat HaMazon) still fit within a safely renderable canvas height.
  const hebFull = priere.hebreu;
  const fraFull = priere.francais;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Wrap text respecting existing paragraph breaks (e.g. Birkat HaMazon's blessing breaks)
  function wrapLines(text, maxWidth) {
    const paragraphs = text.split("\n");
    const lines = [];
    paragraphs.forEach(para => {
      if (para.trim() === "") { lines.push(""); return; }
      const words = para.split(" ");
      let line = "";
      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + " ";
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          lines.push(line.trim());
          line = words[i] + " ";
        } else {
          line = test;
        }
      }
      if (line.trim()) lines.push(line.trim());
    });
    return lines;
  }

  const headerH = 150;
  const sepH = 30;
  const footerH = 70;

  // Try progressively smaller font sizes until the full text fits within MAX_SAFE_HEIGHT
  const sizeSteps = [
    { heb: 30, hebLineH: 42, fra: 24, fraLineH: 34 },
    { heb: 24, hebLineH: 34, fra: 19, fraLineH: 27 },
    { heb: 19, hebLineH: 27, fra: 15, fraLineH: 21 },
    { heb: 15, hebLineH: 21, fra: 12, fraLineH: 17 },
    { heb: 12, hebLineH: 17, fra: 10, fraLineH: 14 },
  ];

  let chosen = sizeSteps[sizeSteps.length - 1];
  let hebLines, fraLines, H;
  for (const step of sizeSteps) {
    ctx.font = `italic ${step.fra}px Arial, sans-serif`;
    const tryFraLines = wrapLines(fraFull, W - PAD * 2);
    ctx.font = `${step.heb}px 'Arial Hebrew', 'Times New Roman', serif`;
    const tryHebLines = wrapLines(hebFull, W - PAD * 2 - 20);
    const tryH = headerH + tryHebLines.length * step.hebLineH + sepH + tryFraLines.length * step.fraLineH + footerH + PAD;
    if (tryH <= MAX_SAFE_HEIGHT) {
      chosen = step;
      hebLines = tryHebLines;
      fraLines = tryFraLines;
      H = tryH;
      break;
    }
    // keep the smallest as fallback in case nothing fits (extremely long text)
    chosen = step;
    hebLines = tryHebLines;
    fraLines = tryFraLines;
    H = tryH;
  }

  const hebLineH = chosen.hebLineH;
  const fraLineH = chosen.fraLineH;

  canvas.width = W;
  canvas.height = H;

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, "#f0f4f8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  let y = 0;

  // Header band with logo + titles
  ctx.fillStyle = "#1a2e52";
  ctx.fillRect(0, 0, W, headerH);

  const logoImg = await new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = LOGO_SRC;
  });
  if (logoImg) {
    const logoSize = 86;
    ctx.save();
    ctx.beginPath();
    ctx.arc(PAD + logoSize / 2, headerH / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, PAD, headerH / 2 - logoSize / 2, logoSize, logoSize);
    ctx.restore();
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.fillText(priere.titre, PAD + 104, headerH / 2 - 6);
  if (priere.titreHebreu) {
    ctx.font = "26px 'Arial Hebrew', 'Times New Roman', serif";
    ctx.fillStyle = "#a8ddf4";
    // RTL draw: align right edge manually since canvas RTL support is inconsistent
    ctx.textAlign = "right";
    const availableW = W - PAD - (PAD + 104 + ctx.measureText(priere.titre).width);
    let hebTitle = priere.titreHebreu;
    ctx.font = "bold 30px Arial, sans-serif"; // measure against title width isn't needed; just cap width directly
    ctx.font = "26px 'Arial Hebrew', 'Times New Roman', serif";
    while (ctx.measureText(hebTitle).width > W - PAD * 2 - 110 && hebTitle.length > 4) {
      hebTitle = hebTitle.slice(0, -1);
    }
    ctx.fillText(hebTitle, W - PAD, headerH / 2 - 6);
    ctx.textAlign = "left";
  }
  ctx.font = "16px Arial, sans-serif";
  ctx.fillStyle = "#a8ddf4";
  ctx.fillText(priere.sousTitre || "", PAD + 104, headerH / 2 + 22);

  y = headerH + 36;

  // Hebrew block (right-aligned, RTL feel)
  ctx.font = `${chosen.heb}px 'Arial Hebrew', 'Times New Roman', serif`;
  ctx.fillStyle = "#1a2e52";
  ctx.textAlign = "right";
  hebLines.forEach(line => {
    ctx.fillText(line, W - PAD, y);
    y += hebLineH;
  });

  y += sepH / 2;
  ctx.strokeStyle = "#5bbfea55";
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += sepH / 2 + 14;

  // French block (left-aligned)
  ctx.font = `italic ${chosen.fra}px Arial, sans-serif`;
  ctx.fillStyle = "#374151";
  ctx.textAlign = "left";
  fraLines.forEach(line => {
    ctx.fillText(line, PAD, y);
    y += fraLineH;
  });

  // Footer
  y = H - footerH / 2;
  ctx.textAlign = "center";
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillStyle = "#1a2e52";
  ctx.fillText("🇮🇱 Beth Haknesset Motskin02", W / 2, y);

  return canvas.toDataURL("image/jpeg", 0.9);
}

async function sharePriere(priere) {
  try {
    const cardDataUrl = await generatePriereShareCard(priere);
    await shareCardImage(cardDataUrl, priere.titre);
  } catch (e) {
    console.error("Share card error:", e);
    shareAsText(priere.titre, [priere.francais.slice(0, 200)]);
  }
}

function PrayerDetail({ priere, format, onBack, onChangeFormat }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: C.lightGray, zIndex: 350, overflowY: "auto" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, padding: "16px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", color: C.white, borderRadius: 8, padding: "8px 12px", fontSize: 14 }}>← Retour</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 16 }}>{priere.icone} {priere.titre}</div>
          {priere.titreHebreu && <div dir="rtl" style={{ color: C.skyBlueLight, fontSize: 13, fontFamily: "serif" }}>{priere.titreHebreu}</div>}
          <div style={{ color: C.skyBlueLight, fontSize: 11 }}>{priere.sousTitre}</div>
        </div>
        <button onClick={onChangeFormat} style={{ background: "rgba(255,255,255,0.2)", color: C.white, borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>⚙️</button>
      </div>

      <div style={{ padding: "20px 18px 60px" }}>
        <div style={{ background: C.white, borderRadius: 14, padding: "20px 18px", marginBottom: format !== "hebreu" ? 16 : 0, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div dir="rtl" style={{ fontSize: 21, lineHeight: 1.9, color: C.navy, whiteSpace: "pre-wrap", fontFamily: "serif" }}>
            {priere.hebreu}
          </div>
        </div>

        {format === "phonetique" && (
          <div style={{ background: `${C.skyBlue}11`, borderRadius: 14, padding: "18px 16px", border: `1px solid ${C.skyBlue}33` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Transcription phonétique</div>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", fontStyle: "italic" }}>
              {priere.phonetique}
            </div>
          </div>
        )}

        {format === "francais" && (
          <div style={{ background: `${C.skyBlue}11`, borderRadius: 14, padding: "18px 16px", border: `1px solid ${C.skyBlue}33` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Traduction française</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>
              {priere.francais}
            </div>
          </div>
        )}

        <button
          onClick={() => sharePriere(priere)}
          style={{ width: "100%", marginTop: 16, padding: 12, background: "#25D366", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none" }}
        >
          💬 Partager
        </button>
      </div>
    </div>
  );
}

function BoiteAOutilsTab({ t }) {
  const [format, setFormat] = useState(null); // null until chosen
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [selectedPriere, setSelectedPriere] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("priereFormat");
    if (saved) setFormat(saved);
    else setShowFormatPicker(true);
  }, []);

  function chooseFormat(f) {
    setFormat(f);
    localStorage.setItem("priereFormat", f);
    setShowFormatPicker(false);
  }

  return (
    <div style={{ padding: "16px 12px 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #1e3d6e)`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, color: C.white, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>📔 Sidour</div>
        <div style={{ fontSize: 12, color: C.skyBlueLight, marginTop: 2 }}>Prières et bénédictions — nousah Edot HaMizrah</div>
      </div>

      {PRIERES.map(p => (
        <button
          key={p.id}
          onClick={() => setSelectedPriere(p)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14,
            background: C.white, borderRadius: 12, padding: "14px 16px", marginBottom: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1px solid ${C.skyBlue}22`, textAlign: "left",
          }}
        >
          <span style={{ fontSize: 26 }}>{p.icone}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{p.titre}</div>
            {p.titreHebreu && <div dir="rtl" style={{ fontSize: 13, color: C.navy, marginTop: 1, fontFamily: "serif" }}>{p.titreHebreu}</div>}
            <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>{p.sousTitre}</div>
          </div>
          <span style={{ color: C.skyBlue, fontSize: 18 }}>›</span>
        </button>
      ))}

      {showFormatPicker && <FormatSelector onSelect={chooseFormat} />}

      {selectedPriere && format && (
        <PrayerDetail
          priere={selectedPriere}
          format={format}
          onBack={() => setSelectedPriere(null)}
          onChangeFormat={() => setShowFormatPicker(true)}
        />
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("fr");
  const [tab, setTab] = useState("pensee");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const t = T[lang];

  const handleAdminClick = () => isAdmin ? setIsAdmin(false) : setShowAdminModal(true);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.lightGray }}>
      <style>{globalCSS}</style>
      <Header lang={lang} setLang={setLang} isAdmin={isAdmin} t={t} onAdminClick={handleAdminClick} />
      {showAdminModal && <AdminModal t={t} onLogin={() => { setIsAdmin(true); setShowAdminModal(false); }} onClose={() => setShowAdminModal(false)} />}
      <div style={{ direction: lang === "he" ? "rtl" : "ltr" }}>
        <div style={{display: tab === "pensee" ? "block" : "none"}}><PenseeTab isAdmin={isAdmin} t={t} activeTab={tab} lang={lang} onAdminClick={handleAdminClick} /></div>
        <div style={{display: tab === "programme" ? "block" : "none"}}><ProgrammeTab isAdmin={isAdmin} t={t} activeTab={tab} lang={lang} /></div>
        <div style={{display: tab === "shabbat" ? "block" : "none"}}><ShabbatTab isAdmin={isAdmin} t={t} activeTab={tab} /></div>
        <div style={{display: tab === "activites" ? "block" : "none"}}><ActivitesTab isAdmin={isAdmin} t={t} activeTab={tab} /></div>
        <div style={{display: tab === "annonces" ? "block" : "none"}}><AnnoncesTab isAdmin={isAdmin} t={t} activeTab={tab} /></div>
        <div style={{display: tab === "boiteaoutils" ? "block" : "none"}}><BoiteAOutilsTab t={t} /></div>
        <div style={{display: tab === "location" ? "block" : "none"}}><LocationTab isAdmin={isAdmin} t={t} activeTab={tab} /></div>
        {tab === "reglements" && <ReglementsTab t={t} />}
      </div>
      <TabBar tab={tab} setTab={setTab} t={t} lang={lang} />
    </div>
  );
}
