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

const CloseButton = ({ handleClose, className }: { handleClose: () => void; className?: string }) => (
  <button
    type="button"
    onClick={handleClose}
    className={cn('flex h-10 w-16 items-center justify-center bg-red-800 p-5 hover:bg-red-700', className)}
  >
    <MdClose />
  </button>
);

export default CloseButton;
