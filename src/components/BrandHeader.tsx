"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Sparkles, Menu, X } from 'lucide-react';

const BrandHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        background: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-start px-5 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Pixnora home">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--bg)' }} />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-5 hidden items-center gap-1 md:flex">
          {[
            { href: '/about', label: 'About us' },
            { href: '/how-it-works', label: 'How it works' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-glass)]"
              style={{ color: 'var(--fg-muted)' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:opacity-80"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-4 pb-4 flex flex-col gap-2 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <Link href="/about" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-medium" style={{ color: 'var(--fg)' }}>About us</Link>
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-medium" style={{ color: 'var(--fg)' }}>How it works</Link>
        </div>
      )}
    </header>
  );
};

export default BrandHeader;
