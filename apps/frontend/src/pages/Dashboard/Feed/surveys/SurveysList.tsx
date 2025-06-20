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
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import UserLanguage from '@libs/user/constants/userLanguage';
import APPS from '@libs/appconfig/constants/apps';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import cn from '@libs/common/utils/className';
import useUserStore from '@/store/UserStore/UserStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FallbackText from '@/components/shared/FallbackText';

interface SurveysListProps {
  items: SurveyDto[];
  className?: string;
}

const SurveysList = (props: SurveysListProps) => {
  const { items, className } = props;
  const { user } = useUserStore();
  const { t } = useTranslation();

  const { selectSurvey } = useSurveyTablesPageStore();

  const locale = getLocaleDateFormat(user?.language === UserLanguage.SYSTEM ? navigator.language : user?.language);

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
