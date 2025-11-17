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

import FloatingButtonConfig from '../types/FloatingButtons/floatingButtonConfig';

const calculateButtonLayout = (containerWidth: number, buttonWidth: number, visibleButtons: FloatingButtonConfig[]) => {
  if (containerWidth === 0 || buttonWidth === 0) {
    return {
      hasOverflow: false,
      displayedButtons: visibleButtons,
      overflowButtons: [],
    };
  }

  const maxWithoutMore = Math.floor(containerWidth / buttonWidth);

  if (visibleButtons.length <= maxWithoutMore) {
    return {
      hasOverflow: false,
      displayedButtons: visibleButtons,
      overflowButtons: [],
    };
  }

  const maxWithMore = Math.max(1, Math.floor((containerWidth - buttonWidth) / buttonWidth));

  return {
    hasOverflow: true,
    displayedButtons: visibleButtons.slice(0, maxWithMore),
    overflowButtons: visibleButtons.slice(maxWithMore),
  };
};

export default calculateButtonLayout;
