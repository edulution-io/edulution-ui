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
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from '@libs/common/utils/className';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import { Card } from '@/components/shared/Card';

interface SurveyEditorTemplateCardProps {
  icon: IconProp;
  title?: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const SurveyEditorTemplateCard = ({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: SurveyEditorTemplateCardProps): JSX.Element => (
  <Card
    className={cn(GRID_CARD, 'min-h-[11rem]', { 'opacity-50': disabled })}
    variant="text"
    onClick={onClick}
  >
    <div className="relative m-4 flex flex-col items-center">
      <FontAwesomeIcon
        icon={icon}
        className="h-12 w-12 md:h-14 md:w-14"
      />
      <p className="line-clamp-2">{title}</p>
      {description && <p className="line-clamp-2">{description}</p>}
    </div>
  </Card>
);

export default SurveyEditorTemplateCard;
