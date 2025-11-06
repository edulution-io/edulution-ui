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
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';

const DesktopButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const { config } = props;
  const { buttons, keyPrefix } = config;

  const floatingButtons = buttons.map((conf) => {
    const { icon, text, onClick, isVisible = true, variant = 'button', dropdownItems = undefined } = conf;
    return isVisible ? (
      <div key={`${keyPrefix}${text}`}>
        <FloatingActionButton
          variant={variant}
          icon={icon}
          text={text}
          onClick={onClick}
          dropdownItems={dropdownItems}
        />
      </div>
    ) : null;
  });
  return (
    <div className="flex flex-grow-0 flex-wrap justify-start overflow-y-auto pt-1 text-background">
      {floatingButtons}
    </div>
  );
};

export default DesktopButtonsBar;
