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

type FlagProps = {
  country: string;
  code: string;
};

const Flag: React.FC<FlagProps> = ({ country, code }) => (
  <div className="flex align-middle">
    <div className="h-[16px] w-[24px]" />
    <p>{`${country} (${code})`}</p>
  </div>
);

export default Flag;
