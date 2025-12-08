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
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import APPS from '@libs/appconfig/constants/apps';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import cn from '@libs/common/utils/className';
import useLanguage from '@/hooks/useLanguage';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FallbackText from '@/components/shared/FallbackText';

interface SurveysListProps {
  items: SurveyDto[];
  className?: string;
}

const SurveysList = (props: SurveysListProps) => {
  const { items, className } = props;
  const { language } = useLanguage();
  const { t } = useTranslation();

  const { selectSurvey } = useSurveysTablesPageStore();

  const locale = getLocaleDateFormat(language);

  const getSurveyInfo = (survey: SurveyDto) => (
    <div className="flex w-full flex-col gap-1">
      <span className="text-sm font-semibold">{survey.formula.title || FallbackText}</span>
      <p className="line-clamp-2 text-sm text-muted-foreground">
        {`${t('survey.created')}:  `}
        {survey.createdAt ? format(survey.createdAt, 'dd. MMMM', { locale }) : FallbackText}
      </p>
      {survey.expires ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {`${t('survey.expires')}:  `}
          {formatDistanceToNow(survey.expires, { addSuffix: true, locale })}
        </p>
      ) : null}
    </div>
  );

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto scrollbar-thin', className)}>
      <div className="flex flex-col gap-2 py-2 pt-0">
        {items.map((item) => (
          <NavLink
            to={APPS.SURVEYS}
            onClick={() => selectSurvey(item)}
            key={item.id}
            className="w-min-[300px] flex flex-col items-start gap-2 rounded-lg border border-muted-foreground p-2 text-left transition-all hover:bg-ciDarkGrey"
          >
            {getSurveyInfo(item)}
          </NavLink>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SurveysList;
