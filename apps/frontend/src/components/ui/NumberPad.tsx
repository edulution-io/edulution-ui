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
import { MdOutlineBackspace } from 'react-icons/md';
import { Button } from '../shared/Button';

interface NumberPadProps {
  onPress: (digit: string) => void;
  onClear: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onPress, onClear }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="m-4 grid max-w-52 grid-cols-3 gap-2">
      {digits.map((d) => (
        <Button
          key={d}
          variant="btn-outline"
          type="button"
          className="aspect-square hover:bg-ciGrey/10"
          onClick={() => onPress(d)}
        >
          {d}
        </Button>
      ))}
      <Button
        variant="btn-outline"
        type="button"
        className="w-[136px] hover:bg-ciGrey/10"
        onClick={onClear}
      >
        <MdOutlineBackspace />
      </Button>
    </div>
  );
};

export default NumberPad;
