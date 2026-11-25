const REALTIME_CHANNEL_NAME = 'antiperte_realtime_sync_v1';

export type PushPermissionState = NotificationPermission | 'unsupported';

export function getPushPermissionState(): PushPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestLocalPushPermission(): Promise<PushPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

export function broadcastRecoverySync(serial: string): void {
  if (typeof window === 'undefined') return;
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(REALTIME_CHANNEL_NAME);
      channel.postMessage({ type: 'TAG_RECOVERED', serial });
      channel.close();
    }
  } catch {
    // Ignore BroadcastChannel restriction errors
  }
}

export function subscribeToRealtimeSync(
  onSync: (serial?: string) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let channel: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(REALTIME_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === 'TAG_RECOVERED') {
          onSync(event.data.serial);
        }
      };
    }
  } catch {
    // ignore
  }

  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === 'antiperte_db_v2' ||
      e.key === 'antiperte_notifications_v1'
    ) {
      onSync();
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) {
      channel.close();
    }
    window.removeEventListener('storage', handleStorage);
  };
}

export async function triggerLocalRecoveryPushNotification(params: {
  serial: string;
  objectType?: string;
  message: string;
}): Promise<'service-worker' | 'window-notification' | 'in-app-only'> {
  broadcastRecoverySync(params.serial);

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'in-app-only';
  }

  if (Notification.permission !== 'granted') {
    return 'in-app-only';
  }

  const title = `ANTIPERTE — ${params.objectType || 'Objet'} retrouvé (${params.serial})`;
  const payload = {
    title,
    body: params.message,
    serial: params.serial,
    url: '/?page=account',
  };

  if ('serviceWorker' in navigator) {
    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) =>
          window.setTimeout(() => resolve(null), 1500)
        ),
      ]);

      if (registration) {
        if (registration.active) {
          registration.active.postMessage({
            type: 'ANTIPERTE_SHOW_LOCAL_PUSH',
            payload,
          });
          return 'service-worker';
        }

        await registration.showNotification(title, {
          body: params.message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `antiperte-retrouvee-${params.serial}`,
          data: { serial: params.serial, url: '/?page=account' },
        });
        return 'service-worker';
      }
    } catch {
      // Fall back to standard Notification API below
    }
  }

  try {
    new Notification(title, {
      body: params.message,
      icon: '/pwa-192x192.png',
      tag: `antiperte-retrouvee-${params.serial}`,
    });
    return 'window-notification';
  } catch {
    return 'in-app-only';
  }
}
