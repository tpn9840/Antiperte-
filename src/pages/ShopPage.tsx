import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {
  OFFICIAL_BIP,
  OFFICIAL_BIP_HREF,
  OFFICIAL_TEL,
  OFFICIAL_TEL_HREF,
} from '../lib/constants';
import type { PageId } from '../types/antiperte';

import imgKitDemarrage from '../assets/images/product_kit_demarrage_1795607811351.jpg';
import imgFeuille5Etiquettes from '../assets/images/product_feuille_5_etiquettes_1795607810049.jpg';
import imgBagagePlastique from '../assets/images/product_bagage_noir_jaune_1795607809911.jpg';
import imgBagageAluminium from '../assets/images/product_bagage_aluminium_1795606741817.jpg';
import imgPochetteCni from '../assets/images/product_pochette_cni_1795606742431.jpg';
import imgCarteUrgence from '../assets/images/product_carte_urgence_1795606742868.jpg';
import imgEtiquettesQr from '../assets/images/product_etiquettes_qr_1795606744583.jpg';
import imgTamponAdresse from '../assets/images/product_tampon_noir_1795607811402.jpg';
import imgPorteCle from '../assets/images/product_porte_cle_jaune_1795607811899.jpg';
import imgPackTelephoneOr from '../assets/images/product_pack_telephone_or_1795607812066.jpg';
import imgEtiquetteOrSeule from '../assets/images/product_etiquette_or_seule_1795607812482.jpg';

type ShopCategory = 'Tous' | 'Bagages' | 'Documents' | 'Accessoires';

interface ShopProduct {
  id: string;
  name: string;
  priceLabel: string;
  description?: string;
  promo?: string;
  promoLabel?: string;
  warning?: string;
  isGoldPhonePack?: boolean;
  category: Exclude<ShopCategory, 'Tous'>;
  image: string;
  imageAlt: string;
}

const SHOP_CATEGORIES: ShopCategory[] = [
  'Tous',
  'Bagages',
  'Documents',
  'Accessoires',
];

