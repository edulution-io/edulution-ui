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
import { CompletingEvent, Model, Serializer } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SubmitAnswerDto from '@libs/survey/types/api/submit-answer.dto';
import SurveyAnswerDto from '@libs/survey/types/api/survey-answer.dto';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import AttendeeDto from '@libs/user/types/attendee.dto';
import UserDto from '@libs/user/types/user.dto';
import useLanguage from '@/hooks/useLanguage';
import surveyTheme from '@/pages/Surveys/theme/theme';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import '../theme/custom.participation.css';
import 'survey-core/i18n/french';
import 'survey-core/i18n/german';
import 'survey-core/i18n/italian';

interface SurveyParticipationModelProps {
  username: string;
  user: UserDto | null;
  isPublic: boolean;
  selectedSurvey: SurveyDto | undefined;
  answerSurvey: (
    answerDto: SubmitAnswerDto,
    sender: Model,
    options: CompletingEvent,
  ) => Promise<SurveyAnswerDto | undefined>;
  previousAnswer: SurveyAnswerDto | undefined;
  isFetching: boolean;
  updateOpenSurveys: () => void;
  updateAnsweredSurveys: () => void;
}

Serializer.getProperty('rating', 'displayMode').defaultValue = 'buttons';

const SurveyParticipationModel = (props: SurveyParticipationModelProps): React.ReactNode => {
  const {
    user,
    username,
    isPublic,
    selectedSurvey,
    previousAnswer,
    answerSurvey,
    isFetching,
    updateOpenSurveys,
    updateAnsweredSurveys,
  } = props;

  const { t } = useTranslation();
  const { language } = useLanguage();

  const surveyModel = useMemo(() => {
    if (!selectedSurvey || !selectedSurvey.formula) {
      return undefined;
    }
    const surveyParticipationModel = new Model(selectedSurvey.formula);

    surveyParticipationModel.applyTheme(surveyTheme);
    surveyParticipationModel.locale = language;
    if (surveyParticipationModel.pages.length > 3) {
      surveyParticipationModel.showProgressBar = 'top';
    }

    surveyParticipationModel.onCompleting.add(async (sender, options) => {
      if (!selectedSurvey.id) {
        throw new Error(SurveyErrorMessages.MISSING_ID_ERROR);
      }

      let attendee: AttendeeDto;
      if (user !== null) {
        attendee = {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          label: user.username,
          value: user.username,
        };
      } else {
        attendee = {
          username,
          firstName: undefined,
          lastName: undefined,
          label: username,
          value: username,
        };
      }

      const success = await answerSurvey(
        {
          surveyId: selectedSurvey.id,
          saveNo: selectedSurvey.saveNo,
          answer: surveyParticipationModel.getData() as JSON,
          attendee,
          isPublic,
        },
        sender,
        options,
      );

      if (success) {
        if (!isPublic) {
          if (updateOpenSurveys) void updateOpenSurveys();
          if (updateAnsweredSurveys) void updateAnsweredSurveys();
        }
        toast.success(t('survey.participate.saveAnswerSuccess'));
      }
    });

    return surveyParticipationModel;
  }, [selectedSurvey, language]);

  useEffect(() => {
    if (surveyModel && previousAnswer) {
      surveyModel.data = previousAnswer.answer;
    }
  }, [surveyModel, previousAnswer]);

  if (isFetching) {
    return <LoadingIndicatorDialog isOpen />;
  }

  if (!surveyModel) {
    return (
      <div className="relative top-1/3">
        <h4 className="flex justify-center">{t('survey.notFound')}</h4>
      </div>
    );
  }

  return (
    <div className={cn('survey-participation')}>
      <Survey model={surveyModel} />
    </div>
  );
};

export default SurveyParticipationModel;
