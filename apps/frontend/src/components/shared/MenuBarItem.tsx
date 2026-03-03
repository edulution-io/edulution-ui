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

import React, { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Button, cn } from '@edulution-io/ui-kit';
import { useTranslation } from 'react-i18next';
import MenuItem from '@libs/menubar/menuItem';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import MenuBarRenderIcon from './MenuBarRenderIcon';

interface MenuBarItemProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded: boolean;
  shouldCollapse: boolean;
  activeColorClass: string;
  activeSection: string | null;
  pathParts: string[];
  onToggleExpand: () => void;
  onCloseMobileMenu: () => void;
}

const MenuBarItem: React.FC<MenuBarItemProps> = ({
  item,
  isActive,
  isExpanded,
  shouldCollapse,
  activeColorClass,
  activeSection,
  pathParts,
  onToggleExpand,
  onCloseMobileMenu,
}) => {
  const { t } = useTranslation();
  const hasChildren = item.children && item.children.length > 0;

  const handleItemClick = useCallback(() => {
    onCloseMobileMenu();
    item.action();
    if (hasChildren && !isExpanded) {
      onToggleExpand();
    }
  }, [item, hasChildren, isExpanded, onCloseMobileMenu, onToggleExpand]);

  const handleExpandClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand();
    },
    [onToggleExpand],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleItemClick();
      }
    },
    [handleItemClick],
  );

  const childrenId = `${item.id}-children`;

  const mainButton = (
    <div
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-controls={hasChildren ? childrenId : undefined}
      aria-label={item.label}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 py-1 pl-3 pr-3 transition-colors hover:bg-muted-background',
        isActive ? activeColorClass : '',
        shouldCollapse && 'justify-center',
      )}
    >
      <MenuBarRenderIcon
        icon={item.icon}
        alt={item.label}
        className="h-12 w-12 object-contain"
        applyIconClassName={!isActive}
      />
      {!shouldCollapse && (
        <>
          <span className={cn('flex-1 text-left', isActive ? 'text-white' : '')}>{item.label}</span>
          {hasChildren && (
            <Button
              type="button"
              variant="btn-ghost"
              onClick={handleExpandClick}
              aria-label={isExpanded ? t('common.collapse') : t('common.expand')}
              className="p-1"
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className={cn(
                  'h-4 w-4 shrink-0 text-white transition-transform duration-200',
                  isExpanded && 'rotate-180',
                )}
              />
            </Button>
          )}
        </>
      )}
    </div>
  );

  const childrenContent = hasChildren && !shouldCollapse && (
    <div
      id={childrenId}
      role="region"
      aria-label={`${item.label} sections`}
      className={cn(
        'grid transition-all duration-200 ease-in-out',
        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="overflow-hidden">
        <div className="ml-2">
          {item.children?.map((child) => {
            const isChildActive = activeSection === child.id || pathParts.includes(child.id);
            return (
              <Button
                key={child.id}
                type="button"
                variant="btn-ghost"
                onClick={() => {
                  onCloseMobileMenu();
                  child.action();
                }}
                className={cn(
                  'flex w-full items-center justify-start py-2 pl-4 pr-3 font-normal',
                  'transition-all duration-150',
                  'hover:pl-5',
                  isChildActive && 'bg-accent font-bold',
                )}
              >
                <span className="truncate">{child.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (shouldCollapse) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{mainButton}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      {mainButton}
      {childrenContent}
    </div>
  );
};

export default MenuBarItem;
