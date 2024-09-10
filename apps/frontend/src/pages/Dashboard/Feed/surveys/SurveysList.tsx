import React from 'react';
import { toast } from 'sonner';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import cn from '@/lib/utils';
import { APPS } from '@libs/appconfig/types';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveysPageView from '@libs/survey/types/api/page-view';
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

  const getSurveyInfo = (survey: SurveyDto) => {
    let surveyFormula;
    // surveyFormula = JSON.parse(JSON.stringify(survey.formula));
    if (!survey.formula.elements && !survey.formula.pages[0].elements) {
      surveyFormula = undefined;
      toast.error('not able to parse the surveys string object after stringifying it');
    }

    return (
      <div className="w-full">
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          <div className="font-semibold">{surveyFormula.title || survey.id}</div>
        }
        <div className="flex text-xs">
          {`${t('survey.created')}:`}
          <div className="ml-2">{survey.created ? format(survey.created, 'E, h:m b') : t('not-available')}</div>
        </div>
        {survey.expires ? (
          <div className="flex text-xs">
            {`${t('survey.expires')}:`}
            <div className="ml-2">{formatDistanceToNow(survey.expires, { addSuffix: true })}</div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <ScrollArea className={cn('max-h-[470px] overflow-y-auto', className)}>
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <NavLink
            to={APPS.SURVEYS}
            onClick={() => updateSurveyStores(item)}
            key={item.id.toString('base64')}
            className="w-min-[300px] flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-ciDarkGrey"
          >
            {getSurveyInfo(item)}
          </NavLink>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SurveysList;
