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
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/UserStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SurveyParticipationModel from '@/pages/Surveys/Participation/SurveyParticipationModel';
import PublicSurveyAccessForm from '@/pages/Surveys/Participation/PublicSurveyAccessForm';
import PublicSurveyParticipationId from '@/pages/Surveys/Participation/PublicSurveyParticipationId';
import '../theme/custom.participation.css';
import PageLayout from '@/components/structure/layout/PageLayout';
import publicUserIdRegex from '@libs/survey/utils/publicUserIdRegex';

interface SurveyParticipationPageProps {
  isPublic: boolean;
}

const SurveyParticipationPage = (props: SurveyParticipationPageProps): React.ReactNode => {
  const { isPublic = false } = props;

  const { selectedSurvey, fetchSelectedSurvey } = useSurveyTablesPageStore();

  const { username, setUsername, reset, publicUserId, fetchAnswer } = useParticipateSurveyStore();

  const { surveyId } = useParams();
  const { t } = useTranslation();

  const { user } = useUserStore();

  useEffect(() => {
    reset();
    void fetchSelectedSurvey(surveyId, isPublic);
  }, [surveyId]);

  const form = useForm<{ username: string }>();

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
    if (user === null) {
      reset();
      form.reset();
      void fetchSelectedSurvey(surveyId, isPublic);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedSurvey?.id) {
      return;
    }
    if (user) {
      void fetchAnswer(selectedSurvey.id);
      return;
    }
    if (username) {
      const publicParticipationIdLinkedToSurvey = publicUserIdRegex.test(username);
      if (selectedSurvey.isPublic && !publicParticipationIdLinkedToSurvey) {
        return;
      }
      void fetchAnswer(selectedSurvey.id, username);
    }
  }, [selectedSurvey, username]);

  const handleAccessSurvey = () => {
    if (user) {
      setUsername(user.username);
    } else {
      setUsername(form.watch('username'));
    }
  };

  if (publicUserId) {
    return (
      <div className="relative top-1/4">
        <PublicSurveyParticipationId publicParticipationId={publicUserId} />
      </div>
    );
  }

  if (!selectedSurvey) {
    return (
      <div className="relative top-1/3">
        <h4 className="flex justify-center">{t('survey.notFound')}</h4>
      </div>
    );
  }

  if (!user && !username && !selectedSurvey?.isAnonymous) {
    return (
      <div className="relative top-1/4">
        <PublicSurveyAccessForm
          form={form}
          publicUserFullName={form.watch('username')}
          setPublicUserFullName={(value: string) => form.setValue('username', value)}
          accessSurvey={handleAccessSurvey}
        />
      </div>
    );
  }

  return (
    <PageLayout>
      <SurveyParticipationModel
        username={user?.username || form.watch('username')}
        isPublic={isPublic}
      />
    </PageLayout>
  );
};

export default SurveyParticipationPage;
