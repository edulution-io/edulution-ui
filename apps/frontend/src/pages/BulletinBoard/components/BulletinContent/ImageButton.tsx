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

interface ImageButtonProps {
  src: string;
  onClick: (url: string) => void;
}

const ImageButton: React.FC<ImageButtonProps> = ({ src, onClick }) => (
  <button
    type="button"
    className="max-w-full cursor-pointer border-0 bg-transparent p-0"
    onClick={() => onClick(src)}
  >
    <img
      src={src}
      alt="attachment"
      className="max-w-full"
    />
  </button>
);

export default ImageButton;
