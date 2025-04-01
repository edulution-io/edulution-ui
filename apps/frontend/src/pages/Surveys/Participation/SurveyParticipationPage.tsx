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

import React, { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Model, Serializer } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import useLanguage from '@/hooks/useLanguage';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import surveyTheme from '@/pages/Surveys/theme/theme';
import '../theme/custom.participation.css';
import PageTitle from '@/components/PageTitle';

interface SurveyParticipationPageProps {
  isPublic: boolean;
}

Serializer.getProperty('rating', 'displayMode').defaultValue = 'buttons';

const SurveyParticipationPage = (props: SurveyParticipationPageProps): React.ReactNode => {
  const { isPublic = false } = props;
  const { selectedSurvey, fetchSelectedSurvey, isFetching, updateOpenSurveys, updateAnsweredSurveys } =
    useSurveyTablesPageStore();
  const { answerSurvey, reset } = useParticipateSurveyStore();

  const { language } = useLanguage();
  const { t } = useTranslation();

  const { surveyId } = useParams();

  useEffect(() => {
    reset();
    void fetchSelectedSurvey(surveyId, isPublic);
  }, [surveyId]);

  const surveyModel = useMemo(() => {
    if (!selectedSurvey) {
      return undefined;
    }
    const surveyParticipationModel = new Model(selectedSurvey.formula);
    surveyParticipationModel.applyTheme(surveyTheme);
    surveyParticipationModel.locale = language;
    if (surveyParticipationModel.pages.length > 3) {
      surveyParticipationModel.showProgressBar = 'top';
    }

    surveyParticipationModel.onCompleting.add(async (sender, options) => {
      const success = await answerSurvey(
        {
          surveyId: selectedSurvey.id || surveyId || '',
          saveNo: selectedSurvey.saveNo,
          answer: surveyParticipationModel.getData() as JSON,
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

    return surveyParticipationModel;
  }, [selectedSurvey, language]);

  if (isFetching) {
    return (
      <>
        <PageTitle translationId="survey.publicSurvey" />
        <LoadingIndicatorDialog isOpen />
      </>
    );
  }

  if (!surveyModel) {
    return (
      <div className="relative top-1/3">
        <PageTitle translationId="survey.publicSurvey" />
        <h4 className="flex justify-center">{t('survey.notFound')}</h4>
      </div>
    );
  }

  return (
    <div className={cn('survey-participation')}>
      <PageTitle translationId="survey.publicSurvey" />
      <Survey model={surveyModel} />
    </div>
  );
};

export default SurveyParticipationPage;
