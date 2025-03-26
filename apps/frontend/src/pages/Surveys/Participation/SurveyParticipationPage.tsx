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

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import useUserStore from '@/store/UserStore/UserStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import PublicSurveyParticipationUserInput from '@/pages/Surveys/Participation/PublicSurveyAccessForm';
import SurveyParticipationBody from '@/pages/Surveys/Participation/SurveyParticipationBody';
import '../theme/custom.participation.css';

interface SurveyParticipationPageProps {
  isPublic: boolean;
}

const SurveyParticipationPage = (props: SurveyParticipationPageProps): React.ReactNode => {
  const { isPublic = false } = props;
  const { selectedSurvey, fetchSelectedSurvey, isFetching, updateOpenSurveys, updateAnsweredSurveys } =
    useSurveyTablesPageStore();
  const { username, setUsername, answerSurvey, reset, previousAnswer } = useParticipateSurveyStore();

  const { surveyId } = useParams();

  const { user } = useUserStore();

  useEffect(() => {
    reset();
    void fetchSelectedSurvey(surveyId, isPublic);
  }, [surveyId]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  const form = useForm<{ username: string }>();

  const handleAccessSurvey = () => {
    if (!selectedSurvey) {
      return;
    }
    if (user) {
      setUsername(user.username);
    } else {
      setUsername(form.watch('username'));
    }
  };

  if (!user && !username) {
    return (
      <div className="relative top-1/3">
        <PublicSurveyParticipationUserInput
          form={form}
          publicUserFullName={form.watch('username')}
          setPublicUserFullName={(value: string) => form.setValue('username', value)}
          accessSurvey={handleAccessSurvey}
        />
      </div>
    );
  }

  return (
    <SurveyParticipationBody
      username={user?.username || form.watch('username')}
      isPublic={isPublic}
      selectedSurvey={selectedSurvey}
      previousAnswer={previousAnswer}
      answerSurvey={answerSurvey}
      isFetching={isFetching}
      updateOpenSurveys={updateOpenSurveys}
      updateAnsweredSurveys={updateAnsweredSurveys}
    />
  );
};

export default SurveyParticipationPage;