const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'kit-demarrage',
    name: 'Kit de démarrage Antiperte',
    priceLabel: '1000 F',
    description: 'Abonnement 1 an + 1 étiquette.',
    category: 'Documents',
    image: imgKitDemarrage,
    imageAlt:
      "Pochette Kit de démarrage Antiperte avec 1 étiquette et carte d'abonnement 1 an",
  },
  {
    id: 'etiquette-simple',
    name: 'Étiquette individuelle simple',
    priceLabel: '500 F',
    promo: 'Promo : 5 pièces à 2000 F',
    category: 'Documents',
    image: imgFeuille5Etiquettes,
    imageAlt:
      'Feuille de 5 étiquettes blanches avec série AP-000123, PIN à gratter et QR code',
  },
  {
    id: 'bagage-plastique',
    name: 'Étiquettes bagages plastique',
    priceLabel: '1000 F',
    category: 'Bagages',
    image: imgBagagePlastique,
    imageAlt:
      'Étiquette bagage plastique noire et jaune accrochée à une valise',
  },
  {
    id: 'bagage-aluminium',
    name: 'Étiquettes bagages aluminium',
    priceLabel: '1500 F',
    category: 'Bagages',
    image: imgBagageAluminium,
    imageAlt:
      'Étiquette métal argenté brossé gravée ANTIPERTE, finition premium',
  },
  {
    id: 'pochette-cni',
    name: 'Pochette CNI',
    priceLabel: '500 F',
    category: 'Documents',
    image: imgPochetteCni,
    imageAlt:
      'Pochette transparente avec CNI dedans et étiquette Antiperte collée',
  },
  {
    id: 'carte-urgence',
    name: "Cartes en cas d'urgence",
    priceLabel: '1000 F',
    category: 'Documents',
    image: imgCarteUrgence,
    imageAlt:
      "Carte plastifiée format carte bancaire avec croix rouge et contact d'urgence",
  },
  {
    id: 'etiquettes-qr',
    name: 'Étiquettes Adresse QR Code, 5 pcs',
    priceLabel: '1500 F',
    category: 'Bagages',
    image: imgEtiquettesQr,
    imageAlt: '5 étiquettes blanches avec grand QR code au centre',
  },
  {
    id: 'tampon-adresse',
    name: 'Tampon adresse',
    priceLabel: '5000 F',
    category: 'Accessoires',
    image: imgTamponAdresse,
    imageAlt:
      'Tampon encreur noir avec texte Si trouvé, appeler Antiperte 690888883',
  },
  {
    id: 'porte-cle',
    name: 'Porte-clé',
    priceLabel: '500 F',
    category: 'Accessoires',
    image: imgPorteCle,
    imageAlt: 'Porte-clé rond jaune et noir avec loupe Antiperte et QR code',
  },
  {
    id: 'pack-telephone-or',
    name: 'Pack Téléphone Or',
    priceLabel: '2000 F',
    promoLabel: 'EN PROMO · PROMO LANCEMENT',
    description:
      'Étiquette Luxe couleur Or spéciale téléphone + Abonnement spécifique téléphone 1 an inclus + Écran de verrouillage personnalisé activé automatiquement + Récompense obligatoire 5000 F.',
    warning:
      'INTERDICTION : Ne collez jamais une étiquette simple sur un téléphone. Utilisez uniquement le Pack Or.',
    isGoldPhonePack: true,
    category: 'Accessoires',
    image: imgPackTelephoneOr,
    imageAlt: 'Étiquette dorée brillante sur un téléphone noir, finition premium',
  },
  {
    id: 'etiquette-or-seule',
    name: 'Étiquette Luxe couleur Or seule',
    priceLabel: '1000 F',
    description: 'Pour remplacement, ne fonctionne pas sans abonnement.',
    category: 'Accessoires',
    image: imgEtiquetteOrSeule,
    imageAlt: 'Étiquette Luxe couleur Or métallisée ANTIPERTE seule',
  },
];

function buildWhatsAppOrderUrl(product: ShopProduct): string {
  const promoSuffix = product.promo ? ` (${product.promo})` : '';
  const text = `Bonjour Antiperte, je veux commander : ${product.name} - ${product.priceLabel}${promoSuffix}`;
  return `https://wa.me/237690888883?text=${encodeURIComponent(text)}`;
}

