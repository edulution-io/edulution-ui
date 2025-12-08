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
import { toast } from 'sonner';
import { MdOutlineOpenInNew } from 'react-icons/md';
import i18n from '@/i18n';
import cn from '@libs/common/utils/className';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';

interface SurveyEditorLoadingTemplateProps {
  creator: AttendeeDto;
  surveyTemplate: SurveyTemplateDto;
}

const SurveyEditorLoadingTemplate = ({ creator, surveyTemplate }: SurveyEditorLoadingTemplateProps): JSX.Element => {
  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const { setTemplate, setIsOpenTemplateConfirmDeletion, setIsTemplateActive, fetchTemplates } = useTemplateMenuStore();

  const { isSuperAdmin } = useLdapGroups();

  const { template, isActive = true } = surveyTemplate;
  const { formula } = template;
  const { title, description } = formula;

  const [active, setActive] = useState<boolean>(isActive);

  const toggleIsTemplateActive = async () => {
    if (!surveyTemplate.name) return;
    try {
      await setIsTemplateActive(surveyTemplate.name, !active);
      setActive(!active);
    } catch (error) {
      toast.error(i18n.t('survey.errors.updateOrCreateError'));
    }
    await fetchTemplates();
  };

  return (
    <Card
      className={cn(
        GRID_CARD,
        { 'bg-muted': active },
        { 'bg-accent': !active },
        { 'h-[13rem]': !isSuperAdmin },
        { 'h-[14rem] pb-12': isSuperAdmin },
        'flex',
      )}
      variant="text"
      onClick={() => {
        setTemplate(surveyTemplate);
        assignTemplateToSelectedSurvey(creator, surveyTemplate);
      }}
    >
      <MdOutlineOpenInNew className="h-10 w-10 md:h-14 md:w-14" />

      <h3 className="line-clamp-2 h-[3.8rem] w-full">{title}</h3>

      <p className="line-clamp-2 h-[2.8rem] w-full">{description}</p>

      {isSuperAdmin && (
        <div className="absolute bottom-2 flex h-8 w-full flex-row justify-end gap-2 px-2 text-sm italic text-muted-foreground">
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              await toggleIsTemplateActive();
            }}
            variant="btn-outline"
            size="sm"
          >
            {i18n.t(active ? 'classmanagement.deactivate' : 'classmanagement.activate')}
          </Button>
          {!surveyTemplate.isDefaultTemplate && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setTemplate(surveyTemplate);
                setIsOpenTemplateConfirmDeletion(true);
              }}
              variant="btn-attention"
              size="sm"
            >
              <DeleteIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default SurveyEditorLoadingTemplate;
