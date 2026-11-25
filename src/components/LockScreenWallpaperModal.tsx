import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Lock, Smartphone, X } from 'lucide-react';
import { OFFICIAL_BIP, OFFICIAL_WHATSAPP_DISPLAY } from '../lib/constants';

interface LockScreenWallpaperModalProps {
  isOpen: boolean;
  isSubscribed: boolean;
  onClose: () => void;
  initialEmergencyName?: string;
  initialEmergencyPhone?: string;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export const LockScreenWallpaperModal: React.FC<
  LockScreenWallpaperModalProps
> = ({
  isOpen,
  isSubscribed,
  onClose,
  initialEmergencyName = '',
  initialEmergencyPhone = '',
}) => {
  const [emergencyName, setEmergencyName] = useState(initialEmergencyName);
  const [emergencyPhone, setEmergencyPhone] = useState(initialEmergencyPhone);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmergencyName(initialEmergencyName || 'Contact d’urgence');
      setEmergencyPhone(initialEmergencyPhone || '6XX XX XX XX');
      setDownloaded(false);
    }
  }, [isOpen, initialEmergencyName, initialEmergencyPhone]);

  useEffect(() => {
    if (!isOpen || !isSubscribed) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Fond blanc propre
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Zone haute libre pour l'horloge du téléphone (y: 0 -> 320)
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 1080, 320);

    // Liseré Or en haut (Pack Téléphone Or)
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(0, 0, 1080, 12);

    ctx.fillStyle = '#E5C158';
    ctx.textAlign = 'center';
    ctx.font = '700 28px system-ui, -apple-system, sans-serif';
    ctx.fillText('ANTIPERTE · PACK TÉLÉPHONE OR', 540, 285);

    // 3. Titre : TÉLÉPHONE PERDU / LOST PHONE (bande rouge)
    ctx.fillStyle = '#D32F2F';
    ctx.fillRect(0, 320, 1080, 130);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 50px system-ui, -apple-system, sans-serif';
    ctx.fillText('TÉLÉPHONE PERDU / LOST PHONE', 540, 404);

    // 4. Récompense affichée en gros : RÉCOMPENSE 5000 F / REWARD 5000 F
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(0, 450, 1080, 190);
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(0, 450, 1080, 5);
    ctx.fillRect(0, 635, 1080, 5);

    ctx.fillStyle = '#111111';
    ctx.font = '800 56px system-ui, -apple-system, sans-serif';
    ctx.fillText('RÉCOMPENSE 5000 F', 540, 528);
    ctx.fillStyle = '#92400E';
    ctx.font = '800 46px system-ui, -apple-system, sans-serif';
    ctx.fillText('/ REWARD 5000 F', 540, 600);

    // 5. Textes FR & EN d'accroche
    ctx.fillStyle = '#111111';
    ctx.font = '700 34px system-ui, -apple-system, sans-serif';
    const frIntroLines = wrapLines(
      ctx,
      'Si vous trouvez ce téléphone, vous serez récompensé.',
      940
    );
    frIntroLines.forEach((line, idx) => {
      ctx.fillText(line, 540, 712 + idx * 44);
    });

    ctx.fillStyle = '#404040';
    ctx.font = '600 30px system-ui, -apple-system, sans-serif';
    const enIntroLines = wrapLines(
      ctx,
      'If you find this phone, you will be rewarded.',
      940
    );
    enIntroLines.forEach((line, idx) => {
      ctx.fillText(line, 540, 822 + idx * 40);
    });

    // 6. CONTACT 1 : Contact d'urgence de l'abonné (Nom + Téléphone uniquement)
    drawRoundedRectPath(ctx, 70, 900, 940, 290, 28);
    ctx.fillStyle = '#FAFAFA';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#D4D4D8';
    ctx.stroke();

    ctx.fillStyle = '#D32F2F';
    ctx.font = '800 28px system-ui, -apple-system, sans-serif';
    ctx.fillText("CONTACT 1 : CONTACT D'URGENCE", 540, 958);

    const safeEmergencyName = emergencyName.trim() || 'Contact d’urgence';
    const safeEmergencyPhone = emergencyPhone.trim() || 'Non renseigné';

    ctx.fillStyle = '#111111';
    ctx.font = '800 46px system-ui, -apple-system, sans-serif';
    const emNameLines = wrapLines(ctx, safeEmergencyName, 840);
    emNameLines.slice(0, 2).forEach((line, idx) => {
      ctx.fillText(line, 540, 1028 + idx * 54);
    });

    ctx.fillStyle = '#111111';
    ctx.font = '800 54px monospace';
    ctx.fillText(safeEmergencyPhone, 540, 1148);

    // 7. CONTACT 2 : Antiperte - +237 690 88 88 83 - Bip #146*690888883# (TOUJOURS affiché automatiquement)
    drawRoundedRectPath(ctx, 70, 1220, 940, 310, 28);
    ctx.fillStyle = '#111111';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#D4AF37';
    ctx.stroke();

    ctx.fillStyle = '#E5C158';
    ctx.font = '800 28px system-ui, -apple-system, sans-serif';
    ctx.fillText('CONTACT 2 : ANTIPERTE', 540, 1280);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 46px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Antiperte - ${OFFICIAL_WHATSAPP_DISPLAY}`, 540, 1365);

    ctx.fillStyle = '#FDE68A';
    ctx.font = '800 46px monospace';
    ctx.fillText(`Bip ${OFFICIAL_BIP}`, 540, 1452);

    // 8. Textes FR & EN en bas
    ctx.fillStyle = '#111111';
    ctx.font = '700 29px system-ui, -apple-system, sans-serif';
    const frFooterLines = wrapLines(
      ctx,
      "Le trouveur peut contacter l'un ou l'autre. Ne donnez ce téléphone qu'à son propriétaire ou à Antiperte.",
      940
    );
    frFooterLines.forEach((line, idx) => {
      ctx.fillText(line, 540, 1595 + idx * 38);
    });

    ctx.fillStyle = '#525252';
    ctx.font = '600 27px system-ui, -apple-system, sans-serif';
    const enFooterLines = wrapLines(
      ctx,
      'The finder can contact either one. Give this phone only to its owner or to Antiperte.',
      940
    );
    enFooterLines.forEach((line, idx) => {
      ctx.fillText(line, 540, 1735 + idx * 35);
    });

    // Pied discret officiel
    ctx.fillStyle = '#737373';
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('www.antiperte.com · info@antiperte.com', 540, 1878);

    setPreviewUrl(canvas.toDataURL('image/png'));
  }, [isOpen, isSubscribed, emergencyName, emergencyPhone]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewUrl || !isSubscribed) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = 'ecran-verrouillage-telephone-or-antiperte.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lockscreen-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 text-neutral-950 shadow-2xl border border-neutral-200 max-h-[92vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-amber-400">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <h2 id="lockscreen-title" className="text-lg font-extrabold">
                Écran verrouillé — Pack Téléphone Or
              </h2>
              <p className="text-xs font-semibold text-neutral-500">
                Bilingue FR / EN · Confidentialité renforcée
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isSubscribed ? (
          <div className="rounded-2xl bg-neutral-100 border border-neutral-200 p-6 text-center space-y-3">
            <Lock className="mx-auto h-9 w-9 text-[#D32F2F]" />
            <p className="text-base font-extrabold text-neutral-950">
              Abonnement Pack Téléphone Or requis
            </p>
            <p className="text-sm text-neutral-700">
              Cet écran de verrouillage n&apos;est actif que si l&apos;abonnement
              spécifique Téléphone Or est acheté.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-bold text-white cursor-pointer"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            {/* Uniquement Contact 1 (Contact d'urgence) modifiable — jamais nom propriétaire, IMEI ou modèle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="ls-em-name"
                  className="block text-xs font-bold text-neutral-700 mb-1"
                >
                  Contact 1 : Nom d&apos;urgence
                </label>
                <input
                  id="ls-em-name"
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Ex : Marie Kamga"
                  className="w-full min-h-[44px] rounded-xl border border-neutral-300 px-3 text-sm font-semibold text-neutral-950 focus:border-[#D32F2F] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="ls-em-phone"
                  className="block text-xs font-bold text-neutral-700 mb-1"
                >
                  Contact 1 : Téléphone d&apos;urgence
                </label>
                <input
                  id="ls-em-phone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Ex : 699 45 78 90"
                  className="w-full min-h-[44px] rounded-xl border border-neutral-300 px-3 text-sm font-mono-code font-semibold text-neutral-950 focus:border-[#D32F2F] focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3 text-xs text-neutral-700 space-y-1">
              <p className="font-bold text-neutral-950">
                Contact 2 ajouté automatiquement :
              </p>
              <p className="font-mono-code font-semibold text-[#D32F2F]">
                Antiperte - {OFFICIAL_WHATSAPP_DISPLAY} - Bip {OFFICIAL_BIP}
              </p>
              <p className="text-neutral-600">
                Aucun nom du propriétaire, IMEI ni modèle de téléphone
                n&apos;est affiché sur l&apos;image.
              </p>
            </div>

            {/* Aperçu du fond d'écran généré */}
            {previewUrl && (
              <div className="flex justify-center rounded-2xl bg-neutral-100 p-3 border border-neutral-200">
                <img
                  src={previewUrl}
                  alt="Aperçu de l'écran de verrouillage Pack Téléphone Or ANTIPERTE"
                  className="h-80 sm:h-96 w-auto rounded-2xl border border-neutral-300 shadow-md object-contain"
                />
              </div>
            )}

            <p className="text-center text-sm font-bold text-neutral-800">
              Mettez cette image en fond d&apos;écran verrouillé.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-5 py-3 text-base font-extrabold text-white transition-colors hover:bg-[#B71C1C] cursor-pointer"
              >
                {downloaded ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>Image téléchargée !</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 shrink-0" />
                    <span>Télécharger l&apos;image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[52px] items-center justify-center rounded-2xl bg-neutral-200 px-5 py-3 text-base font-bold text-neutral-950 transition-colors hover:bg-neutral-300 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
