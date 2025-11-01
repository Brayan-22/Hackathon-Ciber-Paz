// content/content-script.js
// Note: utils are loaded as separate scripts in manifest.json
// They export to window object: window.WAU_Storage, window.WAU_TTS, window.WAU_KB

(async () => {
  // Wait for utility scripts to load
  await new Promise(resolve => {
    if (window.WAU_Storage && window.WAU_TTS && window.WAU_KB) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.WAU_Storage && window.WAU_TTS && window.WAU_KB) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    }
  });

  const { getSettings, setSettings } = window.WAU_Storage;
  const TTS = window.WAU_TTS;
  const KB = window.WAU_KB;

  // Initialize TTS
  console.log('[WAU] Inicializando Text-to-Speech...');
  TTS.initTTS().then(ready => {
    if (ready) {
      console.log('[WAU] TTS inicializado correctamente');
    } else {
      console.warn('[WAU] TTS no disponible, usando fallback');
    }
  });

  // Inject CSS assets
  window.__WAU_INJECTOR__?.injectCssFile('content/styles/themes.css');
  window.__WAU_INJECTOR__?.injectCssFile('content/styles/links-highlight.css');
  window.__WAU_INJECTOR__?.injectCssFile('content/styles/floating-widget.css');
  window.__WAU_INJECTOR__?.injectSkipToContent();

  let settings = await getSettings();
  console.log('[WAU] Configuración cargada:', settings);

  // Apply font scale
  const applyFontScale = (scale) => {
    document.documentElement.style.fontSize = `${scale}rem`;
  };
  applyFontScale(settings.fontScale || 1.0);

  // Apply theme
  const applyTheme = (themeName) => {
    document.body.setAttribute("data-theme", themeName || "default");
  };
  applyTheme(settings.colorTheme || "default");

  // MutationObserver for SPA rehydrations
  const mo = new MutationObserver((list) => {
    // Re-apply theme on large DOM changes
    if (list.length > 50) applyTheme(settings.colorTheme);
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // Highlight links option
  const applyHighlightLinks = (on) => {
    document.documentElement.setAttribute('data-highlight-links', on ? '1' : '0');
  };
  applyHighlightLinks(settings.highlightLinks);

  // TTS on focus - improved with better element text extraction for ALL elements
  let ttsEnabled = !!settings.ttsEnabled;
  console.log('[WAU] TTS habilitado en configuración:', ttsEnabled);

  // Exposar función de prueba para debugging
  window.WAU_DEBUG = {
    testTTS: (text) => {
      console.log('[WAU DEBUG] Probando TTS con texto:', text);
      console.log('[WAU DEBUG] ttsEnabled:', ttsEnabled);
      TTS.speak(text || 'Prueba de text to speech');
    },
    enableTTS: () => {
      ttsEnabled = true;
      console.log('[WAU DEBUG] TTS activado manualmente');
    },
    getTTSStatus: () => {
      console.log('[WAU DEBUG] Estado TTS:', {
        ttsEnabled,
        settings: settings.ttsEnabled,
        ttsReady: TTS.isReady()
      });
    }
  };

  let lastSpokenText = '';
  let lastSpokenTime = 0;

  // Helper function to extract meaningful text from any element
  function extractTextFromElement(el) {
    let text = '';

    // Priority 1: ARIA labels (most specific)
    if (el.getAttribute('aria-label')) {
      text = el.getAttribute('aria-label');
    }
    // Priority 2: Title attribute
    else if (el.title) {
      text = el.title;
    }
    // Priority 3: Specific element types
    else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      // For inputs, read the label or placeholder
      const label = el.id ? document.querySelector(`label[for="${el.id}"]`) : null;
      if (label) {
        text = label.innerText || label.textContent;
      } else if (el.placeholder) {
        text = el.placeholder;
      } else if (el.name) {
        text = el.name;
      } else {
        text = 'Campo de entrada';
      }
      // Add the type of input
      if (el.type && text) {
        const typeMap = {
          'text': 'texto',
          'email': 'correo electrónico',
          'password': 'contraseña',
          'tel': 'teléfono',
          'number': 'número',
          'search': 'búsqueda',
          'url': 'URL',
          'date': 'fecha',
          'time': 'hora',
          'textarea': 'área de texto'
        };
        const typeName = typeMap[el.type] || el.type;
        text = `${text}, campo de ${typeName}`;
      }
    }
    else if (el.tagName === 'SELECT') {
      const label = el.id ? document.querySelector(`label[for="${el.id}"]`) : null;
      if (label) {
        text = label.innerText || label.textContent;
      } else if (el.name) {
        text = el.name;
      } else {
        text = 'Selector';
      }
      text = `${text}, menú de selección`;
      // Add current selection
      if (el.selectedOptions && el.selectedOptions[0]) {
        text += `, ${el.selectedOptions[0].text}`;
      }
    }
    else if (el.tagName === 'BUTTON') {
      text = el.innerText || el.textContent || 'Botón';
      if (!text || text === 'Botón') {
        text = 'Botón';
      }
    }
    else if (el.tagName === 'A') {
      text = el.innerText || el.textContent || 'Enlace';
      // Only add "enlace" suffix if not already in text
      if (text && !text.toLowerCase().includes('enlace')) {
        text = `${text}, enlace`;
      }
    }
    else if (el.tagName === 'IMG') {
      text = el.alt || 'Imagen sin descripción';
    }
    // Priority 4: Elements with role attribute
    else if (el.getAttribute('role')) {
      const role = el.getAttribute('role');
      const roleMap = {
        'button': 'botón',
        'link': 'enlace',
        'checkbox': 'casilla de verificación',
        'radio': 'botón de radio',
        'tab': 'pestaña',
        'tabpanel': 'panel de pestaña',
        'menuitem': 'elemento de menú',
        'option': 'opción',
        'combobox': 'cuadro combinado',
        'textbox': 'cuadro de texto',
        'searchbox': 'cuadro de búsqueda',
        'slider': 'deslizador',
        'spinbutton': 'selector numérico',
        'progressbar': 'barra de progreso',
        'alert': 'alerta',
        'dialog': 'diálogo',
        'navigation': 'navegación',
        'main': 'contenido principal',
        'banner': 'banner',
        'contentinfo': 'información de contenido',
        'complementary': 'complementario',
        'form': 'formulario',
        'search': 'búsqueda',
        'region': 'región'
      };
      const roleName = roleMap[role] || role;
      text = el.innerText || el.textContent || roleName;
      // Add role description if text doesn't describe it
      if (text && !text.toLowerCase().includes(roleName.toLowerCase())) {
        text = `${text}, ${roleName}`;
      }
    }
    // Priority 5: Headings with level
    else if (el.tagName && el.tagName.match(/^H[1-6]$/)) {
      const level = el.tagName.charAt(1);
      text = el.innerText || el.textContent || '';
      if (text) {
        text = `Encabezado nivel ${level}, ${text}`;
      }
    }
    // Priority 6: Lists
    else if (el.tagName === 'LI') {
      text = el.innerText || el.textContent || '';
      if (text) {
        text = `Elemento de lista, ${text}`;
      }
    }
    // Priority 7: Generic clickable/focusable elements
    else if (el.tabIndex >= 0 || el.onclick) {
      text = el.innerText || el.textContent || '';
      if (text) {
        text = `Elemento interactivo, ${text}`;
      }
    }
    // Priority 8: Any other element with text content
    else {
      text = el.innerText || el.textContent || '';
    }

    return text.trim();
  }

  document.addEventListener('focusin', async (e) => {
    const el = e.target;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[WAU FOCUSIN] 🎯 Elemento enfocado:', el.tagName, el.className || '(sin clase)');
    console.log('[WAU FOCUSIN] 📊 ttsEnabled:', ttsEnabled);
    console.log('[WAU FOCUSIN] 📝 ID:', el.id || '(sin id)');

    if (!ttsEnabled) {
      console.log('[WAU FOCUSIN] ⚠️ TTS DESACTIVADO - No se leerá nada');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }

    let text = extractTextFromElement(el);
    console.log('[WAU FOCUSIN] 📖 Texto extraído:', text || '(vacío)');

    // If no text found, try to describe the element
    if (!text && el.tagName) {
      const tagMap = {
        'DIV': 'División',
        'SPAN': 'Texto',
        'P': 'Párrafo',
        'SECTION': 'Sección',
        'ARTICLE': 'Artículo',
        'HEADER': 'Encabezado de página',
        'FOOTER': 'Pie de página',
        'NAV': 'Navegación',
        'ASIDE': 'Contenido lateral',
        'MAIN': 'Contenido principal'
      };
      text = tagMap[el.tagName] || el.tagName.toLowerCase();
      console.log('[WAU FOCUSIN] 🏷️ Usando descripción de elemento:', text);
    }

    // Final fallback
    if (!text) {
      text = 'Elemento enfocado';
      console.log('[WAU FOCUSIN] ⚠️ Usando texto por defecto');
    }

    // Avoid repeating the same text too quickly (debounce)
    const now = Date.now();
    const timeSinceLastSpoken = now - lastSpokenTime;
    const isSameText = text === lastSpokenText;

    console.log('[WAU FOCUSIN] ⏱️ Tiempo desde último:', timeSinceLastSpoken + 'ms');
    console.log('[WAU FOCUSIN] 🔄 Es el mismo texto:', isSameText);

    if (text && (text !== lastSpokenText || timeSinceLastSpoken > 1000)) {
      lastSpokenText = text;
      lastSpokenTime = now;

      // Limit text length
      if (text.length > 200) {
        text = text.substring(0, 200) + '...';
        console.log('[WAU FOCUSIN] ✂️ Texto truncado a 200 caracteres');
      }

      console.log('[WAU FOCUSIN] ✅ LLAMANDO A TTS.speak() con:', text);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      await TTS.speak(text);
    } else {
      console.log('[WAU FOCUSIN] ⏭️ IGNORADO (texto repetido o muy reciente)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }, true);

  // Keyboard navigation
  if (settings.keyboardNav) {
    KB.enable({
      onTab: () => {
        const activeEl = document.activeElement;
        if (activeEl && activeEl !== document.body) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      onToggleTTS: () => {
        ttsEnabled = !ttsEnabled;
        TTS.stop();

        // Show visual feedback
        const feedback = document.createElement('div');
        feedback.textContent = ttsEnabled ? '🔊 TTS Activado' : '🔇 TTS Desactivado';
        feedback.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${ttsEnabled ? '#4caf50' : '#f44336'};
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 600;
          z-index: 2147483647;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: wau-fade-in-out 2s ease;
        `;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);

        // Update settings
        settings.ttsEnabled = ttsEnabled;
        setSettings(settings);

        console.log('[WAU] TTS', ttsEnabled ? 'activado' : 'desactivado');
      },
      onIncreaseFont: () => {
        settings.fontScale = Math.min(2.0, (settings.fontScale || 1.0) + 0.1);
        applyFontScale(settings.fontScale);
        setSettings(settings);
      },
      onDecreaseFont: () => {
        settings.fontScale = Math.max(0.8, (settings.fontScale || 1.0) - 0.1);
        applyFontScale(settings.fontScale);
        setSettings(settings);
      }
    }, settings.shortcuts);
  }

  // Listen for messages from popup/options to update settings live
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'settings:update') {
      settings = Object.assign(settings, msg.value || {});
      applyFontScale(settings.fontScale);
      applyTheme(settings.colorTheme);
      applyHighlightLinks(settings.highlightLinks);
      ttsEnabled = !!settings.ttsEnabled;
    }
  });

  // Listen for messages from floating widget
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data?.type === 'wau:settings:update') {
      settings = Object.assign(settings, event.data.value || {});
      applyFontScale(settings.fontScale);
      applyTheme(settings.colorTheme);
      applyHighlightLinks(settings.highlightLinks);
      ttsEnabled = !!settings.ttsEnabled;
    }
  });
})();