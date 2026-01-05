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

import { toast } from 'sonner';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VscNewFile } from 'react-icons/vsc';
import cn from '@libs/common/utils/className';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { EyeLightIcon } from '@/assets/icons';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useSurveyTemplateStore from '@/pages/Surveys/Editor/dialog/useSurveyTemplateStore';
import surveysDefaultValues from '@/pages/Surveys/utils/surveys-default-values';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

interface SurveyEditorTemplateCardProps {
  creator: AttendeeDto;
  surveyTemplate?: SurveyTemplateDto;
}

const SurveyEditorTemplateCard = ({ creator, surveyTemplate }: SurveyEditorTemplateCardProps): JSX.Element => {
  const {
    setIsOpenTemplateConfirmDeletion,
    setIsOpenTemplatePreview,
    setIsTemplateActive,
    fetchTemplates,
    setTemplate,
  } = useSurveyTemplateStore();

  const { loadNewSurvey, loadSurveyTemplate } = useSurveyEditorPageStore();

  const { isSuperAdmin } = useLdapGroups();

  const { t } = useTranslation();

  const [active, setActive] = useState<boolean>(surveyTemplate?.isActive ?? true);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplate(surveyTemplate);
    if (surveyTemplate) {
      loadSurveyTemplate(creator, surveyTemplate);
    } else {
      loadNewSurvey(creator);
    }
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplate(surveyTemplate);
    setIsOpenTemplatePreview(true);
  };

  const toggleIsTemplateActive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!surveyTemplate?.id) return;
    try {
      await setIsTemplateActive(surveyTemplate.id, !active);
      setActive(!active);
    } catch (error) {
      toast.error(t('survey.errors.updateOrCreateError'));
      await fetchTemplates();
    }
  };

  const handleOpenConfirmDeletion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplate(surveyTemplate);
    setIsOpenTemplateConfirmDeletion(true);
  };

  const title = surveyTemplate?.name ?? surveyTemplate?.template.formula.title ?? surveysDefaultValues.formula.title;

  const description = surveyTemplate?.template.formula.description;

  return (
    <Card
      className={cn(
        GRID_CARD,
        'relative flex h-36 cursor-pointer pt-2',
        { 'bg-muted text-white': !active },
        { 'pt-8': !description },
        { 'min-w-[14rem] md:min-w-[16rem]': isSuperAdmin },
      )}
      variant="text"
      onClick={handleCardClick}
    >
      {!surveyTemplate && <VscNewFile className="h-12 w-12 md:h-14 md:w-14" />}

      {title && (
        <h3
          className={cn(
            'mt-1 line-clamp-2 w-full truncate px-4',
            { 'mt-4': !description },
            { 'mt-2 flex justify-center': !surveyTemplate },
          )}
        >
          {' '}
          {title}
        </h3>
      )}

      {description && <p className="mt-2 line-clamp-2 w-full px-4">{description}</p>}

      {surveyTemplate && (
        <div className="absolute bottom-2 flex h-8 w-full flex-row justify-end gap-2 px-2 text-sm italic">
          {isSuperAdmin && (
            <Button
              className="cursor-pointer"
              onClick={toggleIsTemplateActive}
              variant="btn-outline"
              size="sm"
            >
              {active ? t('classmanagement.deactivate') : t('classmanagement.activate')}
            </Button>
          )}
          {surveyTemplate && (
            <Button
              className="m-0 cursor-pointer"
              onClick={handleOpenPreview}
              variant="btn-attention"
              size="sm"
              aria-label={t('common.delete')}
            >
              <img
                src={EyeLightIcon}
                alt={title}
                className="h-5 w-5"
              />
            </Button>
          )}
          {isSuperAdmin && !surveyTemplate?.isDefaultTemplate && (
            <Button
              className="cursor-pointer"
              onClick={handleOpenConfirmDeletion}
              variant="btn-attention"
              size="sm"
              aria-label={t('common.delete')}
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
