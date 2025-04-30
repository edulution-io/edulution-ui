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
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import YamlEditor from '@/components/shared/YamlEditor';
import { Button } from '@/components/shared/Button';
import { AccordionTrigger, AccordionItem, AccordionContent } from '@/components/ui/AccordionSH';

interface TemplateItemProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  template: Partial<SurveyDto>;
  key?: string;
}

const TemplateItem = (props: TemplateItemProps) => {
  const { form, creator, template, key } = props;
  const {
    formula,
    /* backendLimiter , */
    invitedAttendees,
    invitedGroups,
    isAnonymous,
    isPublic,
    canSubmitMultipleAnswers,
    canUpdateFormerAnswer,
  } = template;
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
      value={formula?.title || ''}
    >
      <AccordionTrigger className="flex h-[24px] justify-between px-4 text-h4">
        <p className="font-bold ">{`${formula?.title}`}</p>
        <Button
          onClick={handleLoadTemplate}
          variant="btn-collaboration"
          className="absolute right-6 m-2 h-[24px] rounded p-2"
        >
          {t('common.load')}
        </Button>
      </AccordionTrigger>
      <AccordionContent className="px-4">
        <YamlEditor
          value={JSON.stringify(template, null, 2)}
          onChange={() => {}}
          className="max-h-[500px] min-h-[200px]"
          disabled
        />
      </AccordionContent>
    </AccordionItem>
  );
};

export default TemplateItem;
