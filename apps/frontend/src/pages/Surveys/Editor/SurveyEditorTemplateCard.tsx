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
import { useTranslation } from 'react-i18next';
import { VscNewFile } from 'react-icons/vsc';
import { MdOutlineOpenInNew } from 'react-icons/md';
import cn from '@libs/common/utils/className';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useLdapGroups from '@/hooks/useLdapGroups';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

interface SurveyEditorTemplateCardProps {
  creator: AttendeeDto;
  surveyTemplate?: SurveyTemplateDto;
}

const SurveyEditorTemplateCard = ({ creator, surveyTemplate }: SurveyEditorTemplateCardProps): JSX.Element => {
  const { setIsOpenTemplateConfirmDeletion, setIsTemplateActive, fetchTemplates, setTemplate } = useTemplateMenuStore();

  const { loadNew, loadTemplate } = useSurveyEditorPageStore();

  const { isSuperAdmin } = useLdapGroups();

  const { t } = useTranslation();

  const [active, setActive] = useState<boolean>(surveyTemplate?.isActive ?? true);

  const toggleIsTemplateActive = async () => {
    if (!surveyTemplate?.id) return;
    try {
      await setIsTemplateActive(surveyTemplate.id, !active);
      setActive(!active);
    } catch (error) {
      toast.error(t('survey.errors.updateOrCreateError'));
      await fetchTemplates();
    }
  };

  const Icon = surveyTemplate ? MdOutlineOpenInNew : VscNewFile;

  const title = surveyTemplate?.template.formula.title ?? t('survey.editor.new');

  const description = surveyTemplate?.template.formula.description;

  const handleClick = () => {
    setTemplate(surveyTemplate);
    if (surveyTemplate) {
      loadTemplate(creator, surveyTemplate);
    } else {
      loadNew(creator);
    }
  };

  return (
    <Card
      className={cn(
        GRID_CARD,
        'flex cursor-pointer',
        { 'bg-muted': active },
        { 'bg-accent': !active },
        { 'h-[13rem]': !isSuperAdmin },
        { 'h-[14rem] pb-12': isSuperAdmin },
        { 'pt-8': !description },
      )}
      variant="text"
      onClick={handleClick}
    >
      <Icon className="h-10 w-10 md:h-14 md:w-14" />

      {title && <h3 className={cn('line-clamp-2 h-[3.8rem] justify-center', { 'mt-4': !description })}>{title}</h3>}

      {description && <p className="line-clamp-2 h-[2.8rem] w-full">{description}</p>}

      {isSuperAdmin && surveyTemplate && (
        <div className="absolute bottom-2 flex h-8 w-full flex-row justify-end gap-2 px-2 text-sm italic text-muted-foreground">
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              await toggleIsTemplateActive();
            }}
            variant="btn-outline"
            size="sm"
          >
            {active ? t('classmanagement.deactivate') : t('classmanagement.activate')}
          </Button>
          {!surveyTemplate?.isDefaultTemplate && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setTemplate(surveyTemplate);
                setIsOpenTemplateConfirmDeletion(true);
              }}
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
