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

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import cn from '@libs/common/utils/className';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
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
  const { setTemplate, setIsOpenTemplateMenu, setIsOpenTemplateConfirmDeletion, setIsTemplateActive } =
    useTemplateMenuStore();

  const [active, setActive] = useState<boolean>(template.isActive || false);

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

  const handleToggleIsActive = async () => {
    if (!template.name) return;
    await setIsTemplateActive(template.name, !active);
    setActive(!active);
  };

  const handleRemoveTemplate = () => {
    setTemplate(template);
    setIsOpenTemplateConfirmDeletion(true);
  };

  return (
    <AccordionItem
      key={template.name}
      value={template.name || ''}
    >
      <AccordionTrigger className="px-4 pt-2">
        <h4>{formula?.title}</h4>
      </AccordionTrigger>
      <AccordionContent className="my-0 px-4 py-0">
        <Textarea
          value={JSON.stringify(template.template, null, 2)}
          onChange={() => {}}
          className={cn(
            'overflow-y-auto bg-accent text-secondary transition-[max-height,opacity] duration-300 ease-in-out scrollbar-thin placeholder:text-p focus:outline-none',
            'max-h-80 overflow-visible opacity-100',
            { 'bg-accent': active },
            { 'bg-card-muted': !active },
          )}
          style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12pt' }}
          disabled
        />
        <div className="mt-2 flex flex-row justify-end space-x-2">
          {isSuperAdmin && (
            <>
              <Button
                onClick={handleRemoveTemplate}
                variant="btn-attention"
                size="sm"
              >
                {t('common.delete')}
              </Button>
              <Button
                onClick={handleToggleIsActive}
                variant="btn-collaboration"
                size="sm"
              >
                {t(active ? 'classmanagement.deactivate' : 'classmanagement.activate')}
              </Button>
            </>
          )}
          <Button
            onClick={handleLoadTemplate}
            variant="btn-collaboration"
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
