'use client';

import React, { useState } from 'react';

const categoryGroups = {
  Portraits: ['Professional ID Photo', 'LinkedIn Profile Photo', 'Professional Portrait'],
  Photography: ['Cinematic Photography', 'Product Photography', 'Fashion Photography', 'Nature', 'Architecture'],
  'Art & Design': ['Anime', 'Fantasy Art', '3D Art', 'Digital Art', 'Social Media', 'Illustration', 'Other'],
} as const;

type CategoryGroup = keyof typeof categoryGroups;
const groups = Object.keys(categoryGroups) as CategoryGroup[];

interface CategoryBarProps {
  selected?: string;
  onSelect: (category: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ selected = '', onSelect }) => {
  const selectedGroup = groups.find((group) =>
    selected === group || categoryGroups[group].some((category) => category === selected)
  );
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>('Portraits');
  const visibleGroup = selectedGroup || activeGroup;
  const visibleCategories = selectedGroup ? categoryGroups[visibleGroup] : [];

  const selectGroup = (group?: CategoryGroup) => {
    setActiveGroup(group || 'Portraits');
    onSelect(group || '');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Prompt category groups">
        <button
          type="button"
          onClick={() => selectGroup()}
          aria-pressed={!selected}
          className="min-h-10 shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors"
          style={{
            background: selected ? 'var(--bg-card)' : 'var(--fg)',
            borderColor: 'var(--border)',
            color: selected ? 'var(--fg)' : 'var(--bg)',
          }}
        >
          All
        </button>
        {groups.map((group) => {
          const isActive = selected === group || categoryGroups[group].some((category) => category === selected);
          return (
            <button
              key={group}
              type="button"
              onClick={() => selectGroup(group)}
              aria-pressed={isActive}
              className="min-h-10 shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors"
              style={{
                background: isActive ? 'var(--fg)' : 'var(--bg-card)',
                borderColor: 'var(--border)',
                color: isActive ? 'var(--bg)' : 'var(--fg-muted)',
              }}
            >
              {group}
            </button>
          );
        })}
      </div>

      {visibleCategories.length > 0 && (
        <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[.12em]" style={{ color: 'var(--fg-muted)' }}>
            {visibleGroup}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label={`${visibleGroup} subcategories`}>
            {visibleCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onSelect(selected === category ? visibleGroup : category)}
                aria-pressed={selected === category}
                className="min-h-10 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors sm:text-center"
                style={{
                  background: selected === category ? 'var(--fg)' : 'transparent',
                  borderColor: 'var(--border)',
                  color: selected === category ? 'var(--bg)' : 'var(--fg-muted)',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBar;
