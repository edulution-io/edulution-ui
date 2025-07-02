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

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SidebarItemIcon from '@/components/ui/Sidebar/SidebarMenuItems/SidebarItemIcon';

interface PopoverProps {
  anchorRect: DOMRect;
  color: string;
  title: string;
  iconSrc: string;
  isHovered: boolean;
}

const SidebarItemPopover: React.FC<PopoverProps> = ({ anchorRect, color, title, iconSrc, isHovered }) => {
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setIsEntered(true));

    return () => {
      cancelAnimationFrame(animationFrame);
      setIsEntered(false);
    };
  }, []);

  const isVisible = isHovered && isEntered;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchorRect.top,
    left: anchorRect.right,
    height: anchorRect.height,
    zIndex: 700,
    transform: 'translateX(-100%)',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
    pointerEvents: 'none',
  };

  return createPortal(
    <div
      style={style}
      className={`${color} flex items-center gap-4 rounded-l-[8px] pl-4 pr-[13px]`}
    >
      <p className="whitespace-nowrap font-bold">{title}</p>

      <SidebarItemIcon
        isHovered={isHovered}
        iconSrc={iconSrc}
        title={title}
      />
    </div>,
    document.body,
  );
};

export default SidebarItemPopover;
