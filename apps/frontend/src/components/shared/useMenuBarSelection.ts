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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import useSubMenuStore from '@/store/useSubMenuStore';

const getActiveColorClass = (color: string) => color.split(':')[1] ?? color;

const useMenuBarSelection = (menuBarEntries: MenuBarEntry) => {
  const { pathname } = useLocation();

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  const isSelected = useMemo(() => {
    if (!pathParts[1]) {
      return menuBarEntries.menuItems[0]?.id ?? '';
    }

    const isTopLevel = menuBarEntries.menuItems.some((item) => item.id === pathParts[1]);
    if (isTopLevel) {
      return pathParts[1];
    }

    const parentItem = menuBarEntries.menuItems.find((item) =>
      item.children?.some((child) => child.id === pathParts[1]),
    );
    if (parentItem) {
      return parentItem.id;
    }

    return menuBarEntries.menuItems[0]?.id ?? '';
  }, [pathParts, menuBarEntries.menuItems]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const searchTerm = useSubMenuStore((state) => state.searchTerm);
  const expandedBeforeSearchRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isSelected) {
      setExpandedItems((prev) => {
        if (prev.has(isSelected)) return prev;
        return new Set(prev).add(isSelected);
      });
    }
  }, [isSelected]);

  useEffect(() => {
    if (searchTerm) {
      expandedBeforeSearchRef.current = new Set(expandedItems);
      const allIds = new Set(menuBarEntries.menuItems.map((item) => item.id));
      setExpandedItems(allIds);
    } else if (expandedBeforeSearchRef.current.size > 0) {
      setExpandedItems(expandedBeforeSearchRef.current);
      expandedBeforeSearchRef.current = new Set();
    }
  }, [searchTerm]);

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

  const activeItem = useMemo(
    () => menuBarEntries.menuItems.find((item) => item.id === isSelected),
    [isSelected, menuBarEntries.menuItems],
  );

  return {
    pathParts,
    isSelected,
    expandedItems,
    toggleExpanded,
    getActiveColorClass,
    activeItem,
  };
};

export default useMenuBarSelection;
