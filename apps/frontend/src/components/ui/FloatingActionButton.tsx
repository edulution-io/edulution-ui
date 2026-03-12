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

import React from 'react';
import { Button, cn } from '@edulution-io/ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import DropdownMenu from '@/components/shared/DropdownMenu';
import type FloatingButtonConfig from '@libs/ui/types/FloatingButtons/floatingButtonConfig';
import { FLOATING_BUTTON_CLASS_NAME } from '@libs/ui/constants/floatingButtonsConfig';
import useFontAwesomeHoverAnimation from '@/hooks/useFontAwesomeHoverAnimation';

const FloatingActionButton: React.FC<FloatingButtonConfig> = ({
  icon,
  text,
  onClick,
  type = 'button',
  variant = 'button',
  dropdownItems = [],
  dropdownAlign,
  dropdownSide,
  onDropdownClose,
}) => {
  const { t } = useTranslation();
  const { animate, triggerAnimation } = useFontAwesomeHoverAnimation();

  const renderIcon = () => (
    <FontAwesomeIcon
      icon={icon}
      className="m-5 h-5 w-5"
      bounce={animate}
    />
  );

  const renderContent = () => {
    if (variant === 'dropdown' && dropdownItems.length > 0) {
      return (
        <DropdownMenu
          trigger={
            <Button
              type="button"
              variant="btn-hexagon"
              hexagonIconAltText={t('common.showOptions')}
              onMouseEnter={triggerAnimation}
            >
              {renderIcon()}
            </Button>
          }
          items={dropdownItems}
          align={dropdownAlign}
          side={dropdownSide}
          onOpenChange={(open) => {
            if (!open) onDropdownClose?.();
          }}
        />
      );
    }

    return (
      <Button
        type={type}
        variant="btn-hexagon"
        onClick={onClick}
        hexagonIconAltText={text}
        onMouseEnter={triggerAnimation}
      >
        {renderIcon()}
      </Button>
    );
  };

  return (
    <div className="group relative mt-1 flex flex-col items-center justify-center">
      {renderContent()}
      <span className={cn(FLOATING_BUTTON_CLASS_NAME, 'group-hover:invisible')}>{text}</span>
      <span className="invisible absolute bottom-[-1px] left-1/2 z-10 w-max -translate-x-1/2 whitespace-nowrap rounded-sm bg-foreground px-1.5 py-px text-center text-background group-hover:visible">
        {text}
      </span>
    </div>
  );
};

export default FloatingActionButton;
