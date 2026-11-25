import {
  DEFAULT_FEATURED_TEXTS,
  OFFICIAL_TEL,
  OFFICIAL_WHATSAPP_DISPLAY,
} from '../lib/constants';
import type {
  ActivationPayload,
  ChatMessage,
  ConversationThread,
  FoundReportPayload,
  GoldPhoneSubscription,
  MessageParticipant,
  MessageRole,
  StickerTag,
  SubscriberNotification,
  TagStatus,
} from '../types/antiperte';

const STORAGE_KEY = 'antiperte_db_v2';
const FEATURED_STORAGE_KEY = 'antiperte_featured_v1';
const MESSAGES_STORAGE_KEY = 'antiperte_messages_v1';
const GOLD_PHONE_STORAGE_KEY = 'antiperte_gold_phone_v1';
const NOTIFICATIONS_STORAGE_KEY = 'antiperte_notifications_v1';

export const DEFAULT_FRANCHISE_CODE = 'BAF-001';
export const KIT_PRICE_FCFA = 1000;
export const FRANCHISE_COMMISSION_RATE = 0.3;

export function formatSerial(num: number): string {
  return `AP-${String(num).padStart(6, '0')}`;
}

export function generateRandomPin(): string {
  const value = Math.floor(Math.random() * 10000000);
  return String(value).padStart(7, '0');
}

export function normalizeSerial(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (/^\d{1,6}$/.test(cleaned)) {
    return `AP-${cleaned.padStart(6, '0')}`;
  }
  return cleaned;
}

function createInitialSeed(): StickerTag[] {
  const now = new Date();
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 86400000).toISOString();
  const oneYearLater = new Date(now.getTime() + 365 * 86400000).toISOString();

  return [
    {
      serial: 'AP-000001',
      pin: '4829105',
      status: 'ACTIVEE',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(15),
      soldAt: daysAgo(10),
      activatedAt: daysAgo(9),
      expiresAt: oneYearLater,
      ownerName: 'Jean-Paul Kamga',
      ownerPhone: '677 12 34 56',
      objectType: 'CNI',
      reward: 2000,
      emergencyName: 'Marie Kamga',
      emergencyPhone: '699 45 78 90',
    },
    {
      serial: 'AP-000002',
      pin: '7390412',
      status: 'PERDUE',
      wasLost: true,
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(15),
      soldAt: daysAgo(8),
      activatedAt: daysAgo(7),
      expiresAt: oneYearLater,
      ownerName: 'Aminatou Bello',
      ownerPhone: '655 88 21 04',
      objectType: 'Téléphone',
      reward: 5000,
      emergencyName: 'Ibrahim Bello',
      emergencyPhone: '670 11 22 33',
    },
    {
      serial: 'AP-000003',
      pin: '1954820',
      status: 'VENDUE',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(12),
      soldAt: daysAgo(2),
    },
    {
      serial: 'AP-000004',
      pin: '6042913',
      status: 'VENDUE',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(12),
      soldAt: daysAgo(1),
    },
    {
      serial: 'AP-000005',
      pin: '3187456',
      status: 'STOCK',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(12),
    },
    {
      serial: 'AP-000006',
      pin: '8523091',
      status: 'STOCK',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(12),
    },
    {
      serial: 'AP-000007',
      pin: '2409874',
      status: 'STOCK',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(12),
    },
    {
      serial: 'AP-000008',
      pin: '9615238',
      status: 'STOCK',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(12),
    },
    {
      serial: 'AP-000009',
      pin: '5371642',
      status: 'STOCK',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(12),
    },
    {
      serial: 'AP-000010',
      pin: '1048395',
      status: 'STOCK',
      franchiseCode: DEFAULT_FRANCHISE_CODE,
      createdAt: daysAgo(12),
    },
  ];
}

