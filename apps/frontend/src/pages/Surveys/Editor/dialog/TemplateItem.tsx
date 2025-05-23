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
import cn from '@libs/common/utils/className';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyTemplateDto from '@libs/survey/types/api/template.dto';
import useLdapGroups from '@/hooks/useLdapGroups';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import { Button } from '@/components/shared/Button';
import { Textarea } from '@/components/ui/Textarea';
import { AccordionTrigger, AccordionItem, AccordionContent } from '@/components/ui/AccordionSH';

interface TemplateItemProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  template: SurveyTemplateDto;
}

const TemplateItem = (props: TemplateItemProps) => {
  const { form, creator, template } = props;
  const {
    formula,
    /* backendLimiter , */
    invitedAttendees,
    invitedGroups,
    isAnonymous,
    isPublic,
    canSubmitMultipleAnswers,
    canUpdateFormerAnswer,
  } = template.template;
  const { setTemplate, setIsOpenTemplateMenu, deleteTemplate, fetchTemplates } = useTemplateMenuStore();

  const { isSuperAdmin } = useLdapGroups();

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

    setTemplate(template);
    setIsOpenTemplateMenu(false);
  };

  const handleRemoveTemplate = async () => {
    await deleteTemplate(template.fileName || '');
    await fetchTemplates();
  };

  return (
    <AccordionItem
      key={template.fileName}
      value={formula?.title || ''}
    >
      <AccordionTrigger className="px-4 py-2 text-h4">
        <p className="font-bold ">{`${formula?.title}`}</p>
      </AccordionTrigger>
      <AccordionContent className="mt-0 px-4 pt-0">
        <Textarea
          value={JSON.stringify(template.template, null, 2)}
          onChange={() => {}}
          className={cn(
            'overflow-y-auto bg-accent text-secondary transition-[max-height,opacity] duration-300 ease-in-out scrollbar-thin placeholder:text-p focus:outline-none',
            'max-h-80 overflow-visible opacity-100',
          )}
          style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12pt' }}
          disabled
        />
        <div className="flex flex-row justify-end">
          {isSuperAdmin && (
            <Button
              onClick={handleRemoveTemplate}
              variant="btn-collaboration"
              className="m-2 h-[24px] bg-destructive"
              size="sm"
            >
              {t('common.delete')}
            </Button>
          )}
          <Button
            onClick={handleLoadTemplate}
            variant="btn-collaboration"
            className="m-2 h-[24px]"
            size="sm"
          >
            {t('common.load')}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TemplateItem;
