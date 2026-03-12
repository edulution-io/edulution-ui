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
import { useNavigate } from 'react-router-dom';
import MenuBarIcon from '@libs/menubar/menuBarIcon';
import MenuBarRenderIcon from './MenuBarRenderIcon';

interface MenuBarHeaderProps {
  icon: MenuBarIcon;
  title: string;
  pathParts: string[];
  onHeaderClick?: () => void;
}

const MenuBarHeader: React.FC<MenuBarHeaderProps> = ({ icon, title, pathParts, onHeaderClick }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (onHeaderClick) {
      onHeaderClick();
      return;
    }
    navigate(pathParts[0]);
  }, [onHeaderClick, pathParts, navigate]);

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <button
        className="flex flex-col items-center justify-center rounded-xl p-2 hover:bg-muted-background"
        type="button"
        onClick={handleClick}
      >
        <MenuBarRenderIcon
          icon={icon}
          alt={title}
          className="h-20 w-20 object-contain transition-all"
          applyIconClassName
        />
        <h2 className="mb-2 mt-2 text-center font-bold">{title}</h2>
      </button>
    </div>
  );
};

export default MenuBarHeader;
