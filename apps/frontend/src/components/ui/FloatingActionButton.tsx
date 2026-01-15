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
import { Button } from '@/components/shared/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import DropdownMenu from '@/components/shared/DropdownMenu';
import type FloatingButtonConfig from '@libs/ui/types/FloatingButtons/floatingButtonConfig';
import { FLOATING_BUTTON_CLASS_NAME } from '@libs/ui/constants/floatingButtonsConfig';

const FloatingActionButton: React.FC<FloatingButtonConfig> = ({
  icon,
  text,
  onClick,
  type = 'button',
  variant = 'button',
  dropdownItems = [],
}) => {
  const { t } = useTranslation();

  const renderContent = () => {
    if (variant === 'dropdown' && dropdownItems.length > 0) {
      return (
        <DropdownMenu
          trigger={
            <Button
              type="button"
              variant="btn-hexagon"
              hexagonIconAltText={t('common.showOptions')}
            >
              <FontAwesomeIcon
                icon={icon}
                className="m-5 h-5 w-5"
              />
            </Button>
          }
          items={dropdownItems}
        />
      );
    }

    return (
      <Button
        type={type}
        variant="btn-hexagon"
        onClick={onClick}
        hexagonIconAltText={text}
      >
        <FontAwesomeIcon
          icon={icon}
          className="m-5 h-5 w-5"
        />
      </Button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center pr-1 md:pt-1">
      {renderContent()}
      <span className={FLOATING_BUTTON_CLASS_NAME}>{text}</span>
    </div>
  );
};

export default FloatingActionButton;
