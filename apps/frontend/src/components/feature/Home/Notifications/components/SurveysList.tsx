import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import cn from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';

interface SurveysListProps {
  items: Survey[];
  className?: string;
}

export function SurveysList({ items, className }: SurveysListProps) {

  const { t } = useTranslation();

  const getSurveyInfo = (survey: Survey) => {

    let surveyObj;
    try {
      surveyObj = JSON.parse(survey.survey);
      if (!surveyObj.elements && !surveyObj.pages[0].elements) {
        surveyObj = undefined;
        console.log('not able to parse the surveys string object')
        throw new Error('not able to parse the surveys string object');
      }
    } catch (e) {
      surveyObj = JSON.parse(JSON.stringify(survey.survey));
      if (!surveyObj.elements && !surveyObj.pages[0].elements) {
        surveyObj = undefined;
        console.log('not able to parse the surveys string object after stringifying it')
      }
    }

    console.log('survey.expires: ', survey.expires);

    return (
      <>
        <div className="flex w-full flex-col gap-1">
          <div className="items-center">
            <div className="flex gap-2">
              <div className="font-semibold">{surveyObj.title || survey.surveyname}</div>
            </div>
            <div className="text-xs flex flex-row justify-between">
              {t('survey.creationDate')}
              {':'}
              <div className="text-xs flex flex-row justify-end">
                {survey.created ? format(survey.created, "E, h:m b") : t('not-available')}
              </div>
            </div>
            {survey.expires ? (
              <div className="text-xs flex flex-row justify-between">
                {t('survey.expirationDate')}
                {':'}
                <div className="text-xs flex flex-row justify-end">
                  {formatDistanceToNow(survey.expires!, {addSuffix: true})}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  }

  return (
    <ScrollArea
      className={cn(
        'max-h-[470px] overflow-y-scroll',
        className,
      )}
    >
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.surveyname}
            className={cn(
                'w-min-[300px] flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
              )}
            >
              {getSurveyInfo(item)}
            </button>
          ))}
      </div>
    </ScrollArea>
  );
}

export default SurveysList;
