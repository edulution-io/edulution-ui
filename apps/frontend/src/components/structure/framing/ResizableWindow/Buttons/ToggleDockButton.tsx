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

import React, { useMemo } from 'react';
import { BiSolidDockRight } from 'react-icons/bi';
import { IconContext } from 'react-icons';
import { VscEmptyWindow } from 'react-icons/vsc';
import WindowControlBaseButton from './WindowControlBaseButton';

interface ToggleDockButtonProps {
  onClick: () => void;
  isDocked: boolean;
}

const ToggleDockButton = ({ onClick, isDocked }: ToggleDockButtonProps) => {
  const iconContextValue = useMemo(() => ({ className: 'h-4 w-4' }), []);

  return (
    <IconContext.Provider value={iconContextValue}>
      <WindowControlBaseButton
        onClick={onClick}
        tooltipTranslationId={isDocked ? 'common.undock' : 'common.dock'}
      >
        {isDocked ? <VscEmptyWindow /> : <BiSolidDockRight />}
      </WindowControlBaseButton>
    </IconContext.Provider>
  );
};

export default ToggleDockButton;
