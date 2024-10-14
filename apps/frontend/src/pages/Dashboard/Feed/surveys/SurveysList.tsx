import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import APPS from '@libs/appconfig/constants/apps';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveysPageView from '@libs/survey/types/api/page-view';
import SurveyFormulaDto from '@libs/survey/types/survey-formula.dto';
import cn from '@/lib/utils';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface SurveysListProps {
  items: SurveyDto[];
  className?: string;
}

const SurveysList = (props: SurveysListProps) => {
  const { items, className } = props;
  const { t } = useTranslation();

  const { selectSurvey, updateSelectedPageView } = useSurveyTablesPageStore();
  const { setIsOpenParticipateSurveyDialog } = useParticipateDialogStore();

  const updateSurveyStores = (survey: SurveyDto) => {
    updateSelectedPageView(SurveysPageView.OPEN);
    selectSurvey(survey);
    setIsOpenParticipateSurveyDialog(true);
  };

  const locale = getLocaleDateFormat();

  const getSurveyInfo = (survey: SurveyDto) => {
    const surveyFormula = JSON.parse(JSON.stringify(survey.formula || {})) as SurveyFormulaDto;

    return (
      <div className="flex w-full flex-col gap-1">
        <span className="text-sm font-semibold">{surveyFormula?.title || survey.id.toString('hex')}</span>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {`${t('survey.created')}:  `}
          {survey.created ? format(survey.created, 'dd.MMMLL', { locale }) : t('not-available')}
        </p>
        {survey.expires ? (
          <p className="text-muted-background line-clamp-2 text-sm">
            {`${t('survey.expires')}:  `}
            {formatDistanceToNow(survey.expires, { addSuffix: true, locale })}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto scrollbar-thin', className)}>
      <div className="flex flex-col gap-2 py-2 pt-0">
        {items.map((item) => (
          <NavLink
            to={APPS.SURVEYS}
            onClick={() => updateSurveyStores(item)}
            key={item.id.toString('base64')}
            className="w-min-[300px] flex flex-col items-start gap-2 rounded-lg border p-2 text-left transition-all hover:bg-ciDarkGrey"
          >
            {getSurveyInfo(item)}
          </NavLink>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SurveysList;
