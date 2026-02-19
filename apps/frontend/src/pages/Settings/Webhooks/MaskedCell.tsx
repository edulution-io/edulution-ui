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

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import SelectableCell from '@/components/ui/Table/SelectableCell';

const MASKED_VALUE = '********';

interface MaskedCellProps {
  value: string;
}

const MaskedCell: React.FC<MaskedCellProps> = ({ value }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <SelectableCell text={isVisible ? value : MASKED_VALUE} />
      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        className="mr-10"
      >
        <FontAwesomeIcon
          icon={isVisible ? faEyeSlash : faEye}
          className="h-5 w-5"
        />
      </button>
    </div>
  );
};

export default MaskedCell;
