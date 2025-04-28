/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import TemplateDto from '@libs/survey/types/api/template.dto';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import YamlEditor from '@/components/shared/YamlEditor';
import { Button } from '@/components/shared/Button';
import { AccordionTrigger, AccordionItem, AccordionContent } from '@/components/ui/AccordionSH';

interface TemplateProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  template: TemplateDto;
  key?: string;
}

const Template = (props: TemplateProps) => {
  const { form, creator, template, key } = props;
  const { fileName, surveyDto } = template;
  const {
    formula,
    /* backendLimiter , */
    invitedAttendees,
    invitedGroups,
    isAnonymous,
    isPublic,
    canSubmitMultipleAnswers,
    canUpdateFormerAnswer,
  } = surveyDto;
  const { setIsOpenTemplateMenu } = useTemplateMenuStore();

  const { t } = useTranslation();

  const handleLoadTemplate = () => {
    // form.setValue('backendLimiter', backendLimiter);
    form.setValue('invitedAttendees', invitedAttendees || []);
    form.setValue('invitedGroups', invitedGroups || []);
    form.setValue('isAnonymous', isAnonymous);
    form.setValue('isPublic', isPublic);
    form.setValue('canSubmitMultipleAnswers', canSubmitMultipleAnswers);
    form.setValue('canUpdateFormerAnswer', canUpdateFormerAnswer);

    if (formula) {
      form.setValue('formula', formula);
      creator.JSON = formula;
    }

    setIsOpenTemplateMenu(false);
  };

  return (
    <AccordionItem
      key={key}
      value={fileName}
    >
      <AccordionTrigger className="flex text-h4">
        <p className="font-bold">{`${fileName} (${t('common.title')}: ${formula?.title})`}</p>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 px-1">
        <YamlEditor
          value={JSON.stringify(surveyDto, null, 2)}
          onChange={() => {}}
          disabled
          className="max-h-[500px] min-h-[200px] w-full"
        />
        <Button
          className="absolute right-6 my-0 h-[32px] py-0"
          onClick={handleLoadTemplate}
          variant="btn-collaboration"
        >
          {t('common.load')}
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
};

export default Template;
