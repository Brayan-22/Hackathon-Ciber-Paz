// utils/storage.js
const KEY = 'user_settings_v1';

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([KEY], (res) => {
      resolve(res[KEY] || {
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
      });
    });
  });
}

async function setSettings(value) {
  return new Promise((resolve) => {
    const data = {}; data[KEY] = value;
    chrome.storage.sync.set(data, resolve);
  });
}

// Export to window for content scripts
if (typeof window !== 'undefined') {
  window.WAU_Storage = { getSettings, setSettings };
}