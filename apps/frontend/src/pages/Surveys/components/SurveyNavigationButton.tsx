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
import { Action } from 'survey-core';
import { Button } from '@/components/shared/Button';
import cn from '@libs/common/utils/className';

interface SurveyNavigationButtonProps {
  item: Action;
}

const NAV_BUTTON_IDS = {
  COMPLETE: 'sv-nav-complete',
  PREVIEW: 'sv-nav-preview',
  START: 'sv-nav-start',
  NEXT: 'sv-nav-next',
  PREV: 'sv-nav-prev',
} as const;

const getButtonVariant = (id: string | undefined) => {
  switch (id) {
    case NAV_BUTTON_IDS.COMPLETE:
    case NAV_BUTTON_IDS.START:
    case NAV_BUTTON_IDS.NEXT:
      return 'btn-collaboration';
    case NAV_BUTTON_IDS.PREV:
    case NAV_BUTTON_IDS.PREVIEW:
    default:
      return 'btn-outline';
  }
};

const SurveyNavigationButton = (props: SurveyNavigationButtonProps): React.JSX.Element => {
  const { item } = props;

  const handleClick = () => {
    item.action?.();
  };

  const variant = getButtonVariant(item.id);

  return (
    <Button
      variant={variant}
      size="lg"
      disabled={item.disabled}
      onClick={handleClick}
      className={cn('survey-nav-button', item.css, !item.isVisible && 'hidden')}
    >
      {item.title}
    </Button>
  );
};

export default SurveyNavigationButton;
