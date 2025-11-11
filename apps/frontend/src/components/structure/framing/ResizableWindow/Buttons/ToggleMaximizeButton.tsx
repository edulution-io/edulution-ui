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
import cn from '@libs/common/utils/className';
import { BiWindow, BiWindows } from 'react-icons/bi';
import { IconContext } from 'react-icons';
import WindowControlBaseButton from './WindowControlBaseButton';

interface ToggleMaximizeButtonProps {
  handleMaximizeToggle: () => void;
  isMinimized: boolean;
  isMaximized: boolean;
}

const ToggleMaximizeButton = ({ handleMaximizeToggle, isMinimized, isMaximized }: ToggleMaximizeButtonProps) => {
  const iconContextValue = useMemo(() => ({ className: 'h-4 w-4' }), []);

  const extraClasses = cn({
    'h-5 w-8 px-0': isMinimized,
  });

  return (
    <IconContext.Provider value={iconContextValue}>
      <WindowControlBaseButton
        tooltipTranslationId={isMaximized ? 'common.restore' : 'common.maximize'}
        onClick={handleMaximizeToggle}
        className={extraClasses}
      >
        {isMaximized ? <BiWindows /> : <BiWindow />}
      </WindowControlBaseButton>
    </IconContext.Provider>
  );
};

export default ToggleMaximizeButton;
