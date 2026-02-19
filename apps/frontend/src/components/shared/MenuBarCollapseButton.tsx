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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { Button, cn } from '@edulution-io/ui-kit';

interface MenuBarCollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const MenuBarCollapseButton: React.FC<MenuBarCollapseButtonProps> = ({ isCollapsed, onToggle }) => (
  <Button
    type="button"
    variant="btn-outline"
    size="sm"
    onClick={onToggle}
    className={cn(
      'bg-glass absolute right-[-15px] top-2 z-10 border-accent px-2 py-1 backdrop-blur-lg hover:bg-muted-background',
      isCollapsed ? 'cursor-e-resize' : 'cursor-w-resize',
    )}
  >
    {isCollapsed ? (
      <FontAwesomeIcon icon={faArrowRightToBracket} />
    ) : (
      <FontAwesomeIcon
        icon={faArrowRightFromBracket}
        className="rotate-180"
      />
    )}
  </Button>
);

export default MenuBarCollapseButton;
