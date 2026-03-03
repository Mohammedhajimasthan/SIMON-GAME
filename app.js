/**************** CONFIG ****************/
// Turn voice ON or OFF here
const VOICE_ENABLED = true;      // true = try voice, false = emoji/text only
const ONLINE_MODE   = true;      // true when hosted online

/**************** ELEMENTS ****************/
const pads = document.querySelectorAll(".pad");
const startBtn = document.getElementById("startBtn");
const aiText = document.getElementById("aiText");
const levelText = document.getElementById("level");
const langSelect = document.getElementById("langSelect");
const modeBtn = document.getElementById("modeBtn");

/**************** GAME STATE ****************/
let seq = [];
let user = [];
let level = 0;
let playing = false;

/**************** RANDOM THEME ****************/
const themes = ["theme1","theme2","theme3"];
document.body.classList.add(themes[Math.floor(Math.random()*themes.length)]);

/**************** DARK MODE ****************/
modeBtn.onclick = () => document.body.classList.toggle("dark");

/**************** 🌍 LANGUAGE PACK ****************/
const LANGS = {
  en: {
    name: "English",
    code: "en-US",
    start: ["Let’s go 😎🔥", "Brain ready? 🧠😏"],
    win: ["Nice one 👏🤖", "AI impressed 😎✨"],
    lose: ["Oops 😭💀", "That hurt my circuits 🤖⚡"]
  },
  hi: {
    name: "हिन्दी",
    code: "hi-IN",
    start: ["चलो शुरू करें 😄🔥"],
    win: ["वाह! कमाल 👏😎"],
    lose: ["अरे यार 😭💔"]
  },
  fr: {
    name: "Français",
    code: "fr-FR",
    start: ["C’est parti 😎🇫🇷"],
    win: ["Bien joué 👏✨"],
    lose: ["Oups 😅💥"]
  },
//   ta: {
//     name: "தமிழ்",
//     code: "ta-IN",
//     start: ["விளையாடலாம் 😄🎮"],
//     win: ["சூப்பர் 👏🔥"],
//     lose: ["அய்யோ 😭💔"]
//   },
//   te: {
//     name: "తెలుగు",
//     code: "te-IN",
//     start: ["ఆడుదాం 😄🎮"],
//     win: ["బాగా చేసావు 👏🔥"],
//     lose: ["అయ్యో 😭💔"]
//   },
  es: {
    name: "Español",
    code: "es-ES",
    start: ["Vamos 😎🔥"],
    win: ["Muy bien 👏✨"],
    lose: ["Ay no 😭💥"]
  },
  ja: {
    name: "日本語",
    code: "ja-JP",
    start: ["始めよう 😄🎮"],
    win: ["すごい 👏✨"],
    lose: ["ああ 😭💥"]
  }
};

let currentLang = "en";

/**************** LANGUAGE SELECT ****************/
Object.keys(LANGS).forEach(k => {
  const opt = document.createElement("option");
  opt.value = k;
  opt.textContent = LANGS[k].name;
  langSelect.appendChild(opt);
});

langSelect.onchange = () => {
  currentLang = langSelect.value;
  respond("start");
};

/**************** GAME ****************/
startBtn.onclick = startGame;
pads.forEach((pad, i) => pad.onclick = () => press(i));

function startGame() {
  seq = [];
  user = [];
  level = 0;
  playing = true;
  respond("start");
  next();
}

function next() {
  user = [];
  level++;
  levelText.textContent = `Level: ${level}`;
  seq.push(Math.floor(Math.random() * 4));
  playSeq();
}

function playSeq() {
  let i = 0;
  const t = setInterval(() => {
    flash(pads[seq[i]]);
    i++;
    if (i >= seq.length) clearInterval(t);
  }, 600);
}

function press(i) {
  if (!playing) return;
  flash(pads[i]);
  user.push(i);

  const idx = user.length - 1;
  if (user[idx] !== seq[idx]) {
    respond("lose");
    playing = false;
    return;
  }

  if (user.length === seq.length) {
    respond("win");
    setTimeout(next, 900);
  }
}

function flash(el) {
  el.classList.add("active");
  setTimeout(() => el.classList.remove("active"), 300);
}

/**************** 🤖 AI RESPONSE ****************/
function respond(type) {
  const pack = LANGS[currentLang];
  const msg = pack[type][Math.floor(Math.random() * pack[type].length)];
  aiText.textContent = msg;

  if (VOICE_ENABLED) {
    speak(msg, pack.code);
  }
}

/**************** 🔊 AI VOICE (SMART) ****************/
function speak(text, langCode) {
  if (!("speechSynthesis" in window)) return;

  const voices = speechSynthesis.getVoices();
  const nativeVoice = voices.find(v => v.lang === langCode);

  // OFFLINE NATIVE VOICE
  if (nativeVoice) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = nativeVoice;
    utter.lang = langCode;
    utter.rate = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
    return;
  }

  // ONLINE FALLBACK (ALL LANGUAGES)
  if (ONLINE_MODE) {
    const audio = new Audio(
      `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${langCode}`
    );
    audio.play();
  }
}
