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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import findAncestorIds from '@libs/menubar/findAncestorIds';
import findMenuItemById from '@libs/menubar/findMenuItemById';

const getActiveColorClass = (color: string) => color.split(':')[1] ?? color;

const useMenuBarSelection = (menuBarEntries: MenuBarEntry) => {
  const { pathname } = useLocation();

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const activeTargetId = useMemo(
    () =>
      [...pathParts.slice(1)]
        .reverse()
        .find((pathPart) => findAncestorIds(menuBarEntries.menuItems, pathPart).length > 0) ?? null,
    [pathParts, menuBarEntries.menuItems],
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(activeTargetId);

  useEffect(() => {
    setSelectedItemId(activeTargetId);
  }, [activeTargetId]);

  const activeItemId = selectedItemId ?? activeTargetId;

  const isSelected = useMemo(() => {
    if (!activeItemId) {
      return menuBarEntries.menuItems[0]?.id ?? '';
    }

    const topLevelId = findAncestorIds(menuBarEntries.menuItems, activeItemId)[0];
    if (topLevelId) return topLevelId;

    return menuBarEntries.menuItems[0]?.id ?? '';
  }, [activeItemId, menuBarEntries.menuItems]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activeItemId) return;
    const ancestors = findAncestorIds(menuBarEntries.menuItems, activeItemId);
    if (ancestors.length === 0) return;

    setExpandedItems((prev) => {
      const missing = ancestors.filter((id) => !prev.has(id));
      if (missing.length === 0) return prev;
      const next = new Set(prev);
      missing.forEach((id) => next.add(id));
      return next;
    });
  }, [activeItemId, menuBarEntries.menuItems]);

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const activeItem = useMemo(() => {
    if (activeItemId) {
      const menuItem = findMenuItemById(menuBarEntries.menuItems, activeItemId);
      if (menuItem) return menuItem;
    }

    return findMenuItemById(menuBarEntries.menuItems, isSelected);
  }, [activeItemId, isSelected, menuBarEntries.menuItems]);

  return {
    pathParts,
    isSelected,
    selectedItemId,
    setSelectedItemId,
    expandedItems,
    toggleExpanded,
    getActiveColorClass,
    activeItem,
  };
};

export default useMenuBarSelection;
