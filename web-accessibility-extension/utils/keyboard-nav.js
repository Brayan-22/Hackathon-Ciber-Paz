// utils/keyboard-nav.js
function parseShortcut(s) {
  const parts = (s || '').split('+').map(p => p.trim().toLowerCase());
  return {
    altKey: parts.includes('alt'),
    ctrlKey: parts.includes('ctrl') || parts.includes('control'),
    shiftKey: parts.includes('shift'),
    key: (parts[parts.length - 1] || '').toLowerCase()
  };
}

function enable(callbacks, shortcuts) {
  const map = {
    toggleTTS: parseShortcut(shortcuts?.toggleTTS || 'Alt+T'),
    increaseFont: parseShortcut(shortcuts?.increaseFont || 'Alt+Plus'),
    decreaseFont: parseShortcut(shortcuts?.decreaseFont || 'Alt+Minus')
  };

  document.addEventListener('keydown', (e) => {
    // Smooth center on Tab focus and trigger callback
    if (e.key === 'Tab') {
      // Use setTimeout to wait for focus to change
      setTimeout(() => {
        callbacks?.onTab?.();
      }, 10);
    }

    const pressed = {
      altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey,
      key: e.key.toLowerCase()
    };

    const match = (a, b) => a.altKey===b.altKey && a.ctrlKey===b.ctrlKey && a.shiftKey===b.shiftKey && (a.key===b.key || (b.key==='plus' && (a.key==='=' || a.key==='+')));
    if (match(pressed, map.toggleTTS)) { e.preventDefault(); callbacks?.onToggleTTS?.(); }
    if (match(pressed, map.increaseFont)) { e.preventDefault(); callbacks?.onIncreaseFont?.(); }
    if (match(pressed, map.decreaseFont)) { e.preventDefault(); callbacks?.onDecreaseFont?.(); }
  }, true);
}

// Export to window for content scripts
if (typeof window !== 'undefined') {
  window.WAU_KB = { enable, parseShortcut };
}