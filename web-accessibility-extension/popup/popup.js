// popup/popup.js
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
  const fontScale = $('#font-scale');
  const fontScaleOut = $('#font-scale-out');
  const colorTheme = $('#color-theme');
  const highlightLinks = $('#highlight-links');
  const ttsEnabled = $('#tts-enabled');
  const keyboardNav = $('#keyboard-nav');
  const openOptions = $('#open-options');

  async function hydrate() {
    const s = await getSettings();
    fontScale.value = s.fontScale || 1.0;
    fontScaleOut.textContent = s.fontScale?.toFixed?.(1) || '1.0';
    colorTheme.value = s.colorTheme || 'default';
    highlightLinks.checked = !!s.highlightLinks;
    ttsEnabled.checked = !!s.ttsEnabled;
    keyboardNav.checked = !!s.keyboardNav;
  }

  function broadcast(partial) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'settings:update', value: partial });
      }
    });
  }

  fontScale.addEventListener('input', async () => {
    const v = Number(fontScale.value);
    fontScaleOut.textContent = v.toFixed(1);
    const s = await getSettings();
    s.fontScale = v;
    await setSettings(s);
    broadcast({ fontScale: v });
  });

  colorTheme.addEventListener('change', async () => {
    const s = await getSettings();
    s.colorTheme = colorTheme.value;
    await setSettings(s);
    broadcast({ colorTheme: s.colorTheme });
  });

  for (const [el, key] of [[highlightLinks,'highlightLinks'], [ttsEnabled,'ttsEnabled'], [keyboardNav,'keyboardNav']]) {
    el.addEventListener('change', async () => {
      const s = await getSettings();
      s[key] = el.checked;
      await setSettings(s);
      const partial = {}; partial[key] = el.checked;
      broadcast(partial);
    });
  }

  openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());
  hydrate();
})();