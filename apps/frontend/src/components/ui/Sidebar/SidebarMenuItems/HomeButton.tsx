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
import { MobileLogoIcon } from '@/assets/icons';
import { SIDEBAR_ICON_WIDTH } from '@libs/ui/constants';

const HomeButton: React.FC = () => (
    <div
      className="group relative right-0 top-0 z-50 mb-2 flex max-h-14 items-center justify-end gap-4 bg-black px-4 py-2 md:block md:px-3"
    >
      <img
        src={MobileLogoIcon}
        width={SIDEBAR_ICON_WIDTH}
        alt="edulution-mobile-logo"
      />
    </div>
  );

export default HomeButton;
