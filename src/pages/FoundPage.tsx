import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import {
  OFFICIAL_BIP,
  OFFICIAL_BIP_HREF,
  OFFICIAL_TEL,
  OFFICIAL_TEL_HREF,
  OFFICIAL_WHATSAPP_DISPLAY,
} from '../lib/constants';
import { reportFoundTag } from '../services/storage';
import type { StickerTag } from '../types/antiperte';

interface FoundPageProps {
  tags: StickerTag[];
  onUpdateTags: (nextTags: StickerTag[]) => void;
}

export const FoundPage: React.FC<FoundPageProps> = ({ tags, onUpdateTags }) => {
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [finderName, setFinderName] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = reportFoundTag(tags, {
      serial,
      pin,
      finderName,
      finderPhone,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onUpdateTags(result.nextTags);
    setSubmitted(true);
    setSerial('');
    setPin('');
    setFinderName('');
    setFinderPhone('');
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <section className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D32F2F] text-white">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-950">
              J&apos;ai trouvé un objet perdu
            </h1>
            <p className="text-sm text-neutral-600">
              Signalez l&apos;étiquette pour que Antiperte prévienne le
              propriétaire.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-5 pt-2">
            <div
              role="status"
              className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 mt-0.5" />
                <p className="text-base sm:text-lg font-bold text-neutral-950 leading-relaxed">
                  Merci ! Antiperte va contacter le propriétaire au{' '}
                  <span className="font-mono-code text-[#D32F2F]">
                    {OFFICIAL_WHATSAPP_DISPLAY}
                  </span>{' '}
                  (Tél.{' '}
                  <span className="font-mono-code">{OFFICIAL_TEL}</span> / Bip{' '}
                  <span className="font-mono-code">{OFFICIAL_BIP}</span>). Ne
                  donnez l&apos;objet à personne d&apos;autre.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={OFFICIAL_TEL_HREF}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-5 py-3 text-base font-extrabold text-white transition-colors hover:bg-[#B71C1C]"
              >
                <Phone className="h-5 w-5 shrink-0" />
                <span>Appeler {OFFICIAL_TEL}</span>
              </a>
              <a
                href={OFFICIAL_BIP_HREF}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-base font-extrabold text-white transition-colors hover:bg-neutral-800"
              >
                <span className="font-mono-code">Bip {OFFICIAL_BIP}</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="w-full min-h-[48px] rounded-2xl bg-neutral-200 px-5 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-300 cursor-pointer"
            >
              Signaler un autre objet
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-[#D32F2F]"
              >
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="found-serial"
                    className="block text-sm font-bold text-neutral-950 mb-1.5"
                  >
                    Numéro de série
                  </label>
                  <input
                    id="found-serial"
                    type="text"
                    required
                    value={serial}
                    onChange={(e) => setSerial(e.target.value.toUpperCase())}
                    placeholder="Ex : AP-000001"
                    className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base font-mono-code font-bold text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor="found-pin"
                    className="block text-sm font-bold text-neutral-950 mb-1.5"
                  >
                    PIN à gratter (7 chiffres min.)
                  </label>
                  <input
                    id="found-pin"
                    type="text"
                    inputMode="numeric"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex : 1234567"
                    className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base font-mono-code font-bold tracking-wider text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="found-name"
                  className="block text-sm font-bold text-neutral-950 mb-1.5"
                >
                  Nom du trouveur
                </label>
                <input
                  id="found-name"
                  type="text"
                  required
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                />
              </div>

              <div>
                <label
                  htmlFor="found-phone"
                  className="block text-sm font-bold text-neutral-950 mb-1.5"
                >
                  Téléphone du trouveur
                </label>
                <input
                  id="found-phone"
                  type="tel"
                  required
                  value={finderPhone}
                  onChange={(e) => setFinderPhone(e.target.value)}
                  placeholder="6XX XX XX XX"
                  className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[56px] rounded-2xl bg-[#D32F2F] px-6 py-4 text-lg font-extrabold text-white shadow-sm transition-all hover:bg-[#B71C1C] active:scale-[0.98] cursor-pointer"
              >
                Signaler
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};
