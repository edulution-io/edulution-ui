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
import useMedia from '@/hooks/useMedia';
import MobileFloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/MobileFloatingButtonsBar';
import DesktopFloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/DesktopFloatingButtonsBar';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';
import { createPortal } from 'react-dom';
import FLOATING_BUTTONS_BAR_ID from '@libs/ui/constants/floatingButtonsBarId';
import usePortalRoot from '@/hooks/usePortalRoot';

const FloatingButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const { isMobileView } = useMedia();
  const portalRoot = usePortalRoot(FLOATING_BUTTONS_BAR_ID);

  if (!portalRoot) return null;

  return createPortal(
    isMobileView ? <MobileFloatingButtonsBar {...props} /> : <DesktopFloatingButtonsBar {...props} />,
    portalRoot,
  );
};

export default FloatingButtonsBar;
