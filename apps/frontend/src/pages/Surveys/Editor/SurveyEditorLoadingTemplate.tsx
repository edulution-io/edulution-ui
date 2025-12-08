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
import { HiTrash } from 'react-icons/hi';
import cn from '@libs/common/utils/className';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import useLdapGroups from '@/hooks/useLdapGroups';
import { EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

interface SurveyEditorLoadingTemplateProps {
  creator: AttendeeDto;
  surveyTemplate: SurveyTemplateDto;
}

const SurveyEditorLoadingTemplate = ({ creator, surveyTemplate }: SurveyEditorLoadingTemplateProps): JSX.Element => {
  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const {
    setTemplate,
    setIsOpenTemplateConfirmDeletion,
    // TODO: activate toggleIsTemplateActive after #1178 was merged
    // toggleIsTemplateActive,
    fetchTemplates,
  } = useTemplateMenuStore();

  const { isSuperAdmin } = useLdapGroups();

  const { template, isActive = true } = surveyTemplate;
  const { formula } = template;
  const { title, description } = formula;

  return (
    <Card
      className={cn(GRID_CARD, { 'bg-accent': isActive }, { 'bg-card': !isActive }, { 'h-[13rem]': !isSuperAdmin }, { 'pb-12 h-[15rem]': isSuperAdmin }, 'flex')}
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
        <>
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              if (!surveyTemplate.name) return;
              // await toggleIsTemplateActive(surveyTemplate.name);
              await fetchTemplates();
            }}
            variant="btn-outline"
            size="sm"
            className="absolute bottom-2 right-14 h-8 w-10 p-2"
          >
            <img
              src={isActive ? EyeLightIcon : EyeLightSlashIcon}
              alt="eye"
              className="h-6 min-h-6 w-6 min-w-6"
            />
          </Button>
          {/* !template.isDefaultTemplate && */ ( 
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setTemplate(surveyTemplate);
                setIsOpenTemplateConfirmDeletion(true);
              }}
              variant="btn-attention"
              size="sm"
              className="absolute bottom-2 right-2 p-2"
            >
              <HiTrash className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </Card>
  );
};

export default SurveyEditorLoadingTemplate;
