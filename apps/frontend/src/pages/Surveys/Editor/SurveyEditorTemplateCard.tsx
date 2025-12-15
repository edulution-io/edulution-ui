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
import { EyeLightIcon } from '@/assets/icons';
import i18n from '@/i18n';
import cn from '@libs/common/utils/className';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useSurveyTemplateStore from '@/pages/Surveys/Editor/dialog/useSurveyTemplateStore';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';

interface SurveyEditorTemplateCardProps {
  creator: AttendeeDto;
  surveyTemplate: SurveyTemplateDto;
}

const SurveyEditorTemplateCard = ({ creator, surveyTemplate }: SurveyEditorTemplateCardProps): JSX.Element => {
  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const {
    setTemplate,
    setIsOpenTemplateConfirmDeletion,
    setIsTemplateActive,
    setIsOpenTemplatePreview,
    fetchTemplates,
  } = useSurveyTemplateStore();

  const { isSuperAdmin } = useLdapGroups();

  const [active, setActive] = useState<boolean>(surveyTemplate.isActive ?? true);

  const toggleIsTemplateActive = async () => {
    if (!surveyTemplate.id) return;
    try {
      await setIsTemplateActive(surveyTemplate.id, !active);
      setActive(!active);
    } catch (error) {
      toast.error(i18n.t('survey.errors.updateOrCreateError'));
      await fetchTemplates();
    }
  };

  return (
    <Card
      className={cn(
        GRID_CARD,
        { 'bg-muted': active },
        { 'bg-accent': !active },
        { 'h-[13rem]': !isSuperAdmin },
        { 'h-[14.2rem] pb-12': isSuperAdmin },
      )}
      variant="text"
      onClick={() => {
        setTemplate(surveyTemplate);
        assignTemplateToSelectedSurvey(creator, surveyTemplate);
      }}
    >
      <Button
        variant="btn-outline"
        onClick={(e) => {
          e.stopPropagation();
          setTemplate(surveyTemplate);
          setIsOpenTemplatePreview(true);
        }}
        className="h-14 w-14 p-2"
        aria-label={i18n.t('survey.editor.template.preview')}
      >
        <img
          src={EyeLightIcon}
          alt="eye"
          width="w-12"
        />
      </Button>
      <h3
        className="line-clamp-2 h-[3.8rem] w-full"
        aria-label={`Template title: ${surveyTemplate.template.formula?.title}`}
      >
        {surveyTemplate.template.formula?.title}
      </h3>
      <p className="line-clamp-2 h-[2.8rem] w-full">{surveyTemplate.template.formula?.description}</p>
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
            {active ? i18n.t('classmanagement.deactivate') : i18n.t('classmanagement.activate')}
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
              aria-label={i18n.t('common.delete')}
            >
              <DeleteIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default SurveyEditorTemplateCard;
