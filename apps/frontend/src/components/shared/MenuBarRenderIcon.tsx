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

import React, { isValidElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@edulution-io/ui-kit';
import MenuBarIcon from '@libs/menubar/menuBarIcon';
import IconWrapper from './IconWrapper';

type MenuBarRenderIconType = MenuBarIcon | React.ReactElement;

interface MenuBarRenderIconProps {
  icon: MenuBarRenderIconType;
  alt: string;
  className?: string;
  applyIconClassName?: boolean;
}

const MenuBarRenderIcon: React.FC<MenuBarRenderIconProps> = ({ icon, alt, className, applyIconClassName = true }) => {
  if (isValidElement(icon)) {
    return icon;
  }

  if (typeof icon === 'string') {
    if (!icon.trim()) {
      return null;
    }

    return (
      <IconWrapper
        iconSrc={icon}
        alt={alt}
        className={cn(className, 'object-contain')}
        applyLegacyFilter={applyIconClassName}
      />
    );
  }

  return (
    <FontAwesomeIcon
      icon={icon as IconDefinition}
      className={cn(className, 'scale-75', applyIconClassName ? 'text-background dark:text-white' : 'text-white')}
    />
  );
};

export default MenuBarRenderIcon;
