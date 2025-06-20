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
import { useTranslation } from 'react-i18next';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import useLanguage from '@/hooks/useLanguage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import surveyTheme from '@/pages/Surveys/theme/theme';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import '../theme/custom.participation.css';
import 'survey-core/i18n/french';
import 'survey-core/i18n/german';
import 'survey-core/i18n/italian';

interface SurveyParticipationModelProps {
  isPublic: boolean;
}

Serializer.getProperty('rating', 'displayMode').defaultValue = 'buttons';

const SurveyParticipationModel = (props: SurveyParticipationModelProps): React.ReactNode => {
  const { isPublic } = props;

  const { selectedSurvey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const { fetchAnswer, isFetching, answerSurvey, previousAnswer } = useParticipateSurveyStore();

  const { t } = useTranslation();
  const { language } = useLanguage();

  const surveyParticipationModel = useMemo(() => {
    if (!selectedSurvey || !selectedSurvey.formula) {
      return undefined;
    }
    const newModel = new Model(selectedSurvey.formula);

    newModel.applyTheme(surveyTheme);
    newModel.locale = language;
    if (newModel.pages.length > 3) {
      newModel.showProgressBar = 'top';
    }
    newModel.completedHtml = `${t('survey.participate.completeMessage')}`;

    newModel.onCompleting.add(async (surveyModel, completingEvent) => {
      if (!selectedSurvey.id) {
        throw new Error(SurveyErrorMessages.MISSING_ID_ERROR);
      }
      const success = await answerSurvey(
        {
          surveyId: selectedSurvey.id,
          saveNo: selectedSurvey.saveNo,
          answer: surveyModel.getData() as JSON,
          isPublic,
        },
        surveyModel,
        completingEvent,
      );

      if (success) {
        if (!isPublic) {
          if (updateOpenSurveys) void updateOpenSurveys();
          if (updateAnsweredSurveys) void updateAnsweredSurveys();
        }
        toast.success(t('survey.participate.saveAnswerSuccess'));
      }
    });

    return newModel;
  }, [selectedSurvey, language]);

  useEffect(() => {
    if (!selectedSurvey?.id) {
      return;
    }
    void fetchAnswer(selectedSurvey.id);
  }, [selectedSurvey]);

  useEffect(() => {
    if (surveyParticipationModel && previousAnswer) {
      surveyParticipationModel.data = previousAnswer.answer;
    }
  }, [surveyParticipationModel, previousAnswer]);

  if (isFetching) {
    return <LoadingIndicatorDialog isOpen />;
  }
  if (!surveyParticipationModel) {
    return (
      <div className="relative top-1/3">
        <h4 className="flex justify-center">{t('survey.notFound')}</h4>
      </div>
    );
  }

  return (
    <div className="survey-participation">
      <Survey model={surveyParticipationModel} />
    </div>
  );
};

export default SurveyParticipationModel;
