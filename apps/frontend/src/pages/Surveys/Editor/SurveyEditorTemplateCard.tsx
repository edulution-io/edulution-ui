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
import { faFileCirclePlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from '@libs/common/utils/className';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useLdapGroups from '@/hooks/useLdapGroups';
import useThemeStore from '@/store/useThemeStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useSurveyTemplateStore from '@/pages/Surveys/Editor/dialog/useSurveyTemplateStore';
import getSurveysDefaultValues from '@/pages/Surveys/utils/getSurveysDefaultValues';
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
    setSelectedTemplate,
  } = useSurveyTemplateStore();

  const { loadNewSurvey, loadSurveyTemplate } = useSurveyEditorPageStore();

  const { isSuperAdmin } = useLdapGroups();

  const { theme } = useThemeStore();

  const { t } = useTranslation();

  const [active, setActive] = useState<boolean>(surveyTemplate?.isActive ?? true);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTemplate(surveyTemplate);
    if (surveyTemplate) {
      loadSurveyTemplate(creator, surveyTemplate);
    } else {
      loadNewSurvey(creator);
    }
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTemplate(surveyTemplate);
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
    setSelectedTemplate(surveyTemplate);
    setIsOpenTemplateConfirmDeletion(true);
  };

  const defaultValues = getSurveysDefaultValues(theme);

  const title = surveyTemplate?.name ?? surveyTemplate?.template.formula.title ?? defaultValues.formula.title;

  const description = surveyTemplate?.template.formula.description;

  return (
    <Card
      className={cn(
        GRID_CARD,
        'relative flex h-36 cursor-pointer p-4',
        { 'opacity-50': !active },
        {
          'w-[calc(100%-2rem)] min-w-[calc(100%-2rem)] max-w-[24rem] sm:min-w-[14rem] md:min-w-[18rem]': isSuperAdmin,
        },
      )}
      variant="text"
      onClick={handleCardClick}
    >
      {!surveyTemplate && (
        <FontAwesomeIcon
          icon={faFileCirclePlus}
          className="my-2 h-12 w-12 md:h-14 md:w-14"
        />
      )}

      {title && (
        <h3 className={cn('line-clamp-2 w-full truncate', { 'flex justify-center': !surveyTemplate })}>{title}</h3>
      )}

      {description && <p className="line-clamp-2 w-full text-sm">{description}</p>}

      {surveyTemplate && (
        <div className="w-inherit absolute bottom-0 right-0 m-4 flex flex-row justify-end gap-2 text-sm italic">
          {isSuperAdmin && (
            <Button
              onClick={toggleIsTemplateActive}
              variant="btn-outline"
              size="sm"
            >
              {active ? t('classmanagement.deactivate') : t('classmanagement.activate')}
            </Button>
          )}
          <Button
            className="rounded-full border-none px-1 py-2"
            onClick={handleOpenPreview}
            variant="btn-outline"
            size="sm"
            aria-label={t('common.preview')}
          >
            <FontAwesomeIcon
              icon={faEye}
              className="h-6 w-6"
            />
          </Button>
          {isSuperAdmin && !surveyTemplate?.isDefaultTemplate && (
            <Button
              className="rounded-full border-none px-1 py-2"
              onClick={handleOpenConfirmDeletion}
              variant="btn-outline"
              size="sm"
              aria-label={t('common.delete')}
            >
              <FontAwesomeIcon
                icon={DeleteIcon}
                className="h-5 w-5"
              />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default SurveyEditorTemplateCard;
