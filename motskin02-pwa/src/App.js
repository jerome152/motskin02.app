
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
  },
};

const KEYS = { shabbatEvents: "m02_shabbat", activities: "m02_activities", locations: "m02_locations", annonces: "m02_annonces" };

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

// Compress image to max ~400KB before saving
async function compressImage(base64Data, maxWidth = 800, quality = 0.7) {
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
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64Data);
    img.src = base64Data;
  });
}

async function saveData(collectionName, dataArray) {
  // Save to localStorage immediately
  try { localStorage.setItem(collectionName, JSON.stringify(dataArray)); } catch {}
  // Save to Firestore (photos are already compressed at upload time)
  try {
    await Promise.all(dataArray.map((item, idx) => 
      setDoc(doc(db, collectionName, item.id), { ...item, _order: idx })
    ));
  } catch(e) { console.error("Firebase save error:", e); }
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
        <button onClick={onAdminClick}
          style={{ background: isAdmin ? C.white : "rgba(255,255,255,0.15)", color: isAdmin ? C.navy : C.white, border: "1px solid rgba(255,255,255,0.5)", borderRadius: 20, padding: "4px 10px", fontSize: 12 }}>
          {isAdmin ? t.logout : t.admin}
        </button>
      </div>
    </header>
  );
}

function TabBar({ tab, setTab, t }) {
  const tabs = [
    { key: "shabbat", icon: "🇮🇱", label: t.shabbatFetes },
    { key: "activites", icon: "📅", label: t.activites },
    { key: "annonces", icon: "📢", label: t.annonces },
    { key: "location", icon: "🏛️", label: t.location },
    { key: "reglements", icon: "💳", label: t.reglements },
  ];
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `2px solid ${C.skyBlue}`, display: "flex", zIndex: 100, boxShadow: "0 -2px 10px rgba(0,0,0,0.1)" }}>
      {tabs.map(tb => (
        <button key={tb.key} onClick={() => setTab(tb.key)} style={{
          flex: 1, padding: "8px 4px 10px",
          background: tab === tb.key ? `linear-gradient(180deg, ${C.navy} 0%, #1e3d6e 100%)` : "transparent",
          color: tab === tb.key ? C.skyBlueLight : C.gray,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 20 }}>{tb.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{tb.label}</span>
        </button>
      ))}
    </nav>
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
    const entry = { ...form, id: editing || Date.now().toString(), minhaBefore: addMinutes(form.entree, -5, true), minhaAfternoon: addMinutes(form.sortie, -90, true), arvit: addMinutes(form.sortie, -10, true) };
    const updated = editing ? events.map(e => e.id === editing ? entry : e) : [entry, ...events];
    setEvents(updated);
    await saveData(KEYS.shabbatEvents, updated);
    setShowForm(false);
  }

  async function del(id) {
    if (!confirm("Supprimer ?")) return;
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    await deleteItem(KEYS.shabbatEvents, id);
    await saveData(KEYS.shabbatEvents, updated);
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
              {isAdmin && <AdminBtns onEdit={() => openEdit(ev)} onDelete={() => del(ev.id)} t={t} />}
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
    const entry = { ...form, id: editing || Date.now().toString() };
    const updated = editing ? events.map(e => e.id === editing ? entry : e) : [entry, ...events];
    setEvents(updated); await saveData(KEYS.activities, updated); setShowForm(false);
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
            {isAdmin && <AdminBtns onUp={() => move(idx, -1)} onDown={() => move(idx, 1)} onEdit={() => { setForm({ ...ev, description: ev.description || "" }); setEditing(ev.id); setShowForm(true); }} onDelete={() => del(ev.id)} t={t} />}
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
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`📢 *${a.prenom} ${a.nom}* (${a.date}):\n\n${a.texte}`)}`}
              target="_blank" rel="noopener"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", padding: "7px 14px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}
            >
              <span>💬</span> Partager sur WhatsApp
            </a>
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

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("fr");
  const [tab, setTab] = useState("shabbat");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const t = T[lang];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.lightGray }}>
      <style>{globalCSS}</style>
      <Header lang={lang} setLang={setLang} isAdmin={isAdmin} t={t}
        onAdminClick={() => isAdmin ? setIsAdmin(false) : setShowAdminModal(true)} />
      {showAdminModal && <AdminModal t={t} onLogin={() => { setIsAdmin(true); setShowAdminModal(false); }} onClose={() => setShowAdminModal(false)} />}
      <div style={{ direction: lang === "he" ? "rtl" : "ltr" }}>
        {tab === "shabbat" && <ShabbatTab isAdmin={isAdmin} t={t} />}
        {tab === "activites" && <ActivitesTab isAdmin={isAdmin} t={t} />}
        {tab === "location" && <LocationTab isAdmin={isAdmin} t={t} />}
        {tab === "annonces" && <AnnoncesTab isAdmin={isAdmin} t={t} />}
        {tab === "reglements" && <ReglementsTab t={t} />}
      </div>
      <TabBar tab={tab} setTab={setTab} t={t} />
    </div>
  );
}
