// content/dom-injector.js
// Helpers to inject CSS files or dynamic styles. Uses Shadow DOM if needed.
(function() {
  function injectCssFile(path) {
    const url = chrome.runtime.getURL(path);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.documentElement.appendChild(link);
    return link;
  }

  function injectSkipToContent() {
    if (document.getElementById('wau-skip')) return;
    const btn = document.createElement('a');
    btn.id = 'wau-skip';
    btn.href = '#main';
    btn.textContent = 'Saltar al contenido';
    btn.setAttribute('role', 'button');
    btn.style.position = 'fixed';
    btn.style.top = '0';
    btn.style.left = '0';
    btn.style.padding = '8px 12px';
    btn.style.background = '#000';
    btn.style.color = '#fff';
    btn.style.transform = 'translateY(-150%)';
    btn.style.transition = 'transform .15s ease';
    btn.style.zIndex = 2147483647; // on top
    btn.addEventListener('focus', () => btn.style.transform = 'translateY(0)');
    btn.addEventListener('blur',  () => btn.style.transform = 'translateY(-150%)');
    document.body.appendChild(btn);
  }

  // Expose minimal API for content-script
  window.__WAU_INJECTOR__ = { injectCssFile, injectSkipToContent };
})();