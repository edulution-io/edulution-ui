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
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import TemplateItem from '@/pages/Surveys/Editor/dialog/TemplateItem';
import { AccordionSH } from '@/components/ui/AccordionSH';

interface TemplateListProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  templates: SurveyTemplateDto[];
}

const TemplateList = (props: TemplateListProps) => {
  const { form, creator, templates } = props;

  return (
    <AccordionSH
      type="multiple"
      className="px-4"
    >
      {templates.map((template: SurveyTemplateDto) => (
        <TemplateItem
          key={template.name}
          form={form}
          creator={creator}
          template={template}
        />
      ))}
    </AccordionSH>
  );
};

export default TemplateList;
