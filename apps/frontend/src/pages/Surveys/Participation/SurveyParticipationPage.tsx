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
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import createValidPublicUserId from '@libs/survey/utils/createValidPublicUserId';
import useUserStore from '@/store/UserStore/UserStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SurveyParticipationModel from '@/pages/Surveys/Participation/SurveyParticipationModel';
import PublicSurveyAccessForm from '@/pages/Surveys/Participation/PublicSurveyAccessForm';
import PublicSurveyParticipationId from '@/pages/Surveys/Participation/PublicSurveyParticipationId';
import PageLayout from '@/components/structure/layout/PageLayout';
import '../theme/custom.participation.css';

interface SurveyParticipationPageProps {
  isPublic: boolean;
}

const SurveyParticipationPage = (props: SurveyParticipationPageProps): React.ReactNode => {
  const { isPublic = false } = props;

  const { surveyId } = useParams();

  const { user } = useUserStore();

  const { selectedSurvey, fetchSelectedSurvey } = useSurveyTablesPageStore();

  const {
    attendee,
    setAttendee,
    reset,
    publicUserLogin,
    fetchAnswer,
    checkForMatchingUserNameAndPubliUserId,
    existsMatchingUserNameAndPubliUserId,
    isUserAuthenticated,
    setIsUserAuthenticated,
  } = useParticipateSurveyStore();

  const { t } = useTranslation();

  const form = useForm<{ publicUserName: string; publicUserId?: string }>();

  const handleReset = () => {
    reset();
    form.reset();
    void fetchSelectedSurvey(surveyId, isPublic);
  };

  useEffect(() => {
    handleReset();
  }, [surveyId]);

  useEffect(() => {
    if (user?.username) {
      setAttendee({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        publicUserName: undefined,
        publicUserId: undefined,
        label: `${user.firstName} ${user.lastName}`,
        value: user.username,
      });
      setIsUserAuthenticated(true);
    }
    handleReset();
  }, [user]);

  useEffect(() => {
    if (!selectedSurvey?.id) {
      return;
    }
    if (attendee) {
      void fetchAnswer(selectedSurvey.id);
    }
  }, [selectedSurvey, attendee]);

  useEffect(() => {
    if (existsMatchingUserNameAndPubliUserId) {
      setIsUserAuthenticated(true);
    } else {
      form.setError('publicUserName', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
      form.setError('publicUserId', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
    }
  }, [existsMatchingUserNameAndPubliUserId]);

  const handleAccessSurvey = () => {
    if (user) {
      return;
    }
    if (!selectedSurvey?.id) {
      return;
    }
    const { publicUserName, publicUserId } = form.getValues();
    if (!publicUserId) {
      setAttendee({
        username: publicUserName,
        firstName: undefined,
        lastName: undefined,
        publicUserName,
        publicUserId: undefined,
        label: publicUserName,
        value: publicUserName,
      });
      setIsUserAuthenticated(true);
    }
    if (publicUserName && publicUserId) {
      const username = createValidPublicUserId(publicUserName, publicUserId);
      const publicAttendee = {
        username,
        firstName: undefined,
        lastName: undefined,
        publicUserName,
        publicUserId,
        label: publicUserName,
        value: username,
      };
      if (!user && !!attendee?.publicUserName && !!attendee?.publicUserId) {
        void checkForMatchingUserNameAndPubliUserId(selectedSurvey.id, attendee);
        setAttendee(publicAttendee);
      }
    }
  };

  if (publicUserLogin) {
    return (
      <PageLayout>
        <div className="relative top-1/4">
          <PublicSurveyParticipationId publicUserLogin={publicUserLogin} />
        </div>
      </PageLayout>
    );
  }

  if (!selectedSurvey) {
    return (
      <PageLayout>
        <div className="relative top-1/3">
          <h4 className="flex justify-center">{t('survey.notFound')}</h4>
        </div>
      </PageLayout>
    );
  }

  if (!isUserAuthenticated) {
    return (
      <PageLayout>
        <div className="relative top-1/3">
          <PublicSurveyAccessForm
            form={form}
            publicUserName={form.watch('publicUserName')}
            setPublicUserName={(value: string) => form.setValue('publicUserName', value)}
            publicUserId={form.watch('publicUserId')}
            setPublicUserId={(value: string) => form.setValue('publicUserId', value)}
            accessSurvey={handleAccessSurvey}
          />
        </div>
      </PageLayout>
    );
  }

  if (attendee) {
    return (
      <PageLayout>
        <SurveyParticipationModel
          attendee={attendee}
          isPublic={isPublic}
        />
      </PageLayout>
    );
  }

  return null;
};

export default SurveyParticipationPage;
