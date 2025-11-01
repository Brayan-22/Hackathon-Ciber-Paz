// content/floating-widget.js
// Floating accessibility widget shown on bottom-right corner
(function() {
  'use strict';

  // Prevent multiple instances
  if (window.__WAU_WIDGET_LOADED__) return;
  window.__WAU_WIDGET_LOADED__ = true;

  const WIDGET_ID = 'wau-floating-widget';
  const PANEL_ID = 'wau-floating-panel';

  let settings = {
    fontScale: 1.0,
    colorTheme: "default",
    highlightLinks: true,
    ttsEnabled: true,
    keyboardNav: true
  };

  // Create widget button
  function createWidget() {
    if (document.getElementById(WIDGET_ID)) return;

    const button = document.createElement('button');
    button.id = WIDGET_ID;
    button.setAttribute('aria-label', 'Abrir panel de accesibilidad');
    button.setAttribute('type', 'button');
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z" fill="currentColor"/>
      </svg>
    `;
    
    button.addEventListener('click', togglePanel);
    document.body.appendChild(button);
    
    return button;
  }

  // Create floating panel
  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Panel de accesibilidad');
    panel.style.display = 'none';

    panel.innerHTML = `
      <div class="wau-panel-header">
        <h2>Accesibilidad</h2>
        <button id="wau-close-panel" aria-label="Cerrar panel" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="wau-panel-content">
        <section class="wau-section">
          <h3>Tamaño de texto</h3>
          <div class="wau-control-group">
            <button id="wau-decrease-font" type="button" aria-label="Disminuir tamaño de texto">A-</button>
            <span id="wau-font-value" aria-live="polite">100%</span>
            <button id="wau-increase-font" type="button" aria-label="Aumentar tamaño de texto">A+</button>
          </div>
          <input 
            id="wau-font-slider" 
            type="range" 
            min="0.8" 
            max="2.0" 
            step="0.1" 
            value="1.0"
            aria-label="Control deslizante de tamaño de texto"
          />
        </section>

        <section class="wau-section">
          <h3>Tema de color</h3>
          <select id="wau-theme-select" aria-label="Seleccionar tema de color">
            <option value="default">Predeterminado</option>
            <option value="high-contrast">Alto contraste</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
          </select>
        </section>

        <section class="wau-section">
          <h3>Opciones</h3>
          <label class="wau-checkbox-label">
            <input id="wau-highlight-links" type="checkbox" />
            <span>Resaltar enlaces</span>
          </label>
          <label class="wau-checkbox-label">
            <input id="wau-tts-enabled" type="checkbox" />
            <span>Lectura por voz (TTS)</span>
          </label>
          <label class="wau-checkbox-label">
            <input id="wau-keyboard-nav" type="checkbox" />
            <span>Navegación por teclado</span>
          </label>
        </section>

        <section class="wau-section">
          <button id="wau-reset-settings" type="button" class="wau-btn-secondary">
            Restablecer ajustes
          </button>
        </section>
      </div>
    `;

    document.body.appendChild(panel);
    attachEventListeners(panel);
    
    return panel;
  }

  // Toggle panel visibility
  function togglePanel() {
    const panel = document.getElementById(PANEL_ID) || createPanel();
    const isHidden = panel.style.display === 'none';
    
    panel.style.display = isHidden ? 'block' : 'none';
    
    if (isHidden) {
      panel.focus();
      loadSettings();
    }
  }

  // Close panel
  function closePanel() {
    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      panel.style.display = 'none';
    }
  }

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['user_settings_v1']);
      if (result.user_settings_v1) {
        settings = { ...settings, ...result.user_settings_v1 };
        updateUI();
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }

  // Update UI with current settings
  function updateUI() {
    const fontSlider = document.getElementById('wau-font-slider');
    const fontValue = document.getElementById('wau-font-value');
    const themeSelect = document.getElementById('wau-theme-select');
    const highlightLinks = document.getElementById('wau-highlight-links');
    const ttsEnabled = document.getElementById('wau-tts-enabled');
    const keyboardNav = document.getElementById('wau-keyboard-nav');

    if (fontSlider) fontSlider.value = settings.fontScale || 1.0;
    if (fontValue) fontValue.textContent = Math.round((settings.fontScale || 1.0) * 100) + '%';
    if (themeSelect) themeSelect.value = settings.colorTheme || 'default';
    if (highlightLinks) highlightLinks.checked = settings.highlightLinks !== false;
    if (ttsEnabled) ttsEnabled.checked = settings.ttsEnabled !== false;
    if (keyboardNav) keyboardNav.checked = settings.keyboardNav !== false;
  }

  // Save settings to storage
  async function saveSettings() {
    try {
      await chrome.storage.sync.set({ user_settings_v1: settings });
      // Broadcast to content script
      window.postMessage({ 
        type: 'wau:settings:update', 
        value: settings 
      }, '*');
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  // Attach event listeners
  function attachEventListeners(panel) {
    // Close button
    const closeBtn = panel.querySelector('#wau-close-panel');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // Font controls
    const fontSlider = panel.querySelector('#wau-font-slider');
    const fontValue = panel.querySelector('#wau-font-value');
    const decreaseFont = panel.querySelector('#wau-decrease-font');
    const increaseFont = panel.querySelector('#wau-increase-font');

    if (fontSlider) {
      fontSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        settings.fontScale = value;
        if (fontValue) fontValue.textContent = Math.round(value * 100) + '%';
        applyFontScale(value);
        saveSettings();
      });
    }

    if (decreaseFont) {
      decreaseFont.addEventListener('click', () => {
        const newValue = Math.max(0.8, (settings.fontScale || 1.0) - 0.1);
        settings.fontScale = newValue;
        if (fontSlider) fontSlider.value = newValue;
        if (fontValue) fontValue.textContent = Math.round(newValue * 100) + '%';
        applyFontScale(newValue);
        saveSettings();
      });
    }

    if (increaseFont) {
      increaseFont.addEventListener('click', () => {
        const newValue = Math.min(2.0, (settings.fontScale || 1.0) + 0.1);
        settings.fontScale = newValue;
        if (fontSlider) fontSlider.value = newValue;
        if (fontValue) fontValue.textContent = Math.round(newValue * 100) + '%';
        applyFontScale(newValue);
        saveSettings();
      });
    }

    // Theme select
    const themeSelect = panel.querySelector('#wau-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        settings.colorTheme = e.target.value;
        applyTheme(e.target.value);
        saveSettings();
      });
    }

    // Checkboxes
    const highlightLinks = panel.querySelector('#wau-highlight-links');
    if (highlightLinks) {
      highlightLinks.addEventListener('change', (e) => {
        settings.highlightLinks = e.target.checked;
        applyHighlightLinks(e.target.checked);
        saveSettings();
      });
    }

    const ttsEnabled = panel.querySelector('#wau-tts-enabled');
    if (ttsEnabled) {
      ttsEnabled.addEventListener('change', (e) => {
        settings.ttsEnabled = e.target.checked;
        saveSettings();
      });
    }

    const keyboardNav = panel.querySelector('#wau-keyboard-nav');
    if (keyboardNav) {
      keyboardNav.addEventListener('change', (e) => {
        settings.keyboardNav = e.target.checked;
        saveSettings();
      });
    }

    // Reset button
    const resetBtn = panel.querySelector('#wau-reset-settings');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        settings = {
          fontScale: 1.0,
          colorTheme: "default",
          highlightLinks: true,
          ttsEnabled: true,
          keyboardNav: true
        };
        await saveSettings();
        updateUI();
        applyFontScale(1.0);
        applyTheme('default');
        applyHighlightLinks(true);
      });
    }

    // Close on Escape
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    });
  }

  // Apply font scale
  function applyFontScale(scale) {
    document.documentElement.style.fontSize = `${scale}rem`;
  }

  // Apply theme
  function applyTheme(themeName) {
    document.body.setAttribute("data-theme", themeName || "default");
  }

  // Apply highlight links
  function applyHighlightLinks(enabled) {
    document.documentElement.setAttribute('data-highlight-links', enabled ? '1' : '0');
  }

  // Initialize widget
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        createWidget();
        createPanel();
        loadSettings();
      });
    } else {
      createWidget();
      createPanel();
      loadSettings();
    }
  }

  // Start
  init();
})();
