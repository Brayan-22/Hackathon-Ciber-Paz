// background/service-worker.js
// MV3 (Chrome); in Firefox (MV2) this runs as a background script.
const SETTINGS_KEY = 'user_settings_v1';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get([SETTINGS_KEY], ({ [SETTINGS_KEY]: s }) => {
    if (!s) {
      const defaults = {
        fontScale: 1.0,
        colorTheme: "default",
        highlightLinks: true,
        ttsEnabled: true,
        keyboardNav: true,
        shortcuts: {
          toggleTTS: "Alt+T",
          increaseFont: "Alt+Plus",
          decreaseFont: "Alt+Minus"
        }
      };
      const data = {};
      data[SETTINGS_KEY] = defaults;
      chrome.storage.sync.set(data);
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "storage:get") {
    chrome.storage.sync.get([SETTINGS_KEY], (res) => {
      sendResponse({ ok: true, value: res[SETTINGS_KEY] });
    });
    return true;
  }
  if (msg?.type === "storage:set") {
    const data = {};
    data[SETTINGS_KEY] = msg.value;
    chrome.storage.sync.set(data, () => sendResponse({ ok: true }));
    return true;
  }

  if (msg?.type === "tts:speak") {
    // Fallback TTS using chrome.tts if speechSynthesis fails in page context
    try {
      chrome.tts.speak(msg.text || "", {
        lang: msg.lang || "es-ES",
        rate: 1.0,
        enqueue: false
      }, () => sendResponse({ ok: true }));
    } catch (e) {
      sendResponse({ ok: false, error: e?.message });
    }
    return true;
  }

  if (msg?.type === "toggleFeature") {
    // Example: enable/disable features
    sendResponse({ ok: true });
  }
});