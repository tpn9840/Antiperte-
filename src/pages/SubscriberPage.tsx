import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Hash,
  KeyRound,
  Lock,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  User,
  X,
} from 'lucide-react';
import { LockScreenWallpaperModal } from '../components/LockScreenWallpaperModal';
import { OFFICIAL_TEL, OFFICIAL_TEL_HREF } from '../lib/constants';
import {
  getPushPermissionState,
  requestLocalPushPermission,
  type PushPermissionState,
} from '../services/pushNotifications';
import {
  activateTag,
  dismissNotification,
  isTagActivated,
  markAllNotificationsRead,
  markNotificationRead,
  updateTagStatus,
} from '../services/storage';
import type {
  ObjectType,
  RewardAmount,
  StickerTag,
  SubscriberNotification,
  SubscriptionPlan,
} from '../types/antiperte';

interface SubscriberPageProps {
  tags: StickerTag[];
  onUpdateTags: (nextTags: StickerTag[]) => void;
  isGoldPhoneActive: boolean;
  onActivateGoldPhone: () => void;
  notifications: SubscriberNotification[];
  onUpdateNotifications: (next: SubscriberNotification[]) => void;
}

const GOLD_PHONE_WA_URL = `https://wa.me/237690888883?text=${encodeURIComponent(
  'Bonjour Antiperte, je veux acheter le Pack Téléphone Or (Promo 2000 F)'
)}`;

const OBJECT_OPTIONS: ObjectType[] = [
  'CNI',
  'Permis',
  'Bagage',
  'Téléphone',
  'Clés',
  'Passeport',
];

const REWARD_OPTIONS: RewardAmount[] = [1000, 2000, 5000];

