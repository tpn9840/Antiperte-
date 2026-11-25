import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center justify-center md:justify-start gap-2 rounded-xl bg-neutral-950 border border-[#D32F2F] px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
      <WifiOff className="h-4 w-4 shrink-0 text-[#D32F2F]" />
      <span>Mode hors ligne — Données locales disponibles.</span>
    </div>
  );
};
