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
import useIsMobileView from '@/hooks/useIsMobileView';
import MobileButtonsBar from '@/components/shared/FloatingsButtonsBar/MobileButtonsBar';
import DesktopButtonsBar from '@/components/shared/FloatingsButtonsBar/DesktopButtonsBar';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';

const FloatingButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const isMobileView = useIsMobileView();

  return isMobileView ? <MobileButtonsBar {...props} /> : <DesktopButtonsBar {...props} />;
};

export default FloatingButtonsBar;
