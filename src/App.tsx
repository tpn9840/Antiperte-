import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Globe,
  Home,
  LayoutGrid,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  ShoppingBag,
  UserCheck,
} from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  OFFICIAL_BIP,
  OFFICIAL_BIP_HREF,
  OFFICIAL_COPYRIGHT,
  OFFICIAL_EMAIL,
  OFFICIAL_LOGO_SRC,
  OFFICIAL_PWA_SITE,
  OFFICIAL_PWA_URL,
  OFFICIAL_TEL,
  OFFICIAL_TEL_HREF,
  OFFICIAL_WHATSAPP_DISPLAY,
  OFFICIAL_WHATSAPP_URL,
} from './lib/constants';
import { FoundPage } from './pages/FoundPage';
import { HomePage } from './pages/HomePage';
import { InstallPage } from './pages/InstallPage';
import { MessagesPage } from './pages/MessagesPage';
import { ProPortalPage } from './pages/ProPortalPage';
import { ShopPage } from './pages/ShopPage';
import { SubscriberPage } from './pages/SubscriberPage';
import { subscribeToRealtimeSync } from './services/pushNotifications';
import {
  activateGoldPhoneSubscription,
  loadConversations,
  loadFeaturedTexts,
  loadGoldPhoneSubscription,
  loadNotifications,
  loadTags,
} from './services/storage';
import type {
  ConversationThread,
  GoldPhoneSubscription,
  PageId,
  StickerTag,
  SubscriberNotification,
} from './types/antiperte';