interface ShopPageProps {
  onNavigate: (page: PageId) => void;
  isGoldPhoneActive?: boolean;
  onActivateGoldPhone?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onNavigate,
  isGoldPhoneActive = false,
  onActivateGoldPhone,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('Tous');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Tous') return SHOP_PRODUCTS;
    return SHOP_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Bannière livraison officielle */}
      <section className="rounded-2xl bg-neutral-950 text-white px-5 py-3.5 flex items-center justify-center gap-2.5 text-center shadow-sm">
        <Truck className="h-5 w-5 text-[#D32F2F] shrink-0" />
        <p className="text-sm sm:text-base font-extrabold tracking-tight">
          Livraison partout au Cameroun - Commande via WhatsApp
        </p>
      </section>

      {/* En-tête Boutique + Filtre en haut : Tous / Bagages / Documents / Accessoires */}
      <section className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
              Boutique ANTIPERTE
            </h1>
            <p className="mt-1 text-sm sm:text-base text-neutral-600">
              Commandez vos étiquettes et accessoires en un clic sur WhatsApp.
            </p>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 font-mono-code tabular-nums shrink-0">
            {filteredProducts.length}{' '}
            {filteredProducts.length > 1 ? 'produits' : 'produit'}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filtrer les produits par catégorie"
          className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200"
        >
          {SHOP_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[44px] flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'text-neutral-700 hover:bg-white hover:text-neutral-950'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grille 2 colonnes de produits */}
      <section aria-label="Catalogue des produits ANTIPERTE">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProducts.map((product) => {
            const hasFailed = Boolean(failedImages[product.id]);
            return (
              <article
                key={product.id}
                className={`flex flex-col rounded-3xl bg-white border shadow-sm overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 ${
                  product.isGoldPhonePack
                    ? 'border-amber-400 ring-1 ring-amber-300'
                    : 'border-neutral-200'
                }`}
              >
                {/* Image illustrative 4:3 */}
                <div className="aspect-[4/3] w-full bg-neutral-100 border-b border-neutral-200 overflow-hidden">
                  {!hasFailed ? (
                    <img
                      src={product.image}
                      alt={product.imageAlt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [product.id]: true,
                        }))
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-100 p-4 text-center text-neutral-600">
                      <Package className="h-8 w-8 text-[#D32F2F]" />
                      <span className="text-xs font-bold text-neutral-900">
                        {product.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenu produit */}
                <div className="flex flex-1 flex-col p-5 sm:p-6 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        {product.category}
                      </span>
                      {product.promoLabel && (
                        <span className="inline-block rounded-md bg-[#D32F2F] px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
                          {product.promoLabel}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 leading-snug">
                      {product.name}
                    </h2>
                  </div>

                  {/* Prix en gros rouge */}
                  <div className="space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold font-mono-code tabular-nums text-[#D32F2F] leading-none">
                      {product.priceLabel}
                    </p>
                    {product.promo && (
                      <p className="text-sm font-extrabold text-[#D32F2F]">
                        {product.promo}
                      </p>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {product.warning && (
                    <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs sm:text-sm font-extrabold text-[#D32F2F]">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{product.warning}</span>
                    </div>
                  )}

                  {/* Bouton WhatsApp vert sous chaque produit */}
                  <div className="mt-auto pt-2 space-y-2.5">
                    <a
                      href={buildWhatsAppOrderUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-[#15803D] px-4 py-3 text-sm sm:text-base font-extrabold text-white shadow-sm transition-colors hover:bg-[#166534] active:scale-[0.98]"
                    >
                      <MessageCircle className="h-5 w-5 shrink-0" />
                      <span className="whitespace-nowrap">
                        Commander sur WhatsApp
                      </span>
                    </a>

                    {product.isGoldPhonePack && (
                      isGoldPhoneActive ? (
                        <button
                          type="button"
                          onClick={() => onNavigate('account')}
                          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-amber-400 hover:bg-neutral-800 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>
                            Pack Or actif · Ouvrir l&apos;écran de verrouillage
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onActivateGoldPhone?.();
                            onNavigate('account');
                          }}
                          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-neutral-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 hover:bg-neutral-300 cursor-pointer"
                        >
                          <ShieldCheck className="h-4 w-4 text-[#D32F2F] shrink-0" />
                          <span>J&apos;ai acheté le Pack Or · Activer</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Raccourci activation & contacts directs */}
      <section className="rounded-3xl bg-neutral-50 border border-neutral-200 p-5 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate('account')}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-neutral-200 px-5 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-300 cursor-pointer"
        >
          <span>J&apos;ai déjà mon kit : Activer dans Mon compte</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#D32F2F]" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={OFFICIAL_TEL_HREF}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-neutral-950 hover:bg-neutral-100 font-mono-code tabular-nums whitespace-nowrap"
          >
            <Phone className="h-4 w-4 text-[#D32F2F] shrink-0" />
            <span>Appeler : {OFFICIAL_TEL}</span>
          </a>
          <a
            href={OFFICIAL_BIP_HREF}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-[#D32F2F] hover:bg-neutral-100 font-mono-code tabular-nums whitespace-nowrap"
          >
            <span>Bip : {OFFICIAL_BIP}</span>
          </a>
        </div>
      </section>
    </div>
  );
};
