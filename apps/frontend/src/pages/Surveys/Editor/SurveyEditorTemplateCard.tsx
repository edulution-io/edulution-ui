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
import cn from '@libs/common/utils/className';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import { Card } from '@/components/shared/Card';
import { IconType } from 'react-icons';

interface SurveyEditorTemplateCardProps {
  icon: IconType;
  title?: string;
  description?: string;
  onClick?: () => void;
}

const SurveyEditorTemplateCard = ({
  icon: Icon,
  title,
  description,
  onClick,
}: SurveyEditorTemplateCardProps): JSX.Element => (
  <Card
    className={cn(GRID_CARD, 'cursor-pointer bg-muted', 'h-[13rem]', 'flex', { 'pt-8': !description })}
    variant="text"
    onClick={onClick}
  >
    <Icon className="h-10 w-10 md:h-14 md:w-14" />

    {title && <h3 className={cn('line-clamp-2 h-[3.8rem] justify-center', { 'mt-4': !description })}>{title}</h3>}

    {description && <p className="line-clamp-2 h-[2.8rem] w-full">{description}</p>}
  </Card>
);

export default SurveyEditorTemplateCard;
