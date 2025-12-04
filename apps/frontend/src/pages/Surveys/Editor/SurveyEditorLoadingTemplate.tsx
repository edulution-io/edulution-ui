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
import { MdOutlineOpenInNew } from 'react-icons/md';
import cn from '@libs/common/utils/className';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import { Card } from '@/components/shared/Card';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';

interface SurveyEditorLoadingTemplateProps {
  creator: AttendeeDto;
  surveyTemplate: SurveyTemplateDto;
}

const SurveyEditorLoadingTemplate = ({ creator, surveyTemplate }: SurveyEditorLoadingTemplateProps): JSX.Element => {
  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const { template } = surveyTemplate;
  const { formula } = template;
  const { title, description } = formula;

  return (
    <Card
      className={cn(GRID_CARD, 'bg-muted')}
      variant="text"
      onClick={() => assignTemplateToSelectedSurvey(creator, surveyTemplate)}
    >
      <MdOutlineOpenInNew className="h-10 w-10 md:h-14 md:w-14" />

      <p>{title}</p>

      <p>{description}</p>
    </Card>
  );
};

export default SurveyEditorLoadingTemplate;