const NAV_ITEMS: {
  id: PageId;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'shop', label: 'Shop', icon: ShoppingBag },
  { id: 'found', label: "J'ai trouvé", icon: AlertCircle },
  { id: 'messages', label: 'Messagerie', icon: MessageSquare },
  { id: 'account', label: 'Mon compte', icon: UserCheck },
  { id: 'pro', label: 'Franchisé / Admin', icon: LayoutGrid },
];

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('page');
      if (param === 'account') return 'account';
    }
    return 'home';
  });
  const [tags, setTags] = useState<StickerTag[]>(() => loadTags());
  const [featuredTexts, setFeaturedTexts] = useState<[string, string, string]>(
    () => loadFeaturedTexts()
  );
  const [conversations, setConversations] = useState<ConversationThread[]>(() =>
    loadConversations()
  );
  const [goldPhoneSub, setGoldPhoneSub] = useState<GoldPhoneSubscription>(() =>
    loadGoldPhoneSubscription()
  );
  const [notifications, setNotifications] = useState<SubscriberNotification[]>(
    () => loadNotifications()
  );

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const syncState = () => {
      setTags(loadTags());
      setNotifications(loadNotifications());
    };

    const unsubscribeSync = subscribeToRealtimeSync(syncState);

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ANTIPERTE_NAVIGATE_ACCOUNT') {
        syncState();
        setActivePage('account');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (event.data?.type === 'ANTIPERTE_TAG_RECOVERED_SYNC') {
        syncState();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      unsubscribeSync();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  const handleActivateGoldPhone = () => {
    const next = activateGoldPhoneSubscription();
    setGoldPhoneSub(next);
  };

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-950">
      {/* Top Bar : Logo officiel en haut de toutes les pages + action rapide */}
      <header className="sticky top-0 z-40 h-12 md:h-15 bg-white text-neutral-950 border-b border-neutral-200">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Zone 1 : Logo officiel non déformé */}
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="flex items-center shrink-0 cursor-pointer py-1"
            aria-label="ANTIPERTE Accueil"
          >
            <img
              src={OFFICIAL_LOGO_SRC}
              alt="ANTIPERTE"
              className="h-9 md:h-11 w-auto object-contain shrink-0"
            />
          </button>

          {/* Zone 2 : Contacts rapides desktop */}
          <div className="hidden lg:flex items-center gap-5 text-xs font-bold text-neutral-800">
            <a
              href={OFFICIAL_TEL_HREF}
              className="hover:text-[#D32F2F] transition-colors font-mono-code whitespace-nowrap shrink-0"
            >
              Tél. : {OFFICIAL_TEL}
            </a>
            <a
              href={OFFICIAL_BIP_HREF}
              className="hover:text-[#D32F2F] transition-colors font-mono-code whitespace-nowrap shrink-0"
            >
              Bip : {OFFICIAL_BIP}
            </a>
            <a
              href={`mailto:${OFFICIAL_EMAIL}`}
              className="hover:text-[#D32F2F] transition-colors whitespace-nowrap shrink-0"
            >
              {OFFICIAL_EMAIL}
            </a>
          </div>

          {/* Zone 3 : Bouton J'ai trouvé / Installation PWA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleNavigate('found')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#D32F2F] px-3 py-1.5 text-xs font-extrabold text-white transition-colors hover:bg-[#B71C1C] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">J&apos;AI TROUVÉ UN OBJET PERDU</span>
              <span className="sm:hidden">J&apos;ai trouvé</span>
            </button>
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Bandeau contacts officiels en haut de chaque page (mobile + desktop) */}
      <div className="bg-neutral-50 border-b border-neutral-200 text-neutral-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 flex flex-wrap items-center justify-center sm:justify-between gap-x-4 gap-y-1 text-[11px] sm:text-xs font-semibold">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <a
              href={OFFICIAL_TEL_HREF}
              className="inline-flex items-center gap-1 hover:text-[#D32F2F] font-mono-code font-bold"
            >
              <Phone className="h-3.5 w-3.5 text-[#D32F2F] shrink-0" />
              <span>Tél. : {OFFICIAL_TEL}</span>
            </a>
            <span aria-hidden="true" className="text-neutral-400">
              ·
            </span>
            <a
              href={OFFICIAL_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#D32F2F] font-mono-code font-bold"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#D32F2F] shrink-0" />
              <span>WhatsApp : {OFFICIAL_WHATSAPP_DISPLAY}</span>
            </a>
            <span aria-hidden="true" className="text-neutral-400">
              ·
            </span>
            <a
              href={`mailto:${OFFICIAL_EMAIL}`}
              className="inline-flex items-center gap-1 hover:text-[#D32F2F]"
            >
              <Mail className="h-3.5 w-3.5 text-[#D32F2F] shrink-0" />
              <span>{OFFICIAL_EMAIL}</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <a
              href={OFFICIAL_BIP_HREF}
              className="font-mono-code font-bold text-[#D32F2F] hover:underline"
            >
              Bip : {OFFICIAL_BIP}
            </a>
            <span aria-hidden="true" className="text-neutral-400">
              ·
            </span>
            <a
              href={OFFICIAL_PWA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#D32F2F] font-mono-code font-bold"
            >
              <Globe className="h-3.5 w-3.5 text-[#D32F2F] shrink-0" />
              <span>{OFFICIAL_PWA_SITE}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-5 sm:py-8">
        {activePage === 'home' && (
          <HomePage onNavigate={handleNavigate} featuredTexts={featuredTexts} />
        )}
        {activePage === 'shop' && (
          <ShopPage
            onNavigate={handleNavigate}
            isGoldPhoneActive={goldPhoneSub.active}
            onActivateGoldPhone={handleActivateGoldPhone}
          />
        )}
        {activePage === 'found' && (
          <FoundPage tags={tags} onUpdateTags={setTags} />
        )}
        {activePage === 'messages' && (
          <MessagesPage
            tags={tags}
            conversations={conversations}
            onUpdateConversations={setConversations}
          />
        )}
        {activePage === 'account' && (
          <SubscriberPage
            tags={tags}
            onUpdateTags={(nextTags) => {
              setTags(nextTags);
              setGoldPhoneSub(loadGoldPhoneSubscription());
            }}
            isGoldPhoneActive={goldPhoneSub.active}
            onActivateGoldPhone={handleActivateGoldPhone}
            notifications={notifications}
            onUpdateNotifications={setNotifications}
          />
        )}
        {activePage === 'pro' && (
          <ProPortalPage
            tags={tags}
            onUpdateTags={setTags}
            featuredTexts={featuredTexts}
            onUpdateFeaturedTexts={setFeaturedTexts}
            notifications={notifications}
            onUpdateNotifications={setNotifications}
          />
        )}
        {activePage === 'install' && (
          <InstallPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Contacts officiels + Copyright obligatoire en bas de toutes les pages */}
      <footer className="border-t border-neutral-200 bg-neutral-50 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 space-y-3 text-xs sm:text-sm text-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 font-semibold">
              <a
                href={OFFICIAL_TEL_HREF}
                className="inline-flex items-center gap-1.5 hover:text-[#D32F2F] font-mono-code"
              >
                <Phone className="h-4 w-4 text-[#D32F2F] shrink-0" />
                <span>Tél. : {OFFICIAL_TEL}</span>
              </a>
              <span aria-hidden="true" className="text-neutral-400">
                ·
              </span>
              <a
                href={`mailto:${OFFICIAL_EMAIL}`}
                className="inline-flex items-center gap-1.5 hover:text-[#D32F2F]"
              >
                <Mail className="h-4 w-4 text-[#D32F2F] shrink-0" />
                <span>{OFFICIAL_EMAIL}</span>
              </a>
              <span aria-hidden="true" className="text-neutral-400">
                ·
              </span>
              <a
                href={OFFICIAL_BIP_HREF}
                className="font-mono-code font-bold text-[#D32F2F] hover:underline"
              >
                Bip : {OFFICIAL_BIP}
              </a>
              <span aria-hidden="true" className="text-neutral-400">
                ·
              </span>
              <a
                href={OFFICIAL_PWA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-code font-bold hover:text-[#D32F2F]"
              >
                {OFFICIAL_PWA_SITE}
              </a>
            </div>

            <a
              href={OFFICIAL_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#D32F2F] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#B71C1C] whitespace-nowrap shrink-0"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>WhatsApp : {OFFICIAL_WHATSAPP_DISPLAY}</span>
            </a>
          </div>

          <div className="pt-3 border-t border-neutral-200 text-center text-xs font-semibold text-neutral-600">
            {OFFICIAL_COPYRIGHT}
          </div>
        </div>
      </footer>

      {/* Barre de navigation en bas, toujours visible, avec 6 onglets */}
      <nav
        aria-label="Navigation principale"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      >
        <div className="mx-auto max-w-5xl grid grid-cols-6 h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const isFoundTab = item.id === 'found';
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[44px] px-0.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#D32F2F] bg-red-50/50'
                    : isFoundTab
                      ? 'text-[#D32F2F]/85 hover:text-[#D32F2F]'
                      : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-2 right-2 h-0.5 rounded-full bg-[#D32F2F]"
                  />
                )}
                {item.id === 'account' && unreadNotificationCount > 0 && (
                  <span
                    aria-label={`${unreadNotificationCount} notification non lue`}
                    className="absolute top-0.5 right-2 sm:right-4 min-w-[16px] h-4 px-1 rounded-full bg-[#D32F2F] text-[10px] font-extrabold text-white flex items-center justify-center tabular-nums"
                  >
                    {unreadNotificationCount}
                  </span>
                )}
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {item.id === 'pro' ? (
                  <span className="text-[8.5px] sm:text-[11px] font-bold tracking-tighter sm:tracking-tight whitespace-nowrap">
                    <span className="sm:hidden">Franchisé/Admin</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <OfflineIndicator />
    </div>
  );
}
