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
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import WindowControlBaseButton from './WindowControlBaseButton';

interface SaveButtonProps {
  onClick: () => Promise<void> | void;
  disabled?: boolean;
}

const SaveButton = ({ onClick, disabled }: SaveButtonProps) => (
  <WindowControlBaseButton
    onClick={onClick}
    tooltipTranslationId="common.save"
    disabled={disabled}
  >
    <div className="relative">
      <FontAwesomeIcon icon={faFloppyDisk} />
      {!disabled && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-ciLightBlue" />}
    </div>
  </WindowControlBaseButton>
);

export default SaveButton;
