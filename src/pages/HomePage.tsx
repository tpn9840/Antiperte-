import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Tag,
} from 'lucide-react';
import {
  FEATURED_IMAGES,
  OFFICIAL_BIP,
  OFFICIAL_LOGO_SRC,
  OFFICIAL_TEL,
} from '../lib/constants';
import type { PageId } from '../types/antiperte';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  featuredTexts: [string, string, string];
}

const TESTIMONIALS = [
  {
    quote:
      "J'avais perdu ma CNI à Bamenda, on m'a appelé 2 heures après. Merci Antiperte.",
    author: 'Paul N., Bamenda',
  },
  {
    quote:
      "Mon sac perdu au marché de Bafoussam, retrouvé grâce à l'étiquette.",
    author: 'Aïcha B., Bafoussam',
  },
  {
    quote:
      "Mon téléphone perdu, le trouveur a appelé Antiperte, j'ai récupéré le même jour.",
    author: 'Emmanuel T., Douala',
  },
  {
    quote: 'Je colle Antiperte sur tous mes documents, je dors tranquille.',
    author: 'Marthe K., Yaoundé',
  },
];

const FAQ_ITEMS = [
  {
    question: "Comment fonctionne l'étiquette ANTIPERTE ?",
    answer:
      "Vous collez l'étiquette sur votre objet (CNI, permis, téléphone, clés, bagage ou passeport) et vous l'activez dans Mon compte. Si quelqu'un retrouve votre objet, il appelle le 690888883, fait un Bip #146*690888883# ou le signale sur l'application, et notre équipe vous contacte aussitôt.",
  },
  {
    question:
      'Mes données personnelles sont-elles visibles par le trouveur ?',
    answer:
      "Non, jamais. Aucune information personnelle (nom, téléphone, contact d'urgence) n'apparaît sur l'étiquette ni sur la page de signalement. Seul le centre Antiperte (690888883 / +237 690 88 88 83) accède à votre fiche pour vous prévenir en toute confidentialité.",
  },
  {
    question: 'À quoi sert le code PIN à gratter de 7 chiffres ?',
    answer:
      "Le code PIN aléatoire de 7 chiffres sécurise votre étiquette lors de l'activation et du signalement. Il n'est jamais affiché en clair dans l'application afin d'empêcher toute usurpation ou modification non autorisée.",
  },
  {
    question: "Que comprend le Kit 1 000 F et quelle est sa durée ?",
    answer:
      "Le Kit unique à 1 000 F comprend 1 étiquette résistante avec un numéro de série unique (AP-XXXXXX) ainsi qu'un abonnement complet de protection valable pendant 1 an.",
  },
  {
    question:
      'Comment récupérer mon objet et comment fonctionne la récompense ?',
    answer:
      "Dès qu'un objet est signalé, Antiperte vous appelle (ou appelle votre contact d'urgence si vous êtes injoignable) pour organiser la restitution en toute sécurité. La récompense choisie (1 000 F, 2 000 F ou 5 000 F) motive le trouveur à vous restituer votre bien.",
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  featuredTexts,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isCarouselPaused) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 3);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isCarouselPaused]);

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev + 2) % 3);
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % 3);
  };

  return (
    <div className="space-y-8">
      {/* 1. En haut : Logo officiel + Zone À LA UNE juste sous le logo + Gros boutons */}
      <section className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-4 sm:p-8 space-y-6">
        <div className="mx-auto max-w-md py-1">
          <img
            src={OFFICIAL_LOGO_SRC}
            alt="Logo officiel ANTIPERTE — Tél. 690888883 — info@antiperte.com"
            className="w-full h-auto object-contain mx-auto"
          />
        </div>

        {/* Zone À LA UNE (Carrousel 3 images auto-défilantes) */}
        <div aria-labelledby="featured-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="featured-title"
              className="text-sm sm:text-base font-extrabold tracking-wide text-[#D32F2F]"
            >
              À LA UNE
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Diapositive précédente"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-200 text-neutral-950 hover:bg-neutral-300 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Diapositive suivante"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-200 text-neutral-950 hover:bg-neutral-300 cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            onFocus={() => setIsCarouselPaused(true)}
            onBlur={() => setIsCarouselPaused(false)}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 aspect-[16/9] max-h-[340px] w-full"
          >
            {!failedImages[slideIndex] ? (
              <img
                src={FEATURED_IMAGES[slideIndex]}
                alt={featuredTexts[slideIndex]}
                referrerPolicy="no-referrer"
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [slideIndex]: true }))
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-950 p-6 text-center text-white">
                <p className="text-lg font-extrabold">
                  {featuredTexts[slideIndex]}
                </p>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <p className="text-base sm:text-xl font-extrabold text-white leading-snug max-w-2xl">
                {featuredTexts[slideIndex]}
              </p>

              <div className="flex items-center gap-2 shrink-0">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Voir diapositive ${idx + 1}`}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      slideIndex === idx
                        ? 'w-7 bg-[#D32F2F]'
                        : 'w-2.5 bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2 gros boutons : Rouge (J'ai trouvé) et Noir (J'achète mon kit) */}
        <div className="mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => onNavigate('found')}
            className="flex min-h-[62px] w-full items-center justify-center gap-3 rounded-2xl bg-[#D32F2F] px-5 py-4 text-base sm:text-lg font-extrabold text-white shadow-sm transition-all hover:bg-[#B71C1C] active:scale-[0.98] cursor-pointer"
          >
            <AlertCircle className="h-6 w-6 shrink-0" />
            <span>J&apos;AI TROUVÉ UN OBJET PERDU</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="flex min-h-[62px] w-full items-center justify-center gap-3 rounded-2xl bg-neutral-950 px-5 py-4 text-base sm:text-lg font-extrabold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="h-6 w-6 shrink-0" />
            <span>J&apos;ACHÈTE MON KIT 1000 F</span>
          </button>
        </div>

        {/* Gros bouton Installer Antiperte sur votre téléphone */}
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => onNavigate('install')}
            className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-neutral-200 px-5 py-3.5 text-sm sm:text-base font-extrabold text-neutral-950 transition-colors hover:bg-neutral-300 active:scale-[0.99] cursor-pointer"
          >
            <Smartphone className="h-5 w-5 shrink-0 text-[#D32F2F]" />
            <span>INSTALLER ANTIPERTE SUR VOTRE TÉLÉPHONE</span>
          </button>
        </div>
      </section>

      {/* 2. Explication du concept */}
      <section aria-labelledby="concept-title" className="space-y-5">
        <div className="rounded-3xl bg-neutral-50 border border-neutral-200 p-6 sm:p-8 text-center space-y-2">
          <h1
            id="concept-title"
            className="text-xl sm:text-2xl font-extrabold text-neutral-950"
          >
            Comment fonctionne ANTIPERTE ?
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-neutral-800 leading-relaxed">
            Tu colles une étiquette sur ton objet. Si quelqu&apos;un le trouve,
            il appelle Antiperte, on t&apos;appelle, tu récupères ton objet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-5 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D32F2F] text-white">
                <Tag className="h-5 w-5" />
              </span>
              <h2 className="text-base font-bold text-neutral-950">
                1. Tu colles l&apos;étiquette
              </h2>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Sur ta CNI, permis, téléphone, bagage, clés ou passeport.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="text-base font-bold text-neutral-950">
                2. Tu actives ton kit
              </h2>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Avec ton numéro de série, ton PIN à gratter (7 chiffres) et la
              récompense choisie.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-neutral-950">
                <PhoneCall className="h-5 w-5 text-[#D32F2F]" />
              </span>
              <h2 className="text-base font-bold text-neutral-950">
                3. Tu récupères ton objet
              </h2>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Celui qui trouve appelle le{' '}
              <strong className="font-mono-code">{OFFICIAL_TEL}</strong> ou fait
              un Bip <strong className="font-mono-code">{OFFICIAL_BIP}</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Témoignages : Ils ont retrouvé leurs objets */}
      <section aria-labelledby="testimonials-title" className="space-y-4">
        <div>
          <h2
            id="testimonials-title"
            className="text-xl sm:text-2xl font-extrabold text-neutral-950"
          >
            Ils ont retrouvé leurs objets
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Retours d&apos;abonnés au Cameroun.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.author}
              className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-sm flex flex-col justify-between gap-3"
            >
              <div className="space-y-2.5">
                <div
                  className="flex items-center gap-1 text-amber-500"
                  aria-label="5 étoiles sur 5"
                >
                  {[0, 1, 2, 3, 4].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className="h-4 w-4 fill-amber-400 text-amber-500"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-neutral-900 leading-relaxed font-medium">
                  &laquo; {item.quote} &raquo;
                </p>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-[#D32F2F]">
                — {item.author}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Foire Aux Questions (FAQ) */}
      <section aria-labelledby="faq-title" className="space-y-4">
        <div>
          <h2
            id="faq-title"
            className="text-xl sm:text-2xl font-extrabold text-neutral-950"
          >
            Questions fréquentes (FAQ)
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Tout savoir sur l&apos;utilisation de l&apos;étiquette et la
            protection de vos données.
          </p>
        </div>

        <div className="divide-y divide-neutral-200 rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="flex w-full min-h-[56px] items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-neutral-950">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#D32F2F] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm sm:text-base text-neutral-700 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
