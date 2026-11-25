import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Headset,
  Megaphone,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { DEFAULT_FEATURED_TEXTS } from '../lib/constants';
import { triggerLocalRecoveryPushNotification } from '../services/pushNotifications';
import {
  DEFAULT_FRANCHISE_CODE,
  exportTagsToCSV,
  generateBatchTags,
  isTagActivated,
  isTagSold,
  markTagRecoveredByCallCenter,
  normalizeSerial,
  saveFeaturedTexts,
} from '../services/storage';
import type {
  StickerTag,
  SubscriberNotification,
  TagStatus,
} from '../types/antiperte';

interface AdminPageProps {
  tags: StickerTag[];
  onUpdateTags: (nextTags: StickerTag[]) => void;
  featuredTexts: [string, string, string];
  onUpdateFeaturedTexts: (nextTexts: [string, string, string]) => void;
  notifications: SubscriberNotification[];
  onUpdateNotifications: (next: SubscriberNotification[]) => void;
}

type FilterTab =
  | 'TOUTES'
  | 'STOCK'
  | 'VENDUE'
  | 'ACTIVEE'
  | 'PERDUE'
  | 'SIGNALEE';

const PAGE_SIZE = 25;

export const AdminPage: React.FC<AdminPageProps> = ({
  tags,
  onUpdateTags,
  featuredTexts,
  onUpdateFeaturedTexts,
  notifications,
  onUpdateNotifications,
}) => {
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const [callSerial, setCallSerial] = useState('');
  const [callPin, setCallPin] = useState('');
  const [searchedSerial, setSearchedSerial] = useState('');
  const [verifiedPinInput, setVerifiedPinInput] = useState('');
  const [callCenterMessage, setCallCenterMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('TOUTES');
  const [tableSearch, setTableSearch] = useState('');
  const [page, setPage] = useState(1);

  const [draftSlides, setDraftSlides] =
    useState<[string, string, string]>(featuredTexts);
  const [slidesSavedMsg, setSlidesSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraftSlides(featuredTexts);
  }, [featuredTexts]);

  const totalGenerated = tags.length;
  const totalSold = useMemo(() => tags.filter(isTagSold).length, [tags]);
  const totalActivated = useMemo(
    () => tags.filter(isTagActivated).length,
    [tags]
  );
  const totalReported = useMemo(
    () => tags.filter((t) => t.status === 'SIGNALEE').length,
    [tags]
  );

  const handleGenerate100 = () => {
    const { nextTags, created } = generateBatchTags(
      tags,
      100,
      DEFAULT_FRANCHISE_CODE
    );
    onUpdateTags(nextTags);
    const first = created[0]?.serial;
    const last = created[created.length - 1]?.serial;
    setBatchMessage(
      `100 nouvelles étiquettes générées (${first} à ${last}).`
    );
    setPage(1);
  };

  const handleCallCenterSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCallCenterMessage(null);
    setSearchedSerial(normalizeSerial(callSerial));
    setVerifiedPinInput(callPin.trim());
  };

  const handleMarkRecoveredByCallCenter = (serial: string) => {
    const res = markTagRecoveredByCallCenter(tags, notifications, serial);
    if (!res.ok) {
      setCallCenterMessage({ type: 'error', text: res.error });
      return;
    }
    onUpdateTags(res.nextTags);
    onUpdateNotifications(res.nextNotifications);

    const updatedTag = res.nextTags.find((t) => t.serial === serial);
    void triggerLocalRecoveryPushNotification({
      serial,
      objectType: updatedTag?.objectType,
      message: `Votre étiquette ${serial} (${updatedTag?.objectType || 'Objet'}) est passée au statut RETROUVÉE par le centre d'appel Antiperte.`,
    });

    setCallCenterMessage({
      type: 'success',
      text: res.notificationCreated
        ? `Étiquette ${serial} passée à RETROUVÉE. Notification envoyée à l'abonné dans Mon compte.`
        : `Étiquette ${serial} passée à RETROUVÉE par le centre d'appel.`,
    });
  };

  const handleSaveSlides = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: [string, string, string] = [
      draftSlides[0].trim() || DEFAULT_FEATURED_TEXTS[0],
      draftSlides[1].trim() || DEFAULT_FEATURED_TEXTS[1],
      draftSlides[2].trim() || DEFAULT_FEATURED_TEXTS[2],
    ];
    saveFeaturedTexts(cleaned);
    onUpdateFeaturedTexts(cleaned);
    setSlidesSavedMsg('Textes « À LA UNE » mis à jour sur l’accueil.');
  };

  const handleResetSlides = () => {
    const defaults: [string, string, string] = [...DEFAULT_FEATURED_TEXTS] as [
      string,
      string,
      string,
    ];
    setDraftSlides(defaults);
    saveFeaturedTexts(defaults);
    onUpdateFeaturedTexts(defaults);
    setSlidesSavedMsg('Textes « À LA UNE » réinitialisés.');
  };

  const foundTag = useMemo(() => {
    if (!searchedSerial) return null;
    return tags.find((t) => t.serial === searchedSerial) || null;
  }, [tags, searchedSerial]);

  const pinStatus = useMemo(() => {
    if (!foundTag || !verifiedPinInput) return 'NONE';
    if (!/^\d{7,}$/.test(verifiedPinInput)) return 'INCOMPLETE';
    return foundTag.pin === verifiedPinInput ? 'VALID' : 'INVALID';
  }, [foundTag, verifiedPinInput]);

  const filteredTags = useMemo(() => {
    const q = tableSearch.trim().toUpperCase();
    return tags.filter((t) => {
      if (filterTab === 'VENDUE' && t.status !== 'VENDUE') return false;
      if (filterTab === 'ACTIVEE' && !isTagActivated(t)) return false;
      if (
        filterTab !== 'TOUTES' &&
        filterTab !== 'VENDUE' &&
        filterTab !== 'ACTIVEE' &&
        t.status !== filterTab
      ) {
        return false;
      }
      if (
        q &&
        !t.serial.includes(q) &&
        !t.franchiseCode.toUpperCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [tags, filterTab, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredTags.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedTags = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTags.slice(start, start + PAGE_SIZE);
  }, [filteredTags, safePage]);

  const renderStatusText = (status: TagStatus) => {
    if (status === 'SIGNALEE') {
      return <span className="font-bold text-amber-700">SIGNALÉE</span>;
    }
    if (status === 'PERDUE') {
      return <span className="font-bold text-[#D32F2F]">PERDUE</span>;
    }
    if (status === 'RETROUVEE') {
      return <span className="font-bold text-emerald-700">RETROUVÉE</span>;
    }
    if (status === 'ACTIVEE') {
      return <span className="font-bold text-neutral-950">ACTIVÉE</span>;
    }
    if (status === 'VENDUE') {
      return <span className="font-semibold text-amber-700">VENDUE</span>;
    }
    return <span className="text-neutral-500">STOCK</span>;
  };

  return (
    <div className="space-y-6">
      {/* En-tête & Actions principales Admin */}
      <section className="rounded-3xl bg-white p-5 sm:p-7 border border-neutral-200 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-950">
              Zone Admin &amp; Call Center
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Génération de séries AP, export CSV, carrousel À LA UNE et
              vérification d&apos;appels.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGenerate100}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-5 py-3 text-base font-extrabold text-white shadow-sm transition-all hover:bg-[#B71C1C] active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-5 w-5 shrink-0" />
              <span>Générer 100 étiquettes</span>
            </button>

            <button
              type="button"
              onClick={() => exportTagsToCSV(tags)}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-neutral-200 px-5 py-3 text-base font-bold text-neutral-950 transition-colors hover:bg-neutral-300 active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <Download className="h-5 w-5 shrink-0 text-neutral-800" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {batchMessage && (
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-900"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{batchMessage}</span>
          </div>
        )}

        {totalReported > 0 && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm font-bold text-amber-950"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 shrink-0 text-[#D32F2F]" />
              <span>
                {totalReported} objet{totalReported > 1 ? 's' : ''} signalé
                {totalReported > 1 ? 's' : ''} trouvé
                {totalReported > 1 ? 's' : ''} — À traiter par le Call Center.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterTab('SIGNALEE');
                setPage(1);
              }}
              className="min-h-[38px] rounded-xl bg-[#D32F2F] px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-[#B71C1C] cursor-pointer whitespace-nowrap"
            >
              Voir Signalées
            </button>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-neutral-200">
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 sm:p-5">
            <p className="text-xs sm:text-sm font-semibold text-neutral-600">
              Total générées
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono-code text-neutral-950">
              {totalGenerated}
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 sm:p-5">
            <p className="text-xs sm:text-sm font-semibold text-neutral-600">
              Vendues
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono-code text-[#D32F2F]">
              {totalSold}
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 sm:p-5">
            <p className="text-xs sm:text-sm font-semibold text-neutral-600">
              Activées
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono-code text-emerald-700">
              {totalActivated}
            </p>
          </div>
        </div>
      </section>

      {/* Gestion À LA UNE (Carrousel 3 textes) */}
      <section className="rounded-3xl bg-white p-5 sm:p-7 border border-neutral-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-neutral-950">
              Zone À LA UNE (Carrousel Accueil)
            </h2>
            <p className="text-sm text-neutral-600">
              Modifiez les 3 textes promotionnels affichés sous le logo.
            </p>
          </div>
        </div>

        {slidesSavedMsg && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-900"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{slidesSavedMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveSlides} className="space-y-3">
          {[0, 1, 2].map((idx) => (
            <div key={idx}>
              <label
                htmlFor={`slide-text-${idx}`}
                className="block text-xs font-bold text-neutral-700 mb-1"
              >
                Texte diapositive {idx + 1}
              </label>
              <input
                id={`slide-text-${idx}`}
                type="text"
                required
                value={draftSlides[idx]}
                onChange={(e) => {
                  const next = [...draftSlides] as [string, string, string];
                  next[idx] = e.target.value;
                  setDraftSlides(next);
                  setSlidesSavedMsg(null);
                }}
                className="w-full min-h-[48px] rounded-xl border border-neutral-300 bg-white px-4 text-sm sm:text-base font-semibold text-neutral-950 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
              />
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#D32F2F] px-5 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#B71C1C] cursor-pointer"
            >
              <Save className="h-4 w-4 shrink-0" />
              <span>Enregistrer les textes</span>
            </button>
            <button
              type="button"
              onClick={handleResetSlides}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-neutral-200 px-5 py-2.5 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-300 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </form>
      </section>

      {/* Call Center : Recherche par série + Vérification PIN */}
      <section className="rounded-3xl bg-white p-5 sm:p-7 border border-neutral-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D32F2F] text-white">
            <Headset className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-neutral-950">
              Call Center — Recherche &amp; Vérification PIN
            </h2>
            <p className="text-sm text-neutral-600">
              Entrez la série lue sur l&apos;étiquette et vérifiez le PIN si
              nécessaire.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCallCenterSearch}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5">
            <label
              htmlFor="cc-serial"
              className="block text-xs font-bold text-neutral-950 mb-1.5"
            >
              Numéro de série
            </label>
            <input
              id="cc-serial"
              type="text"
              required
              value={callSerial}
              onChange={(e) => setCallSerial(e.target.value.toUpperCase())}
              placeholder="Ex : AP-000001"
              className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base font-mono-code font-bold text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
            />
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="cc-pin"
              className="block text-xs font-bold text-neutral-950 mb-1.5"
            >
              Vérification PIN (7 chiffres min.)
            </label>
            <input
              id="cc-pin"
              type="text"
              inputMode="numeric"
              value={callPin}
              onChange={(e) => setCallPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex : 1234567"
              className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base font-mono-code font-bold tracking-wider text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              className="flex w-full min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#D32F2F] px-5 py-3 text-base font-bold text-white transition-colors hover:bg-[#B71C1C] active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <Search className="h-5 w-5 shrink-0" />
              <span>Rechercher</span>
            </button>
          </div>
        </form>

        {searchedSerial && (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            {!foundTag ? (
              <div className="flex items-center gap-3 text-[#D32F2F] font-bold text-sm">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>
                  Aucune étiquette trouvée pour le numéro{' '}
                  <span className="font-mono-code">{searchedSerial}</span>.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold font-mono-code text-neutral-950">
                      {foundTag.serial}
                    </p>
                    <p className="text-xs text-neutral-600">
                      Franchisé : {foundTag.franchiseCode} · Statut :{' '}
                      {renderStatusText(foundTag.status)}
                    </p>
                  </div>

                  <div>
                    {pinStatus === 'VALID' && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        PIN VALIDE
                      </span>
                    )}
                    {pinStatus === 'INCOMPLETE' && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#D32F2F] px-3.5 py-2 text-xs font-extrabold text-white">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        PIN incomplet, 7 chiffres requis
                      </span>
                    )}
                    {pinStatus === 'INVALID' && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#D32F2F] px-3.5 py-2 text-xs font-extrabold text-white">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        PIN INCORRECT
                      </span>
                    )}
                    {pinStatus === 'NONE' && (
                      <span className="text-xs font-semibold text-neutral-600">
                        PIN non vérifié (saisir 7 chiffres ci-dessus)
                      </span>
                    )}
                  </div>
                </div>

                {isTagActivated(foundTag) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-neutral-200 text-sm">
                    <div>
                      <p className="text-xs text-neutral-500">Propriétaire</p>
                      <p className="font-bold text-neutral-950">
                        {foundTag.ownerName}
                      </p>
                      <p className="font-mono-code text-neutral-800">
                        {foundTag.ownerPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Objet</p>
                      <p className="font-bold text-neutral-950">
                        {foundTag.objectType}
                      </p>
                      {foundTag.phoneModel && (
                        <p className="text-xs text-neutral-700">
                          {foundTag.phoneModel}
                        </p>
                      )}
                      {foundTag.phoneImei && (
                        <p className="text-xs font-mono-code text-neutral-600">
                          IMEI : {foundTag.phoneImei}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Récompense</p>
                      <p className="font-extrabold font-mono-code text-[#D32F2F]">
                        {foundTag.reward} F
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">
                        Contact d&apos;urgence
                      </p>
                      <p className="font-bold text-neutral-950">
                        {foundTag.emergencyName}
                      </p>
                      <p className="font-mono-code text-neutral-800">
                        {foundTag.emergencyPhone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600 pt-2 border-t border-neutral-200">
                    Cette étiquette n&apos;est pas encore activée par un abonné.
                  </p>
                )}

                {foundTag.finderName && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-sm">
                    <p className="text-xs font-bold text-amber-800">
                      Signalement trouveur
                    </p>
                    <p className="mt-1 font-bold text-neutral-950">
                      {foundTag.finderName} —{' '}
                      <span className="font-mono-code">
                        {foundTag.finderPhone}
                      </span>
                    </p>
                  </div>
                )}

                {callCenterMessage && (
                  <div
                    role="status"
                    className={`rounded-xl border p-3 text-sm font-semibold ${
                      callCenterMessage.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-[#D32F2F]'
                    }`}
                  >
                    {callCenterMessage.text}
                  </div>
                )}

                {(foundTag.status === 'PERDUE' ||
                  foundTag.status === 'SIGNALEE' ||
                  foundTag.status === 'ACTIVEE') && (
                  <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-neutral-600">
                      {foundTag.status === 'PERDUE' || foundTag.wasLost
                        ? "Passer à RETROUVÉE alertera automatiquement l'abonné dans Mon compte."
                        : "Mettre à jour le statut suite à l'appel."}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkRecoveredByCallCenter(foundTag.serial)
                      }
                      className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-emerald-800 cursor-pointer whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Marquer RETROUVÉE (Centre d&apos;appel)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Tableau des étiquettes : Série, Statut, Franchisé */}
      <section className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-extrabold text-neutral-950">
              Tableau des étiquettes
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                aria-label="Filtrer le tableau par série ou franchisé"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value.toUpperCase());
                  setPage(1);
                }}
                placeholder="Filtrer série / franchisé..."
                className="w-full min-h-[42px] rounded-xl border border-neutral-300 bg-white pl-9 pr-3 text-sm font-mono-code font-semibold text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none"
              />
            </div>
          </div>

          {/* Filtres rapides */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
            {(
              [
                ['TOUTES', 'Toutes'],
                ['STOCK', 'Stock'],
                ['VENDUE', 'Vendues'],
                ['ACTIVEE', 'Activées'],
                ['PERDUE', 'Perdues'],
                ['SIGNALEE', 'Signalées'],
              ] as const
            ).map(([key, label]) => {
              const active = filterTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFilterTab(key);
                    setPage(1);
                  }}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#D32F2F] text-white shadow-sm'
                      : 'text-neutral-700 hover:text-neutral-950'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600">
                <th className="py-3.5 px-5">Série</th>
                <th className="py-3.5 px-5">Statut</th>
                <th className="py-3.5 px-5">Franchisé</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {paginatedTags.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-neutral-500"
                  >
                    Aucune étiquette dans cette catégorie.
                  </td>
                </tr>
              ) : (
                paginatedTags.map((tag) => {
                  const canRecover =
                    tag.status === 'PERDUE' || tag.status === 'SIGNALEE';
                  return (
                    <tr
                      key={tag.serial}
                      onClick={() => {
                        setCallSerial(tag.serial);
                        setSearchedSerial(tag.serial);
                        setCallPin('');
                        setVerifiedPinInput('');
                        setCallCenterMessage(null);
                      }}
                      className="hover:bg-neutral-50 cursor-pointer"
                    >
                      <td className="py-3.5 px-5 font-mono-code font-bold text-neutral-950">
                        {tag.serial}
                      </td>
                      <td className="py-3.5 px-5">
                        {renderStatusText(tag.status)}
                      </td>
                      <td className="py-3.5 px-5 font-mono-code text-neutral-700">
                        {tag.franchiseCode}
                      </td>
                      <td className="py-2.5 px-5 text-right">
                        {canRecover ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCallSerial(tag.serial);
                              setSearchedSerial(tag.serial);
                              handleMarkRecoveredByCallCenter(tag.serial);
                            }}
                            className="min-h-[36px] rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-800 cursor-pointer whitespace-nowrap"
                          >
                            Marquer RETROUVÉE
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400">
                            Consulter
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 bg-neutral-50 text-xs sm:text-sm">
            <span className="font-mono-code text-neutral-600">
              Page {safePage} / {totalPages} ({filteredTags.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="min-h-[40px] rounded-xl bg-neutral-200 px-3.5 py-1.5 font-bold text-neutral-950 hover:bg-neutral-300 disabled:opacity-40 cursor-pointer"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="min-h-[40px] rounded-xl bg-neutral-200 px-3.5 py-1.5 font-bold text-neutral-950 hover:bg-neutral-300 disabled:opacity-40 cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