export const SubscriberPage: React.FC<SubscriberPageProps> = ({
  tags,
  onUpdateTags,
  isGoldPhoneActive,
  onActivateGoldPhone,
  notifications,
  onUpdateNotifications,
}) => {
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const [pushPermission, setPushPermission] = useState<PushPermissionState>(
    () => getPushPermissionState()
  );

  const handleEnablePush = async () => {
    const nextState = await requestLocalPushPermission();
    setPushPermission(nextState);
  };
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [objectType, setObjectType] = useState<ObjectType>('CNI');
  const [reward, setReward] = useState<RewardAmount>(2000);
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlan>('STANDARD');
  const [phoneModel, setPhoneModel] = useState('');
  const [phoneImei, setPhoneImei] = useState('');
  const [lockscreenConsent, setLockscreenConsent] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [wallpaperData, setWallpaperData] = useState<{
    open: boolean;
    emergencyName?: string;
    emergencyPhone?: string;
  }>({ open: false });

  const myTags = tags
    .filter(isTagActivated)
    .sort((a, b) =>
      (b.activatedAt || '').localeCompare(a.activatedAt || '')
    );

  const openWallpaperModal = (tag?: StickerTag) => {
    if (!isGoldPhoneActive) return;
    const source = tag || myTags.find((t) => t.objectType === 'Téléphone') || myTags[0];
    setWallpaperData({
      open: true,
      emergencyName: emergencyName.trim() || source?.emergencyName || '',
      emergencyPhone: emergencyPhone.trim() || source?.emergencyPhone || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!ownerName.trim() || !ownerPhone.trim()) {
      setFeedback({
        type: 'error',
        message: 'Veuillez renseigner votre nom et votre numéro de téléphone.',
      });
      return;
    }

    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      setFeedback({
        type: 'error',
        message:
          "Veuillez renseigner le nom et le téléphone du contact d'urgence.",
      });
      return;
    }

    const isPhone = objectType === 'Téléphone';
    const effectivePlan: SubscriptionPlan = isPhone
      ? 'TELEPHONE_OR'
      : selectedPlan;

    const result = activateTag(tags, {
      serial,
      pin,
      ownerName,
      ownerPhone,
      objectType,
      reward: isPhone || effectivePlan === 'TELEPHONE_OR' ? 5000 : reward,
      plan: effectivePlan,
      phoneModel: isPhone ? phoneModel : undefined,
      phoneImei: isPhone ? phoneImei : undefined,
      lockscreenConsent: isPhone ? lockscreenConsent : undefined,
      emergencyName,
      emergencyPhone,
    });

    if (!result.ok) {
      setFeedback({ type: 'error', message: result.error });
      return;
    }

    onUpdateTags(result.nextTags);
    setFeedback({
      type: 'success',
      message:
        effectivePlan === 'TELEPHONE_OR'
          ? `Étiquette ${result.tag.serial} activée avec Pack Téléphone Or (écran de verrouillage activé automatiquement) !`
          : `Étiquette ${result.tag.serial} activée pour 1 an !`,
    });
    setSerial('');
    setPin('');
    setOwnerName('');
    setOwnerPhone('');
    setSelectedPlan('STANDARD');
    setPhoneModel('');
    setPhoneImei('');
    setLockscreenConsent(false);
    setEmergencyName('');
    setEmergencyPhone('');
  };

  const handleStatusChange = (
    targetSerial: string,
    newStatus: 'PERDUE' | 'RETROUVEE'
  ) => {
    const next = updateTagStatus(tags, targetSerial, newStatus);
    onUpdateTags(next);
  };

  return (
    <div className="space-y-6">
      {/* Système de notifications Centre d'appel (PERDUE -> RETROUVÉE) */}
      <section
        aria-label="Notifications Centre d'appel"
        className={`rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 ${
          unreadNotificationsCount > 0
            ? 'bg-emerald-50 border-emerald-300'
            : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                unreadNotificationsCount > 0
                  ? 'bg-emerald-700 text-white'
                  : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-950">
                Notifications Centre d&apos;appel
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                {unreadNotificationsCount > 0
                  ? `${unreadNotificationsCount} alerte${unreadNotificationsCount > 1 ? 's' : ''} non lue${unreadNotificationsCount > 1 ? 's' : ''} — Objet signalé PERDU passé à RETROUVÉ.`
                  : notifications.length > 0
                    ? `${notifications.length} notification${notifications.length > 1 ? 's' : ''} consultée${notifications.length > 1 ? 's' : ''}.`
                    : "Vous serez alerté ici dès qu'une étiquette PERDUE est marquée RETROUVÉE par le centre d'appel."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pushPermission === 'default' && (
              <button
                type="button"
                onClick={handleEnablePush}
                className="min-h-[42px] rounded-xl bg-neutral-950 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-neutral-800 cursor-pointer whitespace-nowrap"
              >
                Activer les notifications push
              </button>
            )}
            {pushPermission === 'granted' && (
              <span className="text-xs font-bold text-emerald-800 whitespace-nowrap">
                Push temps réel activé
              </span>
            )}
            {pushPermission === 'denied' && (
              <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">
                Push bloqué dans le navigateur
              </span>
            )}
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  onUpdateNotifications(markAllNotificationsRead(notifications))
                }
                className="min-h-[42px] rounded-xl bg-white border border-emerald-300 px-3.5 py-2 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100 cursor-pointer whitespace-nowrap"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <article
                key={notif.id}
                className={`rounded-2xl border p-4 space-y-3 ${
                  !notif.read
                    ? 'bg-white border-emerald-300 shadow-sm'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span
                        className={
                          !notif.read ? 'text-emerald-700' : 'text-neutral-500'
                        }
                      >
                        {!notif.read ? 'Nouvelle alerte' : 'Lue'}
                      </span>
                      <span aria-hidden="true" className="text-neutral-400">
                        ·
                      </span>
                      <span className="font-mono-code tabular-nums text-neutral-500">
                        {new Date(notif.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-neutral-950">
                      {notif.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Supprimer cette notification"
                    onClick={() =>
                      onUpdateNotifications(
                        dismissNotification(notifications, notif.id)
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-950 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={OFFICIAL_TEL_HREF}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-emerald-800 whitespace-nowrap"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>Appeler Antiperte : {OFFICIAL_TEL}</span>
                  </a>

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateNotifications(
                          markNotificationRead(notifications, notif.id)
                        )
                      }
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-neutral-200 px-3.5 py-2 text-xs font-bold text-neutral-950 hover:bg-neutral-300 cursor-pointer whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                      <span>Marquer comme lue</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Outil Écran Verrouillé Pack Téléphone Or — actif uniquement si abonnement Téléphone Or acheté */}
      <section className="rounded-3xl bg-neutral-950 p-5 sm:p-6 text-white shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-amber-400">
              {isGoldPhoneActive
                ? 'Pack Téléphone Or actif · Promo 2 000 F'
                : 'Pack Téléphone Or requis (Promo 2 000 F)'}
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Écran de verrouillage — Pack Téléphone Or
            </h2>
            <p className="text-sm text-neutral-300">
              {isGoldPhoneActive
                ? "Générez votre écran verrouillé bilingue (Récompense 5000 F, Contact d'urgence + Antiperte 24h/24) sans exposer votre nom ni votre IMEI."
                : "Cet écran de verrouillage n'est actif que si l'abonnement spécifique Téléphone Or est acheté."}
            </p>
          </div>

          <button
            type="button"
            disabled={!isGoldPhoneActive}
            onClick={() => openWallpaperModal()}
            className={`flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl px-5 py-3 text-sm sm:text-base font-extrabold transition-colors whitespace-nowrap shrink-0 ${
              isGoldPhoneActive
                ? 'bg-[#D32F2F] text-white hover:bg-[#B71C1C] cursor-pointer'
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
            }`}
          >
            {isGoldPhoneActive ? (
              <Smartphone className="h-5 w-5 shrink-0" />
            ) : (
              <Lock className="h-5 w-5 shrink-0" />
            )}
            <span>MON CONTACT D&apos;URGENCE SUR ÉCRAN VERROUILLÉ</span>
          </button>
        </div>

        {!isGoldPhoneActive && (
          <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={GOLD_PHONE_WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#15803D] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#166534]"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>Acheter Pack Téléphone Or (WhatsApp)</span>
            </a>
            <button
              type="button"
              onClick={onActivateGoldPhone}
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-neutral-950 hover:bg-amber-300 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>J&apos;ai acheté le Pack Téléphone Or — Activer</span>
            </button>
          </div>
        )}
      </section>

      {/* Infographie simple en 3 étapes : Comment activer mon étiquette */}
      <section
        aria-labelledby="how-to-activate-title"
        className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-5 sm:p-7 space-y-5"
      >
        <div>
          <h2
            id="how-to-activate-title"
            className="text-xl sm:text-2xl font-extrabold text-neutral-950"
          >
            Comment activer mon étiquette
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Suivez ces 3 étapes simples pour activer votre protection en moins
            d&apos;une minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* Étape 1 : Gratter le PIN */}
          <div className="relative rounded-2xl bg-neutral-50 border border-neutral-200 p-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D32F2F] text-white font-mono-code text-base font-extrabold">
                  1
                </span>
                <div
                  aria-hidden="true"
                  className="flex items-center gap-1.5 rounded-xl bg-neutral-200 px-3 py-1.5 text-xs font-mono-code font-bold text-neutral-800"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#D32F2F]" />
                  <span>7 chiffres</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-neutral-950">
                1. Gratter le PIN
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Grattez la zone grise argentée au bas de l&apos;étiquette pour
                découvrir votre code secret à 7 chiffres.
              </p>
            </div>

            <div
              aria-hidden="true"
              className="hidden md:flex justify-end text-neutral-400"
            >
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          {/* Étape 2 : Entrer le numéro de série */}
          <div className="relative rounded-2xl bg-neutral-50 border border-neutral-200 p-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white font-mono-code text-base font-extrabold">
                  2
                </span>
                <div
                  aria-hidden="true"
                  className="flex items-center gap-1.5 rounded-xl bg-white border border-neutral-300 px-3 py-1.5 text-xs font-mono-code font-extrabold text-neutral-950"
                >
                  <Hash className="h-3.5 w-3.5 text-[#D32F2F]" />
                  <span>AP-000123</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-neutral-950">
                2. Entrer la série
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Saisissez le numéro de série imprimé sur l&apos;étiquette et
                votre PIN à gratter dans le formulaire.
              </p>
            </div>

            <div
              aria-hidden="true"
              className="hidden md:flex justify-end text-neutral-400"
            >
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          {/* Étape 3 : Remplir le formulaire */}
          <div className="relative rounded-2xl bg-neutral-50 border border-neutral-200 p-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white font-mono-code text-base font-extrabold">
                  3
                </span>
                <div
                  aria-hidden="true"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-extrabold text-emerald-800"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  <span>Protégé 1 an</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-neutral-950">
                3. Remplir le formulaire
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Renseignez votre nom, l&apos;objet, la récompense et votre
                contact d&apos;urgence, puis cliquez sur Activer.
              </p>
            </div>

            <div
              aria-hidden="true"
              className="hidden md:flex justify-end text-emerald-700"
            >
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">
        {/* Formulaire d'activation */}
        <section className="lg:col-span-6 rounded-3xl bg-white p-5 sm:p-7 border border-neutral-200 shadow-sm">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-neutral-950">
              Zone Abonné — Activer
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Remplissez ces champs pour protéger votre objet pendant 1 an.
            </p>
          </div>

          {feedback && (
            <div
              role="alert"
              className={`mb-5 flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-[#D32F2F] border border-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-[#D32F2F]" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sub-serial"
                  className="block text-sm font-bold text-neutral-950 mb-1.5"
                >
                  Numéro de série
                </label>
                <input
                  id="sub-serial"
                  type="text"
                  required
                  value={serial}
                  onChange={(e) => setSerial(e.target.value.toUpperCase())}
                  placeholder="Ex : AP-000003"
                  className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base font-mono-code font-semibold text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                />
              </div>

              <div>
                <label
                  htmlFor="sub-pin"
                  className="block text-sm font-bold text-neutral-950 mb-1.5"
                >
                  PIN à gratter (7 chiffres min.)
                </label>
                <input
                  id="sub-pin"
                  type="text"
                  inputMode="numeric"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex : 1234567"
                  className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base font-mono-code font-semibold tracking-wider text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sub-name"
                  className="block text-sm font-bold text-neutral-950 mb-1.5"
                >
                  Nom complet
                </label>
                <input
                  id="sub-name"
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                />
              </div>

              <div>
                <label
                  htmlFor="sub-phone"
                  className="block text-sm font-bold text-neutral-950 mb-1.5"
                >
                  Téléphone
                </label>
                <input
                  id="sub-phone"
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="6XX XX XX XX"
                  className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                />
              </div>
            </div>

            {/* Objet */}
            <div>
              <span className="block text-sm font-bold text-neutral-950 mb-2">
                Objet protégé
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {OBJECT_OPTIONS.map((item) => {
                  const selected = objectType === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setObjectType(item);
                        if (item === 'Téléphone') {
                          setSelectedPlan('TELEPHONE_OR');
                          setReward(5000);
                        } else {
                          setSelectedPlan('STANDARD');
                          setPhoneModel('');
                          setPhoneImei('');
                          setLockscreenConsent(false);
                        }
                      }}
                      className={`min-h-[48px] rounded-xl px-3 py-2.5 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selected
                          ? 'bg-neutral-950 text-white ring-2 ring-neutral-950'
                          : 'bg-neutral-200 text-neutral-950 hover:bg-neutral-300'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {objectType === 'Téléphone' && (
              <div className="rounded-2xl border border-red-300 bg-red-50/70 p-4 space-y-4">
                <div className="flex items-start gap-2.5 text-sm font-extrabold text-[#D32F2F]">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>
                    Étiquette simple interdite sur téléphone. Pack Or
                    obligatoire.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="sub-phone-model"
                      className="block text-xs font-bold text-neutral-950 mb-1.5"
                    >
                      Marque / Modèle (obligatoire)
                    </label>
                    <input
                      id="sub-phone-model"
                      type="text"
                      required
                      value={phoneModel}
                      onChange={(e) => setPhoneModel(e.target.value)}
                      placeholder="Ex : Samsung Galaxy A54"
                      className="w-full min-h-[48px] rounded-xl border border-neutral-300 bg-white px-3.5 text-sm font-semibold text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sub-phone-imei"
                      className="block text-xs font-bold text-neutral-950 mb-1.5"
                    >
                      IMEI 15 chiffres (trouvé en tapant *#06#)
                    </label>
                    <input
                      id="sub-phone-imei"
                      type="text"
                      inputMode="numeric"
                      maxLength={15}
                      required
                      value={phoneImei}
                      onChange={(e) =>
                        setPhoneImei(e.target.value.replace(/\D/g, '').slice(0, 15))
                      }
                      placeholder="15 chiffres (*#06#)"
                      className="w-full min-h-[48px] rounded-xl border border-neutral-300 bg-white px-3.5 text-sm font-mono-code font-bold text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] font-mono-code font-semibold text-neutral-600">
                      {phoneImei.length} / 15 chiffres
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-xl bg-white border border-neutral-200 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={lockscreenConsent}
                    onChange={(e) => setLockscreenConsent(e.target.checked)}
                    className="mt-0.5 h-5 w-5 accent-[#D32F2F] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs sm:text-sm font-bold text-neutral-950 leading-snug">
                    J&apos;ai compris que mon numéro d&apos;urgence sera affiché
                    sur mon écran de verrouillage
                  </span>
                </label>
              </div>
            )}

            {/* Récompense */}
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <span className="block text-sm font-bold text-neutral-950">
                  Récompense promise
                </span>
                {objectType === 'Téléphone' && (
                  <span className="text-xs font-extrabold text-[#D32F2F]">
                    Bloquée à 5000 F (non modifiable)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {REWARD_OPTIONS.map((amount) => {
                  const isPhoneMode = objectType === 'Téléphone';
                  const selected = isPhoneMode
                    ? amount === 5000
                    : reward === amount;
                  const disabled = isPhoneMode && amount !== 5000;
                  return (
                    <button
                      key={amount}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (!isPhoneMode) setReward(amount);
                      }}
                      className={`min-h-[50px] rounded-xl px-3 py-2.5 text-base font-extrabold font-mono-code transition-all whitespace-nowrap ${
                        selected
                          ? 'bg-[#D32F2F] text-white ring-2 ring-[#D32F2F]'
                          : disabled
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-neutral-200 text-neutral-950 hover:bg-neutral-300 cursor-pointer'
                      }`}
                    >
                      {amount} F
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact d'urgence */}
            <div className="pt-2 border-t border-neutral-200 space-y-4">
              <p className="text-sm font-bold text-neutral-950">
                Contact d&apos;urgence
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="sub-emergency-name"
                    className="block text-xs font-semibold text-neutral-700 mb-1.5"
                  >
                    Nom du proche
                  </label>
                  <input
                    id="sub-emergency-name"
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Nom d'urgence"
                    className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sub-emergency-phone"
                    className="block text-xs font-semibold text-neutral-700 mb-1.5"
                  >
                    Téléphone d&apos;urgence
                  </label>
                  <input
                    id="sub-emergency-phone"
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="6XX XX XX XX"
                    className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[56px] rounded-2xl bg-[#D32F2F] px-6 py-4 text-lg font-extrabold text-white shadow-sm transition-all hover:bg-[#B71C1C] active:scale-[0.98] cursor-pointer"
            >
              Activer
            </button>
          </form>
        </section>

        {/* Mes étiquettes */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-extrabold text-neutral-950">
              Mes étiquettes
            </h2>
            <span className="text-sm font-semibold text-neutral-600 font-mono-code">
              {myTags.length} activée{myTags.length > 1 ? 's' : ''}
            </span>
          </div>

          {myTags.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 border border-neutral-200 text-center space-y-2">
              <ShieldCheck className="mx-auto h-10 w-10 text-neutral-400" />
              <p className="text-base font-bold text-neutral-950">
                Aucune étiquette activée
              </p>
              <p className="text-sm text-neutral-600">
                Utilisez le formulaire pour activer votre première étiquette.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myTags.map((tag) => {
                const isLost = tag.status === 'PERDUE';
                const isFound = tag.status === 'RETROUVEE';
                const isReported = tag.status === 'SIGNALEE';

                return (
                  <article
                    key={tag.serial}
                    className="rounded-3xl bg-white p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-extrabold text-neutral-950">
                          {tag.objectType || 'Objet'}
                        </p>
                        <p className="mt-0.5 text-sm font-mono-code font-bold text-neutral-600">
                          {tag.serial}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-sm font-extrabold">
                        {isReported ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-white">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            SIGNALÉE
                          </span>
                        ) : isLost ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#D32F2F] px-3 py-1.5 text-white">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            PERDUE
                          </span>
                        ) : isFound ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-white">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            RETROUVÉE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-3 py-1.5 text-white">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-white" />
                            ACTIVÉE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-100 text-sm text-neutral-800">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span className="truncate font-medium">
                          {tag.ownerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span className="font-mono-code">{tag.ownerPhone}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                      <span>
                        Récompense :{' '}
                        <strong className="text-neutral-950 font-mono-code">
                          {tag.reward} F
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Urgence : {tag.emergencyName} ({tag.emergencyPhone})
                      </span>
                    </div>

                    {/* Boutons PERDUE / RETROUVEE */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(tag.serial, 'PERDUE')}
                        disabled={isLost}
                        className={`min-h-[50px] rounded-xl px-4 py-3 text-sm sm:text-base font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                          isLost
                            ? 'bg-red-100 text-[#D32F2F] cursor-default'
                            : 'bg-[#D32F2F] text-white hover:bg-[#B71C1C] active:scale-[0.98]'
                        }`}
                      >
                        PERDUE
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(tag.serial, 'RETROUVEE')
                        }
                        disabled={isFound}
                        className={`min-h-[50px] rounded-xl px-4 py-3 text-sm sm:text-base font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                          isFound
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-neutral-200 text-neutral-950 hover:bg-neutral-300 active:scale-[0.98]'
                        }`}
                      >
                        RETROUVÉE
                      </button>
                    </div>

                    {tag.objectType === 'Téléphone' && isGoldPhoneActive && (
                      <button
                        type="button"
                        onClick={() => openWallpaperModal(tag)}
                        className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-neutral-100 cursor-pointer"
                      >
                        <Smartphone className="h-4 w-4 text-[#D32F2F] shrink-0" />
                        <span>
                          Écran verrouillé Téléphone Or (Contact urgence)
                        </span>
                      </button>
                    )}

                    {(isLost || isReported) && (
                      <a
                        href={OFFICIAL_TEL_HREF}
                        className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-extrabold text-white hover:bg-neutral-800"
                      >
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>Appeler Antiperte : {OFFICIAL_TEL}</span>
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <LockScreenWallpaperModal
        isOpen={wallpaperData.open}
        isSubscribed={isGoldPhoneActive}
        onClose={() => setWallpaperData({ open: false })}
        initialEmergencyName={wallpaperData.emergencyName}
        initialEmergencyPhone={wallpaperData.emergencyPhone}
      />
    </div>
  );
};
