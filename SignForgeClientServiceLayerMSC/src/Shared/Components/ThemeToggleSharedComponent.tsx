import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useOfferDocumentStore } from '../../Store/OfferDocumentStore';

export default function ThemeToggleSharedComponent() {
  const { theme, toggleTheme } = useOfferDocumentStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle visual theme"
      className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-all border border-slate-200/80 dark:border-zinc-800/80 cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
    </button>
  );
}
