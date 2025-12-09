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
import useSubMenuStore from '@/store/useSubMenuStore';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import { TabsTrigger } from '@/components/ui/Tabs';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import DropdownMenu from '@/components/shared/DropdownMenu';

interface TabWithSectionsProps {
  item: { id: string; name: string };
  isActive: boolean;
  onClick: () => void;
}

const TabWithSections: React.FC<TabWithSectionsProps> = ({ item, isActive, onClick }) => {
  const { sections, setActiveSection } = useSubMenuStore();

  const hasSections = isActive && sections.length > 0;

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setTimeout(() => setActiveSection(null), 2000);

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const sectionItems: DropdownMenuItemType[] = sections.map((section) => ({
    label: section.label,
    onClick: () => handleSectionClick(section.id),
  }));

  if (!hasSections) {
    return (
      <TabsTrigger
        value={item.id}
        onClick={onClick}
        className="text-[clamp(0.65rem,2vw,0.8rem)] xl:min-w-64"
      >
        {item.name}
      </TabsTrigger>
    );
  }

  return (
    <DropdownMenu
      trigger={
        <TabsTrigger
          value={item.id}
          onClick={(e) => {
            if (!isActive) {
              onClick();
            } else {
              e.preventDefault();
            }
          }}
          className="text-[clamp(0.65rem,2vw,0.8rem)] xl:min-w-64"
        >
          <span className="flex items-center gap-1">
            {item.name}
            <ChevronDownIcon className="h-3 w-3" />
          </span>
        </TabsTrigger>
      }
      items={sectionItems}
    />
  );
};

export default TabWithSections;
