/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import cn from '@libs/common/utils/className';
import { MdClose } from 'react-icons/md';
import WindowControlBaseButton from './WindowControlBaseButton';

interface CloseButtonProps {
  handleClose: () => void;
  className?: string;
}

const CloseButton = ({ handleClose, className }: CloseButtonProps) => {
  const closeClasses = cn('bg-red-800 hover:bg-red-700', className);

  return (
    <WindowControlBaseButton
      tooltipTranslationId="common.close"
      onClick={handleClose}
      className={closeClasses}
    >
      <MdClose />
    </WindowControlBaseButton>
  );
};

export default CloseButton;
