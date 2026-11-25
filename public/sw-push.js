/* ANTIPERTE Service Worker — Notifications push locales & temps réel */

self.addEventListener('push', (event) => {
  let payload = {
    title: 'ANTIPERTE — Objet retrouvé',
    body: "Bonne nouvelle ! Le statut d'une de vos étiquettes vient de passer à RETROUVÉE.",
    serial: '',
    url: '/?page=account',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      const text = event.data.text();
      if (text) payload.body = text;
    }
  }

  const tag = payload.serial
    ? `antiperte-retrouvee-${payload.serial}`
    : 'antiperte-retrouvee';

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag,
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        serial: payload.serial,
        url: payload.url || '/?page=account',
      },
      actions: [
        {
          action: 'open_account',
          title: 'Voir dans Mon compte',
        },
      ],
    })
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'ANTIPERTE_SHOW_LOCAL_PUSH' && data.payload) {
    const {
      title = 'ANTIPERTE — Objet retrouvé',
      body = "Votre étiquette est désormais marquée RETROUVÉE par l'administration.",
      serial = '',
      url = '/?page=account',
    } = data.payload;

    const tag = serial
      ? `antiperte-retrouvee-${serial}`
      : 'antiperte-retrouvee';

    event.waitUntil(
      (async () => {
        await self.registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag,
          renotify: true,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: { serial, url },
          actions: [
            {
              action: 'open_account',
              title: 'Voir dans Mon compte',
            },
          ],
        });

        const windowClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
        for (const client of windowClients) {
          client.postMessage({
            type: 'ANTIPERTE_TAG_RECOVERED_SYNC',
            serial,
          });
        }
      })()
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) ||
    '/?page=account';
  const serial =
    (event.notification.data && event.notification.data.serial) || '';

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if ('focus' in client) {
          await client.focus();
          client.postMessage({
            type: 'ANTIPERTE_NAVIGATE_ACCOUNT',
            serial,
          });
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});
