import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  Search,
  Store,
} from 'lucide-react';
import {
  DEFAULT_FRANCHISE_CODE,
  FRANCHISE_COMMISSION_RATE,
  KIT_PRICE_FCFA,
  isTagSold,
  markTagSold,
} from '../services/storage';
import type { StickerTag } from '../types/antiperte';

interface FranchisePageProps {
  tags: StickerTag[];
  onUpdateTags: (nextTags: StickerTag[]) => void;
}

export const FranchisePage: React.FC<FranchisePageProps> = ({
  tags,
  onUpdateTags,
}) => {
  const [franchiseCode, setFranchiseCode] = useState(DEFAULT_FRANCHISE_CODE);
  const [serialInput, setSerialInput] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [listFilter, setListFilter] = useState<'TOUTES' | 'STOCK' | 'VENDUES'>(
    'TOUTES'
  );
  const [listPage, setListPage] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const normalizedFranchise =
    franchiseCode.trim().toUpperCase() || DEFAULT_FRANCHISE_CODE;

  const franchiseTags = useMemo(
    () =>
      tags.filter(
        (t) => t.franchiseCode.toUpperCase() === normalizedFranchise
      ),
    [tags, normalizedFranchise]
  );

  const stockCount = useMemo(
    () => franchiseTags.filter((t) => t.status === 'STOCK').length,
    [franchiseTags]
  );

  const salesCount = useMemo(
    () => franchiseTags.filter(isTagSold).length,
    [franchiseTags]
  );

  const commissionAmount = Math.round(
    salesCount * KIT_PRICE_FCFA * FRANCHISE_COMMISSION_RATE
  );

  const filteredFranchiseTags = useMemo(() => {
    const q = listSearch.trim().toUpperCase();
    return franchiseTags.filter((tag) => {
      if (listFilter === 'STOCK' && tag.status !== 'STOCK') return false;
      if (listFilter === 'VENDUES' && !isTagSold(tag)) return false;
      if (q && !tag.serial.includes(q)) return false;
      return true;
    });
  }, [franchiseTags, listFilter, listSearch]);

  const FRANCHISE_PAGE_SIZE = 25;
  const totalListPages = Math.max(
    1,
    Math.ceil(filteredFranchiseTags.length / FRANCHISE_PAGE_SIZE)
  );
  const safeListPage = Math.min(listPage, totalListPages);
  const paginatedFranchiseTags = useMemo(() => {
    const start = (safeListPage - 1) * FRANCHISE_PAGE_SIZE;
    return filteredFranchiseTags.slice(start, start + FRANCHISE_PAGE_SIZE);
  }, [filteredFranchiseTags, safeListPage]);

  const handleMarkSold = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const result = markTagSold(tags, serialInput, normalizedFranchise);
    if (!result.ok) {
      setFeedback({ type: 'error', message: result.error });
      return;
    }

    onUpdateTags(result.nextTags);
    setFeedback({
      type: 'success',
      message: `Étiquette ${result.tag.serial} marquée VENDUE (+${
        KIT_PRICE_FCFA * FRANCHISE_COMMISSION_RATE
      } F de commission).`,
    });
    setSerialInput('');
  };

  return (
    <div className="space-y-6">
      {/* En-tête Franchisé */}
      <section className="rounded-3xl bg-white p-5 sm:p-7 border border-neutral-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D32F2F] text-white">
              <Store className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-950">
                Zone Franchisé
              </h1>
              <p className="text-sm text-neutral-600">
                Code franchisé :{' '}
                <strong className="font-mono-code text-[#D32F2F]">
                  {normalizedFranchise}
                </strong>
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label
              htmlFor="franchise-code-input"
              className="block text-xs font-bold text-neutral-700 mb-1"
            >
              Code point de vente
            </label>
            <input
              id="franchise-code-input"
              type="text"
              value={franchiseCode}
              onChange={(e) => setFranchiseCode(e.target.value.toUpperCase())}
              className="w-full min-h-[44px] rounded-xl border border-neutral-300 bg-white px-3.5 text-sm font-mono-code font-bold text-neutral-950 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
            />
          </div>
        </div>
      </section>

      {/* Tableau récapitulatif : Stock, Ventes, Commission 30% */}
      <section
        aria-label="Tableau récapitulatif franchisé"
        className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-extrabold text-neutral-950">
            Bilan {normalizedFranchise}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600">
                <th className="py-3.5 px-5">Stock</th>
                <th className="py-3.5 px-5">Ventes</th>
                <th className="py-3.5 px-5">Commission 30% automatique</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-neutral-950">
                <td className="py-5 px-5 text-2xl sm:text-3xl font-extrabold font-mono-code">
                  {stockCount}
                </td>
                <td className="py-5 px-5 text-2xl sm:text-3xl font-extrabold font-mono-code">
                  {salesCount}
                </td>
                <td className="py-5 px-5 text-2xl sm:text-3xl font-extrabold font-mono-code text-[#D32F2F]">
                  {commissionAmount.toLocaleString('fr-FR')} F
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">
        {/* Formulaire Marquer VENDUE */}
        <section className="lg:col-span-5 rounded-3xl bg-white p-5 sm:p-7 border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-extrabold text-neutral-950">
            Enregistrer une vente
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Saisissez le numéro de série du kit remis au client.
          </p>

          {feedback && (
            <div
              role="alert"
              className={`mt-4 flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold ${
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

          <form onSubmit={handleMarkSold} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="franchise-serial"
                className="block text-sm font-bold text-neutral-950 mb-1.5"
              >
                Numéro de série
              </label>
              <input
                id="franchise-serial"
                type="text"
                required
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                placeholder="Ex : AP-000005"
                className="w-full min-h-[52px] rounded-xl border border-neutral-300 bg-white px-4 text-lg font-mono-code font-bold text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
              />
            </div>

            <button
              type="submit"
              className="flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-6 py-4 text-lg font-extrabold text-white shadow-sm transition-all hover:bg-[#B71C1C] active:scale-[0.98] cursor-pointer"
            >
              <PackageCheck className="h-6 w-6 shrink-0" />
              <span>Marquer VENDUE</span>
            </button>
          </form>
        </section>

        {/* Liste du stock et des ventes */}
        <section className="lg:col-span-7 rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-neutral-950">
                Étiquettes {normalizedFranchise}
              </h2>
              <span className="text-xs font-semibold text-neutral-600">
                Touchez un stock pour sélectionner
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  aria-label="Filtrer par numéro de série"
                  value={listSearch}
                  onChange={(e) => {
                    setListSearch(e.target.value.toUpperCase());
                    setListPage(1);
                  }}
                  placeholder="Rechercher AP-..."
                  className="w-full min-h-[42px] rounded-xl border border-neutral-300 bg-white pl-9 pr-3 text-sm font-mono-code font-semibold text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                {(
                  [
                    ['TOUTES', 'Toutes'],
                    ['STOCK', 'Stock'],
                    ['VENDUES', 'Vendues'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setListFilter(key);
                      setListPage(1);
                    }}
                    className={`min-h-[36px] rounded-lg px-3 py-1 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      listFilter === key
                        ? 'bg-[#D32F2F] text-white'
                        : 'text-neutral-700 hover:text-neutral-950'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {paginatedFranchiseTags.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-600">
              Aucune étiquette trouvée pour {normalizedFranchise}.
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600">
                  <tr>
                    <th className="py-3 px-4">Série</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {paginatedFranchiseTags.map((tag) => {
                    const inStock = tag.status === 'STOCK';
                    return (
                      <tr key={tag.serial} className="hover:bg-neutral-50">
                        <td className="py-3.5 px-4 font-mono-code font-bold text-neutral-950">
                          {tag.serial}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          {inStock ? (
                            <span className="text-neutral-600">STOCK</span>
                          ) : (
                            <span className="text-[#D32F2F] font-bold">
                              {tag.status}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {inStock ? (
                            <button
                              type="button"
                              onClick={() => setSerialInput(tag.serial)}
                              className="min-h-[40px] rounded-xl bg-neutral-200 px-3.5 py-2 text-xs font-bold text-neutral-950 transition-colors hover:bg-neutral-300 cursor-pointer whitespace-nowrap"
                            >
                              Sélectionner
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-600 font-mono-code font-bold">
                              +300 F
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalListPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-xs">
              <span className="font-mono-code text-neutral-600">
                Page {safeListPage} / {totalListPages} ({filteredFranchiseTags.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeListPage <= 1}
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                  className="min-h-[38px] rounded-xl bg-neutral-200 px-3 py-1 font-bold text-neutral-950 hover:bg-neutral-300 disabled:opacity-40 cursor-pointer"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={safeListPage >= totalListPages}
                  onClick={() =>
                    setListPage((p) => Math.min(totalListPages, p + 1))
                  }
                  className="min-h-[38px] rounded-xl bg-neutral-200 px-3 py-1 font-bold text-neutral-950 hover:bg-neutral-300 disabled:opacity-40 cursor-pointer"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
