/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import { FontAwesomeIcon, getFontAwesomeIconList, loadFontAwesomeIcon } from '@/utils/fontAwesomeIcons';
import Input from '@/components/shared/Input';
import { Card } from '@/components/shared/Card';

interface FontAwesomeIconGridProps {
  selectedIcon: string | null;
  onIconSelect: (iconPath: string) => void;
}

const COLUMN_COUNT = 6;
const ICON_SIZE = 80;
const VISIBLE_ROWS = 3;
const OVERSCAN_ROWS = 2;

const FontAwesomeIconGrid: React.FC<FontAwesomeIconGridProps> = ({ selectedIcon, onIconSelect }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [loadedIcons, setLoadedIcons] = useState<Record<string, string>>({});
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: VISIBLE_ROWS + OVERSCAN_ROWS });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allIcons = useMemo(() => getFontAwesomeIconList(), []);

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return allIcons;
    }

    const term = searchTerm.toLowerCase();
    return allIcons.filter((icon) => icon.name.toLowerCase().includes(term));
  }, [allIcons, searchTerm]);

  const totalRows = Math.ceil(filteredIcons.length / COLUMN_COUNT);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop } = container;
    const startRow = Math.floor(scrollTop / ICON_SIZE);
    const endRow = Math.min(startRow + VISIBLE_ROWS + OVERSCAN_ROWS * 2, totalRows);

    setVisibleRange({ start: Math.max(0, startRow - OVERSCAN_ROWS), end: endRow });
  }, [totalRows]);

  useEffect(() => {
    setVisibleRange({ start: 0, end: VISIBLE_ROWS + OVERSCAN_ROWS });
  }, [searchTerm]);

  const loadIcon = useCallback(
    (icon: FontAwesomeIcon) => {
      if (loadedIcons[icon.path]) return;

      void loadFontAwesomeIcon(icon)
        .then((url) => {
          setLoadedIcons((prev) => ({ ...prev, [icon.path]: url }));
        })
        .catch((error) => {
          console.error(`Failed to load icon: ${icon.path}`, error);
        });
    },
    [loadedIcons],
  );

  const visibleIcons = useMemo(() => {
    const startIndex = visibleRange.start * COLUMN_COUNT;
    const endIndex = visibleRange.end * COLUMN_COUNT;
    return filteredIcons.slice(startIndex, endIndex);
  }, [filteredIcons, visibleRange]);

  useEffect(() => {
    visibleIcons.forEach(loadIcon);
  }, [visibleIcons, loadIcon]);

  const renderIcon = (icon: FontAwesomeIcon) => {
    const isSelected = selectedIcon === icon.path;
    const iconUrl = loadedIcons[icon.path];

    return (
      <button
        key={icon.path}
        type="button"
        onClick={() => onIconSelect(icon.path)}
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-all hover:border-secondary hover:shadow-md',
          isSelected ? 'bg-primary/10 border-primary' : 'border-transparent',
        )}
        title={`${icon.category}: ${icon.name}`}
      >
        {iconUrl ? (
          <div
            className="h-10 w-10 text-background"
            style={{
              WebkitMaskImage: `url(${iconUrl})`,
              maskImage: `url(${iconUrl})`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              backgroundColor: 'currentColor',
            }}
          />
        ) : (
          <div className="h-10 w-10 animate-pulse rounded bg-muted" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <Input
        type="text"
        placeholder={t('appstore.searchIcons')}
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        className="w-full"
        variant="dialog"
      />

      <Card
        className="overflow-hidden p-0 transition-none hover:scale-100"
        variant="dialog"
      >
        {filteredIcons.length > 0 ? (
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto scrollbar-thin"
            style={{ height: ICON_SIZE * VISIBLE_ROWS }}
            onScroll={handleScroll}
          >
            <div style={{ height: totalRows * ICON_SIZE, position: 'relative' }}>
              <div
                className="grid grid-cols-6 gap-4 p-3"
                style={{
                  position: 'absolute',
                  top: visibleRange.start * ICON_SIZE,
                  width: '100%',
                }}
              >
                {visibleIcons.map((icon) => renderIcon(icon))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            {t('appstore.noIconsFound')}
          </div>
        )}
      </Card>

      <div className="text-xs text-muted-foreground">
        {filteredIcons.length} {t('appstore.iconsAvailable')}
      </div>
    </div>
  );
};

export default FontAwesomeIconGrid;
