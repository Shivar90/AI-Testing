// App header — logo mark, title, search, and action controls: theme toggle,
// JSON export, JSON import, and "+ Add Job". (Controls visible in the
// screenshot; export/import are the Requirements.md nice-to-haves.)

import { useRef, type ChangeEvent } from 'react';
import { DownloadIcon, MoonIcon, PlusIcon, SunIcon, UploadIcon } from './Icons';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  search: string;
  onSearch: (value: string) => void;
  onAddJob: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  importError?: string | null;
  onDismissImportError: () => void;
  activePage: 'board' | 'evaluate';
  onNavigate: (page: 'board' | 'evaluate') => void;
}

export function Header({
  theme,
  onToggleTheme,
  search,
  onSearch,
  onAddJob,
  onExport,
  onImport,
  importError,
  onDismissImportError,
  activePage,
  onNavigate,
}: HeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = '';
  };

  const iconBtnCls =
    'rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200';

  const tabCls = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
    }`;

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-3">
        {/* Logo + title */}
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#3b82f6" />
            <text
              x="16"
              y="22"
              fontFamily="Arial, sans-serif"
              fontSize="14"
              fontWeight="bold"
              fill="#ffffff"
              textAnchor="middle"
            >
              JT
            </text>
          </svg>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Job Tracker
          </h1>
        </div>

        {/* Page navigation */}
        <nav className="ml-2 flex items-center gap-1" aria-label="Pages">
          <button
            type="button"
            onClick={() => onNavigate('board')}
            className={tabCls(activePage === 'board')}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => onNavigate('evaluate')}
            className={tabCls(activePage === 'evaluate')}
          >
            Job Match
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <input
            type="search"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-48 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-accent-applied focus:ring-2 focus:ring-accent-applied/20 sm:w-56 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={iconBtnCls}
            aria-label="Toggle light/dark mode"
            title="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={onExport}
            className={iconBtnCls}
            aria-label="Export data as JSON"
            title="Export JSON"
          >
            <DownloadIcon />
          </button>

          {/* Import */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={iconBtnCls}
            aria-label="Import data from JSON"
            title="Import JSON"
          >
            <UploadIcon />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />

          {/* Add Job */}
          <button
            type="button"
            onClick={onAddJob}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-applied px-4 py-2 text-sm font-medium text-white hover:bg-accent-applied/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Job
          </button>
        </div>
      </div>

      {importError && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <span>{importError}</span>
          <button
            type="button"
            onClick={onDismissImportError}
            className="ml-3 rounded p-1 hover:bg-red-100 dark:hover:bg-red-500/20"
            aria-label="Dismiss import error"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
}