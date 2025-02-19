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

import React, { forwardRef } from 'react';

interface HexagonButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const HexagonButton = forwardRef<HTMLButtonElement, HexagonButtonProps>(({ children, onClick }, ref) => (
  <div>
    <button
      ref={ref}
      onClick={onClick}
      className="border-1 group relative flex h-8 w-8 items-center justify-center overflow-hidden border-ciGreen border-opacity-0 bg-ciGreen text-background transition-colors hover:border-opacity-100"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      }}
      type="button"
    >
      <span
        className="absolute inset-0 origin-center scale-x-0 transform bg-ciGreen transition-transform group-hover:scale-x-100"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  </div>
));

HexagonButton.displayName = 'HexagonButton';
export default HexagonButton;
