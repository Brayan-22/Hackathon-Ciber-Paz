// options/options.js
(async function() {
  // Load storage utility script dynamically
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('../utils/storage.js');
  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const { getSettings, setSettings } = window.WAU_Storage;
  const $ = (sel) => document.querySelector(sel);

  const shortcutTts = $('#shortcut-tts');
  const shortcutPlus = $('#shortcut-plus');
  const shortcutMinus = $('#shortcut-minus');
  const prefTelemetry = $('#pref-telemetry');
  const status = $('#status');
  const form = $('#form');

  async function hydrate() {
    const s = await getSettings();
    shortcutTts.value = s?.shortcuts?.toggleTTS || "Alt+T";
    shortcutPlus.value = s?.shortcuts?.increaseFont || "Alt+Plus";
    shortcutMinus.value = s?.shortcuts?.decreaseFont || "Alt+Minus";
    status.textContent = "";
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const s = await getSettings();
    s.shortcuts = {
      toggleTTS: shortcutTts.value || "Alt+T",
      increaseFont: shortcutPlus.value || "Alt+Plus",
      decreaseFont: shortcutMinus.value || "Alt+Minus"
    };
    await setSettings(s);
    status.textContent = "Guardado.";
    setTimeout(() => status.textContent = "", 1200);
  });

  hydrate();
})();