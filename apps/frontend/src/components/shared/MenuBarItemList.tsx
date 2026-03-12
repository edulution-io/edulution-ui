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

import React from 'react';
import MenuItem from '@libs/menubar/menuItem';
import MenuBarItem from './MenuBarItem';

interface MenuBarItemListProps {
  menuItems: MenuItem[];
  isSelected: string;
  expandedItems: Set<string>;
  shouldCollapse: boolean;
  activeColorClass: string;
  activeSection: string | null;
  selectedItemId: string | null;
  pathParts: string[];
  onSelectItem: (itemId: string | null) => void;
  onToggleExpand: (itemId: string) => void;
  onCloseMobileMenu: () => void;
}

const MenuBarItemList: React.FC<MenuBarItemListProps> = ({
  menuItems,
  isSelected,
  expandedItems,
  shouldCollapse,
  activeColorClass,
  activeSection,
  selectedItemId,
  pathParts,
  onSelectItem,
  onToggleExpand,
  onCloseMobileMenu,
}) => (
  <div className="flex-1 overflow-y-auto pb-10">
    {menuItems.map((item) => (
      <MenuBarItem
        key={item.id}
        item={item}
        isActive={isSelected === item.id}
        isExpanded={expandedItems.has(item.id)}
        shouldCollapse={shouldCollapse}
        activeColorClass={activeColorClass}
        activeSection={activeSection}
        selectedItemId={selectedItemId}
        expandedItems={expandedItems}
        pathParts={pathParts}
        onSelectItem={onSelectItem}
        onToggleExpand={onToggleExpand}
        onCloseMobileMenu={onCloseMobileMenu}
      />
    ))}
  </div>
);

export default MenuBarItemList;
