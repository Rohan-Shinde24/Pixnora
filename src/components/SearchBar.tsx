'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const DEBOUNCE_DELAY = 300;

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [value, setValue] = useState('');
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    onSearch(debounced.trim());
  }, [debounced, onSearch]);

  const clear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-search)' }}
    >
      <Search className="h-5 w-5 shrink-0" style={{ color: 'var(--fg)' }} />
      <input
        type="text"
        aria-label="Search image prompts"
        placeholder="Search prompts, styles, or AI models..."
        value={value}
        onChange={e => setValue(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        style={{ color: 'var(--fg)' }}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="rounded-full p-1 transition-colors hover:bg-[var(--bg-glass)]"
        >
          <X className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
