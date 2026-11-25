import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#D32F2F] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#B71C1C] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>Installer</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-neutral-200 px-3.5 py-2 text-xs font-bold text-neutral-950 transition-colors hover:bg-neutral-300 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-4 w-4 shrink-0 text-[#D32F2F]" />
          <span>Installer</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-neutral-950 shadow-2xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 id="ios-install-title" className="text-lg font-bold">
                  Installer ANTIPERTE
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-neutral-700 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D32F2F] text-xs font-bold text-white">
                    1
                  </span>
                  <span>
                    Appuyez sur le bouton{' '}
                    <strong className="inline-flex items-center gap-1 text-neutral-950">
                      Partager <Share className="h-3.5 w-3.5" />
                    </strong>{' '}
                    en bas de Safari.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D32F2F] text-xs font-bold text-white">
                    2
                  </span>
                  <span>
                    Faites défiler et appuyez sur{' '}
                    <strong className="text-neutral-950">
                      Sur l&apos;écran d&apos;accueil
                    </strong>
                    .
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[48px] rounded-2xl bg-[#D32F2F] text-sm font-bold text-white transition-colors hover:bg-[#B71C1C] cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
