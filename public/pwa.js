(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  function showUpdateNotice(registration) {
    if (document.getElementById('pwa-update-notice')) return;

    const notice = document.createElement('button');
    notice.id = 'pwa-update-notice';
    notice.type = 'button';
    notice.textContent = 'Neue Version verfuegbar - neu laden';
    notice.addEventListener('click', () => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      location.reload();
    });
    document.body.appendChild(notice);
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotice(registration);
            }
          });
        });

        if (registration.waiting && navigator.serviceWorker.controller) {
          showUpdateNotice(registration);
        }
      })
      .catch(() => {});
  });
})();
