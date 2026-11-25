export type TagStatus =
  | 'STOCK'
  | 'VENDUE'
  | 'ACTIVEE'
  | 'PERDUE'
  | 'RETROUVEE'
  | 'SIGNALEE';

export type ObjectType =
  | 'CNI'
  | 'Permis'
  | 'Bagage'
  | 'Téléphone'
  | 'Clés'
  | 'Passeport';

export type RewardAmount = 1000 | 2000 | 5000;

export type SubscriptionPlan = 'STANDARD' | 'TELEPHONE_OR';

export interface GoldPhoneSubscription {
  active: boolean;
  activatedAt?: string;
  planName: 'Pack Téléphone Or';
  rewardAmount: 5000;
}

export type PageId =
  | 'home'
  | 'shop'
  | 'found'
  | 'messages'
  | 'account'
  | 'pro'
  | 'install';

export interface StickerTag {
  serial: string;
  pin: string;
  status: TagStatus;
  franchiseCode: string;
  createdAt: string;
  soldAt?: string;
  activatedAt?: string;
  expiresAt?: string;
  ownerName?: string;
  ownerPhone?: string;
  objectType?: ObjectType;
  reward?: RewardAmount;
  plan?: SubscriptionPlan;
  phoneModel?: string;
  phoneImei?: string;
  lockscreenConsent?: boolean;
  emergencyName?: string;
  emergencyPhone?: string;
  finderName?: string;
  finderPhone?: string;
  reportedAt?: string;
  wasLost?: boolean;
  recoveredAt?: string;
  recoveredBy?: 'USER' | 'CALL_CENTER';
}

export interface SubscriberNotification {
  id: string;
  serial: string;
  objectType?: ObjectType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ActivationPayload {
  serial: string;
  pin: string;
  ownerName: string;
  ownerPhone: string;
  objectType: ObjectType;
  reward: RewardAmount;
  plan?: SubscriptionPlan;
  phoneModel?: string;
  phoneImei?: string;
  lockscreenConsent?: boolean;
  emergencyName: string;
  emergencyPhone: string;
}

export interface FoundReportPayload {
  serial: string;
  pin: string;
  finderName: string;
  finderPhone: string;
}

export type MessageRole = 'visiteur' | 'abonne' | 'franchise' | 'admin';

export interface MessageParticipant {
  id: string;
  name: string;
  role: MessageRole;
  franchiseCode?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: MessageRole;
  text: string;
  createdAt: string;
}

export interface ConversationThread {
  id: string;
  participants: MessageParticipant[];
  subject: string;
  messages: ChatMessage[];
  updatedAt: string;
}
