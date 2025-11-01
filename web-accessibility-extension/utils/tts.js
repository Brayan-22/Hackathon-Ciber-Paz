// utils/tts.js - Implementación idiomática usando speechSynthesis primero
let ttsReady = false;
let speechSynthesisAvailable = false;
let voices = [];

async function initTTS() {
  if (ttsReady) return true;
  console.log('[WAU TTS] Inicializando TTS...');

  if (window.speechSynthesis) {
    speechSynthesisAvailable = true;
    console.log('[WAU TTS] speechSynthesis disponible');
    voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      await new Promise((resolve) => {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          voices = window.speechSynthesis.getVoices();
          console.log('[WAU TTS] Voces cargadas:', voices.length);
          resolve();
        }, { once: true });
        setTimeout(() => {
          voices = window.speechSynthesis.getVoices();
          resolve();
        }, 1000);
      });
    }
  }

  ttsReady = true;
  return true;
}

function getBestVoice(lang) {
  if (voices.length === 0) return null;
  const langCode = lang.split('-')[0];
  let voice = voices.find(v => v.lang === lang && v.localService);
  if (!voice) voice = voices.find(v => v.lang === lang);
  if (!voice) voice = voices.find(v => v.lang.startsWith(langCode) && v.localService);
  if (!voice) voice = voices.find(v => v.lang.startsWith(langCode));
  if (!voice) voice = voices.find(v => v.default);
  return voice || voices[0];
}

async function speak(text) {
  const t = (text || "").toString().trim();
  if (!t) return;

  console.log('[WAU TTS] speak() llamado con:', t.substring(0, 100));

  let finalText = t.length > 300 ? t.substring(0, 300) : t;
  if (!ttsReady) await initTTS();

  const lang = document.documentElement.lang || navigator.language || 'es-ES';

  if (speechSynthesisAvailable && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      await new Promise(resolve => setTimeout(resolve, 50));

      const utterance = new SpeechSynthesisUtterance(finalText);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
        console.log('[WAU TTS] Usando voz:', voice.name);
      }

      utterance.onstart = () => console.log('[WAU TTS] ▶️ Reproducción iniciada (speechSynthesis)');
      utterance.onend = () => console.log('[WAU TTS] ✅ Reproducción completada');
      utterance.onerror = (event) => {
        // Solo mostrar log para errores que NO son synthesis-failed (que es común)
        if (event.error !== 'synthesis-failed' && event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('[WAU TTS] ⚠️ Error speechSynthesis:', event.error);
        }

        // Para synthesis-failed, usar fallback silenciosamente
        if (event.error === 'synthesis-failed' ||
          event.error === 'not-allowed' ||
          event.error === 'audio-busy' ||
          event.error === 'synthesis-unavailable') {
          console.log('[WAU TTS] 🔄 Cambiando a chrome.tts...');
          speakWithChromeTTS(finalText, lang);
        }
      };

      console.log('[WAU TTS] Ejecutando speechSynthesis.speak()');
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('[WAU TTS] Exception:', e.message);
      speakWithChromeTTS(finalText, lang);
    }
  } else {
    speakWithChromeTTS(finalText, lang);
  }
}

function speakWithChromeTTS(text, lang) {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error('[WAU TTS] ❌ chrome.runtime no disponible');
    return;
  }

  console.log('[WAU TTS] 📢 Usando chrome.tts API');

  chrome.runtime.sendMessage({
    type: 'tts:speak',
    text: text,
    lang: lang || 'es-ES'
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[WAU TTS] ❌ Error en chrome.tts:', chrome.runtime.lastError.message);
    } else {
      console.log('[WAU TTS] ✅ chrome.tts ejecutado correctamente');
    }
  });
}

function pause() {
  if (window.speechSynthesis) window.speechSynthesis.pause();
}

function resume() {
  if (window.speechSynthesis) window.speechSynthesis.resume();
}

function stop() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ type: 'tts:stop' }).catch(() => { });
  }
}

function isReady() {
  return ttsReady;
}

if (typeof window !== 'undefined') {
  window.WAU_TTS = { speak, pause, resume, stop, initTTS, isReady };
}
