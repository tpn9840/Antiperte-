import React from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Share,
  Smartphone,
} from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { OFFICIAL_PWA_SITE, OFFICIAL_PWA_URL } from '../lib/constants';
import type { PageId } from '../types/antiperte';

interface InstallPageProps {
  onNavigate: (page: PageId) => void;
}

export const InstallPage: React.FC<InstallPageProps> = ({ onNavigate }) => {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => onNavigate('home')}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-neutral-200 px-4 py-2 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-300 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span>Retour à l&apos;accueil</span>
      </button>

      <section className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D32F2F] text-white">
            <Smartphone className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-950">
              Installer ANTIPERTE sur votre téléphone
            </h1>
            <p className="text-sm text-neutral-600">
              Accès rapide hors ligne sur Android et iPhone.
            </p>
          </div>
        </div>

        {/* Lien officiel PWA */}
        <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-neutral-600">
              Lien officiel de l&apos;application PWA
            </p>
            <a
              href={OFFICIAL_PWA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1.5 text-lg font-extrabold font-mono-code text-[#D32F2F] hover:underline"
            >
              <span>{OFFICIAL_PWA_SITE}</span>
              <ExternalLink className="h-4 w-4 shrink-0" />
            </a>
          </div>
          <PWAInstallButton />
        </div>

        {/* Instructions Android & iPhone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-neutral-200 p-5 space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950">
              Android (Chrome)
            </h2>
            <p className="text-base font-bold text-neutral-900">
              Menu &gt; Ajouter à l&apos;écran d&apos;accueil
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Ouvrez <strong>{OFFICIAL_PWA_SITE}</strong> dans Chrome, touchez
              le menu (3 points en haut à droite), puis sélectionnez{' '}
              <strong>Ajouter à l&apos;écran d&apos;accueil</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-neutral-200 p-5 space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 flex items-center gap-2">
              <span>iPhone (Safari)</span>
              <Share className="h-4 w-4 text-[#D32F2F] shrink-0" />
            </h2>
            <p className="text-base font-bold text-neutral-900">
              Partager &gt; Ajouter à l&apos;écran d&apos;accueil
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Ouvrez <strong>{OFFICIAL_PWA_SITE}</strong> dans Safari, touchez
              le bouton <strong>Partager</strong> en bas de l&apos;écran, puis
              appuyez sur <strong>Sur l&apos;écran d&apos;accueil</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
