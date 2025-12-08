/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
