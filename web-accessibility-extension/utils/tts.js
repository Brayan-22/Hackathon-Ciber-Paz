// utils/tts.js
let ttsReady = false;
let audioPermissionGranted = false;
let hasShownPermissionWarning = false;

// Initialize TTS and check audio permissions
async function initTTS() {
  if (ttsReady) return true;
  
  try {
    // Check if speechSynthesis is available
    if (!window.speechSynthesis) {
      console.warn('[WAU TTS] SpeechSynthesis API no disponible');
      return false;
    }

    // Wait for voices to load
    if (window.speechSynthesis.getVoices().length === 0) {
      await new Promise((resolve) => {
        window.speechSynthesis.addEventListener('voiceschanged', resolve, { once: true });
        setTimeout(resolve, 1000); // Fallback timeout
      });
    }

    // Try to play a silent audio to check permissions
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioPermissionGranted = audioContext.state === 'running';
      audioContext.close();
    } catch (e) {
      console.warn('[WAU TTS] No se pudo verificar permisos de audio:', e);
      audioPermissionGranted = true; // Assume it's ok and try anyway
    }

    ttsReady = true;
    console.log('[WAU TTS] Inicialización completa');
    return true;
  } catch (e) {
    console.error('[WAU TTS] Error inicializando TTS:', e);
    return false;
  }
}

// Get best voice for the given language
function getBestVoice(lang) {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  
  // Try to find a voice that matches the language
  const langCode = lang.split('-')[0]; // Get 'es' from 'es-ES'
  
  // First, try exact match
  let voice = voices.find(v => v.lang === lang);
  
  // Then try language code match
  if (!voice) {
    voice = voices.find(v => v.lang.startsWith(langCode));
  }
  
  // Finally, prefer local voices
  if (!voice) {
    voice = voices.find(v => v.localService);
  }
  
  // Return first available voice as last resort
  return voice || voices[0];
}

// Request audio interaction from user
function requestAudioInteraction() {
  if (hasShownPermissionWarning) return;
  hasShownPermissionWarning = true;
  
  // Show a small, non-intrusive notification
  const notification = document.createElement('div');
  notification.id = 'wau-tts-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #667eea;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: wau-slide-down 0.3s ease;
    ">
      <span>🔊 Haz clic en cualquier parte de la página para activar la lectura por voz</span>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">OK</button>
    </div>
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes wau-slide-down {
      from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
  
  // Add one-time click listener to activate audio
  const activateAudio = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();
      audioPermissionGranted = true;
      notification.remove();
      document.removeEventListener('click', activateAudio);
      console.log('[WAU TTS] Audio activado por interacción del usuario');
    } catch (e) {
      console.error('[WAU TTS] Error activando audio:', e);
    }
  };
  
  document.addEventListener('click', activateAudio, { once: true });
}

// Helper function to attempt speech synthesis
async function trySpeak(text) {
  if (!text || !window.speechSynthesis) return;
  
  try {
    window.speechSynthesis.cancel();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const lang = document.documentElement.lang || navigator.language || 'es-ES';
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    
    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.warn('[WAU TTS] No se pudo reintentar síntesis');
  }
}

async function speak(text) {
  const t = (text || "").toString().trim();
  if (!t) return;
  
  // Validate text length (some browsers have limits)
  if (t.length > 1000) {
    console.warn('[WAU TTS] Texto muy largo, truncando a 200 caracteres');
    const truncated = t.substring(0, 200) + '...';
    return speak(truncated);
  }
  
  // Initialize if needed
  if (!ttsReady) {
    const initialized = await initTTS();
    if (!initialized) {
      // Try fallback
      tryFallbackTTS(t);
      return;
    }
  }

  // Check audio permissions
  if (!audioPermissionGranted) {
    requestAudioInteraction();
    return;
  }

  // Check if speechSynthesis is currently speaking
  if (window.speechSynthesis.speaking) {
    // Cancel current speech to speak new text
    window.speechSynthesis.cancel();
    // Wait a bit before speaking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const lang = document.documentElement.lang || navigator.language || 'es-ES';
  
  try {
    const utter = new SpeechSynthesisUtterance(t);
    utter.lang = lang;
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    
    // Try to use the best available voice
    const voice = getBestVoice(lang);
    if (voice) {
      utter.voice = voice;
    }
    
    // Add error handler with detailed error information
    utter.onerror = (event) => {
      const errorType = event.error || 'unknown';
      
      // Only log non-critical errors
      if (errorType !== 'interrupted' && errorType !== 'canceled') {
        console.warn('[WAU TTS] Error de síntesis:', errorType);
      }
      
      // Handle different error types
      switch(errorType) {
        case 'not-allowed':
        case 'audio-busy':
          // User interaction needed
          audioPermissionGranted = false;
          requestAudioInteraction();
          break;
        
        case 'interrupted':
        case 'canceled':
          // Normal behavior when user navigates quickly, don't retry
          break;
        
        case 'synthesis-failed':
        case 'synthesis-unavailable':
        case 'language-unavailable':
        case 'voice-unavailable':
          // Try fallback silently
          tryFallbackTTS(t);
          break;
        
        case 'text-too-long':
          // Text is too long, try with truncated version
          if (t.length > 100) {
            const truncated = t.substring(0, 100);
            console.log('[WAU TTS] Texto truncado para síntesis');
            trySpeak(truncated);
          }
          break;
        
        case 'network':
          // Network error, might be temporary
          console.warn('[WAU TTS] Error de red, reintentando...');
          setTimeout(() => trySpeak(t), 500);
          break;
        
        default:
          // Unknown error, try fallback
          tryFallbackTTS(t);
      }
    };
    
    // Add event for debugging (only in verbose mode)
    utter.onstart = () => {
      // Silent start - only log if there are issues
    };
    
    // Add end event to track completion
    utter.onend = () => {
      // Silent completion
    };
    
    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.error('[WAU TTS] Error al hablar:', e);
    tryFallbackTTS(t);
  }
}

// Try chrome.tts fallback via background (silent fallback)
function tryFallbackTTS(text) {
  const lang = document.documentElement.lang || navigator.language || 'es-ES';
  try {
    chrome.runtime.sendMessage({ 
      type: 'tts:speak', 
      text: text, 
      lang: lang 
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Silent error - fallback also failed, but don't spam console
      }
    });
  } catch (e) {
    // Silent catch - if both methods fail, TTS is not available
  }
}

function pause() {
  try { 
    if (window.speechSynthesis) {
      window.speechSynthesis.pause(); 
    }
  } catch (e) {
    console.error('[WAU TTS] Error pausando:', e);
  }
}

function resume() {
  try { 
    if (window.speechSynthesis) {
      window.speechSynthesis.resume(); 
    }
  } catch (e) {
    console.error('[WAU TTS] Error reanudando:', e);
  }
}

function stop() {
  try { 
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); 
    }
  } catch (e) {
    console.error('[WAU TTS] Error deteniendo:', e);
  }
}

// Check if TTS is ready
function isReady() {
  return ttsReady && audioPermissionGranted;
}

// Export to window for content scripts
if (typeof window !== 'undefined') {
  window.WAU_TTS = { speak, pause, resume, stop, initTTS, isReady };
}