export function loadTags(): StickerTag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createInitialSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall back to seed if storage is corrupted
  }
  const seed = createInitialSeed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export function saveTags(tags: StickerTag[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
}

export function generateBatchTags(
  existingTags: StickerTag[],
  count = 100,
  franchiseCode = DEFAULT_FRANCHISE_CODE
): { nextTags: StickerTag[]; created: StickerTag[] } {
  let maxNumber = 0;
  for (const tag of existingTags) {
    const match = tag.serial.match(/^AP-(\d+)$/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!Number.isNaN(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }
  }

  const now = new Date().toISOString();
  const created: StickerTag[] = [];
  for (let i = 1; i <= count; i++) {
    created.push({
      serial: formatSerial(maxNumber + i),
      pin: generateRandomPin(),
      status: 'STOCK',
      franchiseCode: franchiseCode.trim().toUpperCase() || DEFAULT_FRANCHISE_CODE,
      createdAt: now,
    });
  }

  const nextTags = [...existingTags, ...created];
  saveTags(nextTags);
  return { nextTags, created };
}

export function markTagSold(
  existingTags: StickerTag[],
  rawSerial: string,
  franchiseCode = DEFAULT_FRANCHISE_CODE
):
  | { ok: true; nextTags: StickerTag[]; tag: StickerTag }
  | { ok: false; error: string } {
  const serial = normalizeSerial(rawSerial);
  if (!serial) {
    return { ok: false, error: 'Veuillez saisir un numéro de série.' };
  }

  const index = existingTags.findIndex((t) => t.serial === serial);
  if (index === -1) {
    return { ok: false, error: `Étiquette ${serial} introuvable dans la base.` };
  }

  const current = existingTags[index];
  if (current.status !== 'STOCK') {
    return {
      ok: false,
      error: `L'étiquette ${serial} a déjà le statut ${current.status}.`,
    };
  }

  const updated: StickerTag = {
    ...current,
    status: 'VENDUE',
    franchiseCode: franchiseCode.trim().toUpperCase() || current.franchiseCode,
    soldAt: new Date().toISOString(),
  };

  const nextTags = [...existingTags];
  nextTags[index] = updated;
  saveTags(nextTags);
  return { ok: true, nextTags, tag: updated };
}

export function activateTag(
  existingTags: StickerTag[],
  payload: ActivationPayload
):
  | { ok: true; nextTags: StickerTag[]; tag: StickerTag }
  | { ok: false; error: string } {
  const serial = normalizeSerial(payload.serial);
  const pin = payload.pin.trim();

  if (!serial) {
    return { ok: false, error: 'Veuillez saisir le numéro de série.' };
  }
  if (!/^\d{7,}$/.test(pin)) {
    return { ok: false, error: 'PIN incomplet, 7 chiffres requis' };
  }

  const index = existingTags.findIndex((t) => t.serial === serial);
  if (index === -1) {
    return { ok: false, error: `Numéro de série ${serial} introuvable.` };
  }

  const current = existingTags[index];
  if (current.pin !== pin) {
    return { ok: false, error: 'Code PIN à gratter incorrect.' };
  }

  if (isTagActivated(current)) {
    return { ok: false, error: `L'étiquette ${serial} est déjà activée.` };
  }

  const isPhone = payload.objectType === 'Téléphone';
  const cleanModel = (payload.phoneModel || '').trim();
  const cleanImei = (payload.phoneImei || '').replace(/\D/g, '');

  if (isPhone) {
    if (!cleanModel) {
      return {
        ok: false,
        error: 'Veuillez saisir la Marque / Modèle du téléphone.',
      };
    }
    if (!/^\d{15}$/.test(cleanImei)) {
      return {
        ok: false,
        error: 'IMEI invalide : 15 chiffres requis (composez *#06#).',
      };
    }
    if (!payload.lockscreenConsent) {
      return {
        ok: false,
        error:
          "Veuillez cocher la case confirmant l'affichage du numéro d'urgence sur l'écran de verrouillage.",
      };
    }
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 86400000).toISOString();
  const effectivePlan = isPhone
    ? 'TELEPHONE_OR'
    : payload.plan || 'STANDARD';

  const updated: StickerTag = {
    ...current,
    status: 'ACTIVEE',
    soldAt: current.soldAt || now.toISOString(),
    activatedAt: now.toISOString(),
    expiresAt,
    ownerName: payload.ownerName.trim(),
    ownerPhone: payload.ownerPhone.trim(),
    objectType: payload.objectType,
    reward: isPhone || effectivePlan === 'TELEPHONE_OR' ? 5000 : payload.reward,
    plan: effectivePlan,
    phoneModel: isPhone ? cleanModel : undefined,
    phoneImei: isPhone ? cleanImei : undefined,
    lockscreenConsent: isPhone ? true : undefined,
    emergencyName: payload.emergencyName.trim(),
    emergencyPhone: payload.emergencyPhone.trim(),
  };

  if (updated.plan === 'TELEPHONE_OR') {
    activateGoldPhoneSubscription();
  }

  const nextTags = [...existingTags];
  nextTags[index] = updated;
  saveTags(nextTags);
  return { ok: true, nextTags, tag: updated };
}

export function reportFoundTag(
  existingTags: StickerTag[],
  payload: FoundReportPayload
): { ok: true; nextTags: StickerTag[] } | { ok: false; error: string } {
  const serial = normalizeSerial(payload.serial);
  const pin = payload.pin.trim();
  const finderName = payload.finderName.trim();
  const finderPhone = payload.finderPhone.trim();

  if (!serial) {
    return { ok: false, error: 'Veuillez saisir le numéro de série.' };
  }
  if (!/^\d{7,}$/.test(pin)) {
    return {
      ok: false,
      error: 'PIN incomplet, 7 chiffres requis',
    };
  }
  if (!finderName || !finderPhone) {
    return {
      ok: false,
      error: 'Veuillez renseigner votre nom et votre numéro de téléphone.',
    };
  }

  const index = existingTags.findIndex((t) => t.serial === serial);
  if (index === -1) {
    return {
      ok: false,
      error:
        'Numéro de série introuvable. Vérifiez les caractères sur l’étiquette.',
    };
  }

  const current = existingTags[index];
  if (current.pin !== pin) {
    return {
      ok: false,
      error: 'Code PIN à gratter incorrect.',
    };
  }

  const updated: StickerTag = {
    ...current,
    status: 'SIGNALEE',
    wasLost: current.status === 'PERDUE' || Boolean(current.wasLost),
    finderName,
    finderPhone,
    reportedAt: new Date().toISOString(),
  };

  const nextTags = [...existingTags];
  nextTags[index] = updated;
  saveTags(nextTags);
  return { ok: true, nextTags };
}

export function updateTagStatus(
  existingTags: StickerTag[],
  serial: string,
  status: TagStatus
): StickerTag[] {
  const now = new Date().toISOString();
  const nextTags = existingTags.map((t) => {
    if (t.serial !== serial) return t;
    if (status === 'PERDUE') {
      return { ...t, status, wasLost: true };
    }
    if (status === 'RETROUVEE') {
      return {
        ...t,
        status,
        wasLost: false,
        recoveredAt: now,
        recoveredBy: 'USER' as const,
      };
    }
    return { ...t, status };
  });
  saveTags(nextTags);
  return nextTags;
}

export function isTagSold(tag: StickerTag): boolean {
  return tag.status !== 'STOCK';
}

export function isTagActivated(tag: StickerTag): boolean {
  return (
    Boolean(tag.activatedAt) ||
    tag.status === 'ACTIVEE' ||
    tag.status === 'PERDUE' ||
    tag.status === 'RETROUVEE'
  );
}

export function exportTagsToCSV(tags: StickerTag[]): void {
  const headers = [
    'Série',
    'PIN',
    'Statut',
    'Franchisé',
    'Objet',
    'Marque / Modèle',
    'IMEI',
    'Propriétaire',
    'Téléphone',
    'Récompense (FCFA)',
    'Contact Urgence Nom',
    'Contact Urgence Téléphone',
    'Trouveur Nom',
    'Trouveur Téléphone',
    'Date Signalement',
    'Date Création',
    'Date Vente',
    'Date Activation',
  ];

  const escapeCsv = (value: string | number | undefined) => {
    const str = value === undefined ? '' : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = tags.map((t) =>
    [
      t.serial,
      t.pin,
      t.status,
      t.franchiseCode,
      t.objectType,
      t.phoneModel,
      t.phoneImei,
      t.ownerName,
      t.ownerPhone,
      t.reward,
      t.emergencyName,
      t.emergencyPhone,
      t.finderName,
      t.finderPhone,
      t.reportedAt,
      t.createdAt,
      t.soldAt,
      t.activatedAt,
    ]
      .map(escapeCsv)
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const datePart = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `antiperte-etiquettes-${datePart}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Zone À LA UNE (Carrousel Accueil) ---

export function loadFeaturedTexts(): [string, string, string] {
  try {
    const raw = localStorage.getItem(FEATURED_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 3) {
        return [
          String(parsed[0] || DEFAULT_FEATURED_TEXTS[0]),
          String(parsed[1] || DEFAULT_FEATURED_TEXTS[1]),
          String(parsed[2] || DEFAULT_FEATURED_TEXTS[2]),
        ];
      }
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_FEATURED_TEXTS] as [string, string, string];
}

export function saveFeaturedTexts(texts: [string, string, string]): void {
  localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(texts));
}

// --- Abonnement spécifique Pack Téléphone Or ---

export function loadGoldPhoneSubscription(): GoldPhoneSubscription {
  try {
    const raw = localStorage.getItem(GOLD_PHONE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GoldPhoneSubscription>;
      if (typeof parsed.active === 'boolean') {
        return {
          active: parsed.active,
          activatedAt: parsed.activatedAt,
          planName: 'Pack Téléphone Or',
          rewardAmount: 5000,
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    active: false,
    planName: 'Pack Téléphone Or',
    rewardAmount: 5000,
  };
}

export function activateGoldPhoneSubscription(): GoldPhoneSubscription {
  const next: GoldPhoneSubscription = {
    active: true,
    activatedAt: new Date().toISOString(),
    planName: 'Pack Téléphone Or',
    rewardAmount: 5000,
  };
  localStorage.setItem(GOLD_PHONE_STORAGE_KEY, JSON.stringify(next));
  return next;
}

// --- Notifications Centre d'appel (Mon compte) ---

export function loadNotifications(): SubscriberNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveNotifications(
  notifications: SubscriberNotification[]
): void {
  localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(notifications)
  );
}

export function markTagRecoveredByCallCenter(
  existingTags: StickerTag[],
  existingNotifications: SubscriberNotification[],
  serial: string
):
  | {
      ok: true;
      nextTags: StickerTag[];
      nextNotifications: SubscriberNotification[];
      notificationCreated: boolean;
    }
  | { ok: false; error: string } {
  const targetSerial = normalizeSerial(serial);
  const index = existingTags.findIndex((t) => t.serial === targetSerial);
  if (index === -1) {
    return { ok: false, error: `Étiquette ${targetSerial} introuvable.` };
  }

  const current = existingTags[index];
  if (current.status === 'RETROUVEE') {
    return {
      ok: false,
      error: `L'étiquette ${targetSerial} est déjà marquée RETROUVÉE.`,
    };
  }

  const wasReportedLost =
    current.status === 'PERDUE' || Boolean(current.wasLost);
  const now = new Date().toISOString();

  const updatedTag: StickerTag = {
    ...current,
    status: 'RETROUVEE',
    wasLost: false,
    recoveredAt: now,
    recoveredBy: 'CALL_CENTER',
  };

  const nextTags = [...existingTags];
  nextTags[index] = updatedTag;
  saveTags(nextTags);

  if (!wasReportedLost) {
    return {
      ok: true,
      nextTags,
      nextNotifications: existingNotifications,
      notificationCreated: false,
    };
  }

  const objectLabel = current.objectType || 'Objet';
  const notification: SubscriberNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    serial: current.serial,
    objectType: current.objectType,
    title: `${objectLabel} retrouvé (${current.serial})`,
    message: `Votre étiquette ${current.serial} signalée PERDUE vient d'être passée à RETROUVÉE par le centre d'appel Antiperte. Contactez le ${OFFICIAL_TEL} / ${OFFICIAL_WHATSAPP_DISPLAY} pour organiser la récupération.`,
    createdAt: now,
    read: false,
  };

  const nextNotifications = [notification, ...existingNotifications];
  saveNotifications(nextNotifications);

  return {
    ok: true,
    nextTags,
    nextNotifications,
    notificationCreated: true,
  };
}

export function markNotificationRead(
  existing: SubscriberNotification[],
  id: string
): SubscriberNotification[] {
  const next = existing.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(next);
  return next;
}

export function markAllNotificationsRead(
  existing: SubscriberNotification[]
): SubscriberNotification[] {
  const next = existing.map((n) => ({ ...n, read: true }));
  saveNotifications(next);
  return next;
}

export function dismissNotification(
  existing: SubscriberNotification[],
  id: string
): SubscriberNotification[] {
  const next = existing.filter((n) => n.id !== id);
  saveNotifications(next);
  return next;
}

// --- Messagerie Interne (localStorage) ---

export const ADMIN_PARTICIPANT: MessageParticipant = {
  id: 'admin',
  name: 'Admin Antiperte',
  role: 'admin',
};

export const VISITOR_PARTICIPANT: MessageParticipant = {
  id: 'visiteur-local',
  name: 'Visiteur',
  role: 'visiteur',
};

export const FRANCHISE_PARTICIPANT: MessageParticipant = {
  id: 'franchise-BAF-001',
  name: 'Franchisé BAF-001',
  role: 'franchise',
  franchiseCode: DEFAULT_FRANCHISE_CODE,
};

function createInitialConversations(): ConversationThread[] {
  const now = new Date();
  const hoursAgo = (h: number) =>
    new Date(now.getTime() - h * 3600000).toISOString();

  const abonne1: MessageParticipant = {
    id: 'abonne-AP-000001',
    name: 'Jean-Paul Kamga (AP-000001)',
    role: 'abonne',
    franchiseCode: DEFAULT_FRANCHISE_CODE,
  };

  return [
    {
      id: 'conv-seed-1',
      subject: 'Activation Kit 1000 F',
      participants: [abonne1, FRANCHISE_PARTICIPANT],
      updatedAt: hoursAgo(3),
      messages: [
        {
          id: 'msg-seed-1',
          senderId: abonne1.id,
          senderName: abonne1.name,
          senderRole: 'abonne',
          text: 'Bonjour, mon étiquette AP-000001 est bien activée pour ma CNI. Merci !',
          createdAt: hoursAgo(4),
        },
        {
          id: 'msg-seed-2',
          senderId: FRANCHISE_PARTICIPANT.id,
          senderName: FRANCHISE_PARTICIPANT.name,
          senderRole: 'franchise',
          text: 'Parfait Jean-Paul ! En cas de besoin, contactez-nous ou appelez le 690888883.',
          createdAt: hoursAgo(3),
        },
      ],
    },
    {
      id: 'conv-seed-2',
      subject: 'Demande point de vente Bamenda',
      participants: [VISITOR_PARTICIPANT, ADMIN_PARTICIPANT],
      updatedAt: hoursAgo(1),
      messages: [
        {
          id: 'msg-seed-3',
          senderId: VISITOR_PARTICIPANT.id,
          senderName: VISITOR_PARTICIPANT.name,
          senderRole: 'visiteur',
          text: 'Bonjour Admin, où puis-je acheter le Kit Antiperte 1000 F à Bamenda ?',
          createdAt: hoursAgo(2),
        },
        {
          id: 'msg-seed-4',
          senderId: ADMIN_PARTICIPANT.id,
          senderName: ADMIN_PARTICIPANT.name,
          senderRole: 'admin',
          text: 'Bonjour ! Vous pouvez commander directement via WhatsApp +237 690 88 88 83 ou passer au bureau Multicolor Limited B.P. 816 Bamenda.',
          createdAt: hoursAgo(1),
        },
      ],
    },
  ];
}

export function loadConversations(): ConversationThread[] {
  try {
    const raw = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) {
      const seed = createInitialConversations();
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fallback
  }
  const seed = createInitialConversations();
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export function saveConversations(threads: ConversationThread[]): void {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(threads));
}

export function getSubscriberParticipants(
  tags: StickerTag[],
  franchiseCodeFilter?: string
): MessageParticipant[] {
  const seen = new Set<string>();
  const result: MessageParticipant[] = [];
  for (const t of tags) {
    if (!isTagActivated(t) || !t.ownerName) continue;
    if (
      franchiseCodeFilter &&
      t.franchiseCode.toUpperCase() !== franchiseCodeFilter.toUpperCase()
    ) {
      continue;
    }
    const id = `abonne-${t.serial}`;
    if (seen.has(id)) continue;
    seen.add(id);
    result.push({
      id,
      name: `${t.ownerName} (${t.serial})`,
      role: 'abonne',
      franchiseCode: t.franchiseCode,
    });
  }
  return result;
}

export function getAvailableRecipients(
  senderRole: MessageRole,
  senderParticipant: MessageParticipant,
  tags: StickerTag[]
): MessageParticipant[] {
  if (senderRole === 'visiteur') {
    return [ADMIN_PARTICIPANT];
  }
  if (senderRole === 'abonne') {
    const franchiseCode =
      senderParticipant.franchiseCode || DEFAULT_FRANCHISE_CODE;
    const franchiseTarget: MessageParticipant =
      franchiseCode === DEFAULT_FRANCHISE_CODE
        ? FRANCHISE_PARTICIPANT
        : {
            id: `franchise-${franchiseCode}`,
            name: `Franchisé ${franchiseCode}`,
            role: 'franchise',
            franchiseCode,
          };
    return [ADMIN_PARTICIPANT, franchiseTarget];
  }
  if (senderRole === 'franchise') {
    const subscribers = getSubscriberParticipants(
      tags,
      senderParticipant.franchiseCode || DEFAULT_FRANCHISE_CODE
    );
    return [ADMIN_PARTICIPANT, ...subscribers];
  }
  // Admin can write to everyone
  const allSubscribers = getSubscriberParticipants(tags);
  return [VISITOR_PARTICIPANT, FRANCHISE_PARTICIPANT, ...allSubscribers];
}

export function filterVisibleConversations(
  threads: ConversationThread[],
  role: MessageRole,
  actorId: string
): ConversationThread[] {
  const sorted = [...threads].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
  if (role === 'admin') {
    return sorted;
  }
  return sorted.filter((thread) =>
    thread.participants.some((p) => p.id === actorId)
  );
}

export function sendNewConversation(
  existingThreads: ConversationThread[],
  sender: MessageParticipant,
  recipient: MessageParticipant,
  text: string
): { nextThreads: ConversationThread[]; createdThread: ConversationThread } {
  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    text: text.trim(),
    createdAt: now,
  };

  const createdThread: ConversationThread = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    subject: `${sender.name} → ${recipient.name}`,
    participants: [sender, recipient],
    messages: [message],
    updatedAt: now,
  };

  const nextThreads = [createdThread, ...existingThreads];
  saveConversations(nextThreads);
  return { nextThreads, createdThread };
}

export function appendReplyToConversation(
  existingThreads: ConversationThread[],
  threadId: string,
  sender: MessageParticipant,
  text: string
): ConversationThread[] {
  const now = new Date().toISOString();
  const reply: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    text: text.trim(),
    createdAt: now,
  };

  const nextThreads = existingThreads.map((thread) =>
    thread.id === threadId
      ? {
          ...thread,
          updatedAt: now,
          messages: [...thread.messages, reply],
        }
      : thread
  );
  saveConversations(nextThreads);
  return nextThreads;
}
