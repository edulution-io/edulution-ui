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

import React, { FC } from 'react';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

interface StateLoaderProps {
  isLoading: boolean;
}

const StateLoader: FC<StateLoaderProps> = ({ isLoading }) =>
  isLoading ? (
    <div className="flex items-center justify-end pr-12">
      <CircleLoader className="h-1 w-1" />
    </div>
  ) : null;

export default StateLoader;
