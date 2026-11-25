import React, { useState } from 'react';
import { LayoutGrid, Store } from 'lucide-react';
import type { StickerTag, SubscriberNotification } from '../types/antiperte';
import { AdminPage } from './AdminPage';
import { FranchisePage } from './FranchisePage';

interface ProPortalPageProps {
  tags: StickerTag[];
  onUpdateTags: (nextTags: StickerTag[]) => void;
  featuredTexts: [string, string, string];
  onUpdateFeaturedTexts: (nextTexts: [string, string, string]) => void;
  notifications: SubscriberNotification[];
  onUpdateNotifications: (next: SubscriberNotification[]) => void;
}

export const ProPortalPage: React.FC<ProPortalPageProps> = ({
  tags,
  onUpdateTags,
  featuredTexts,
  onUpdateFeaturedTexts,
  notifications,
  onUpdateNotifications,
}) => {
  const [section, setSection] = useState<'franchise' | 'admin'>('franchise');

  return (
    <div className="space-y-6">
      {/* Sélecteur Franchisé / Admin */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-neutral-100 p-1.5 border border-neutral-200 max-w-md">
        <button
          type="button"
          onClick={() => setSection('franchise')}
          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm sm:text-base font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
            section === 'franchise'
              ? 'bg-[#D32F2F] text-white shadow-sm'
              : 'bg-neutral-200/60 text-neutral-800 hover:bg-neutral-200'
          }`}
        >
          <Store className="h-4 w-4 shrink-0" />
          <span>Franchisé</span>
        </button>

        <button
          type="button"
          onClick={() => setSection('admin')}
          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm sm:text-base font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
            section === 'admin'
              ? 'bg-neutral-950 text-white shadow-sm'
              : 'bg-neutral-200/60 text-neutral-800 hover:bg-neutral-200'
          }`}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" />
          <span>Admin</span>
        </button>
      </div>

      {section === 'franchise' ? (
        <FranchisePage tags={tags} onUpdateTags={onUpdateTags} />
      ) : (
        <AdminPage
          tags={tags}
          onUpdateTags={onUpdateTags}
          featuredTexts={featuredTexts}
          onUpdateFeaturedTexts={onUpdateFeaturedTexts}
          notifications={notifications}
          onUpdateNotifications={onUpdateNotifications}
        />
      )}
    </div>
  );
};
