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

import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Model } from 'survey-core';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useLanguage from '@/hooks/useLanguage';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import surveyTheme from '@/pages/Surveys/theme/theme';
import cn from '@libs/common/utils/className';
import { Survey } from 'survey-react-ui';

interface SurveyParticipationPageProps {
  isPublic: boolean;
}

const SurveyParticipationPage = (props: SurveyParticipationPageProps): React.ReactNode => {
  const { isPublic = false } = props;
  const { selectedSurvey, updateSelectedSurvey, isFetching, updateOpenSurveys, updateAnsweredSurveys } =
    useSurveyTablesPageStore();
  const { answerSurvey, reset } = useParticipateSurveyStore();

  const { language } = useLanguage();
  const { t } = useTranslation();

  const { surveyId } = useParams();

  useEffect(() => {
    reset();
    void updateSelectedSurvey(surveyId, isPublic);
  }, [surveyId]);

  const surveyModelRef = useRef<Model | null>(null);
  if (!surveyModelRef.current) {
    if (!selectedSurvey) {
      return null;
    }
    const surveyParticipationModel = new Model();
    surveyParticipationModel.applyTheme(surveyTheme);
    surveyParticipationModel.locale = language;
    if (surveyParticipationModel.pages.length > 3) {
      surveyParticipationModel.showProgressBar = 'top';
    }
  }
  const surveyModel = surveyModelRef.current;

  useEffect(() => {
    if (surveyModel && selectedSurvey) {
      surveyModel.fromJSON(selectedSurvey.formula);
      surveyModel.locale = language;

      surveyModel.onCompleting.add(async (sender, options) => {
        const success = await answerSurvey(
          {
            surveyId: selectedSurvey.id || surveyId || '',
            saveNo: selectedSurvey.saveNo,
            answer: surveyModel.getData() as JSON,
            isPublic,
          },
          sender,
          options,
        );

        if (success) {
          if (!isPublic) {
            void updateOpenSurveys();
            void updateAnsweredSurveys();
          }

          toast.success(t('survey.participate.saveAnswerSuccess'));
        }
      });
    }
  }, [selectedSurvey, language]);

  if (!selectedSurvey) {
    return isFetching ? (
      <LoadingIndicatorDialog isOpen={isFetching} />
    ) : (
      <div className="relative top-1/3">
        <h4 className="flex justify-center">{t('survey.notFound')}</h4>
      </div>
    );
  }

  return isFetching ? (
    <LoadingIndicatorDialog isOpen={isFetching} />
  ) : (
    <div className={cn('survey-participation')}>
      <Survey model={surveyModel} />
    </div>
  );
};

export default SurveyParticipationPage;
