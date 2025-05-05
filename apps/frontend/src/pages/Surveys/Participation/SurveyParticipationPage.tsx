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

import uuidv4 from 'uuid4';
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
  const { selectedSurvey, fetchSelectedSurvey, isFetching } = useSurveyTablesPageStore();

  // console.log('useParams', 'surveyId', surveyId)
  // console.log('useSurveyTablesPageStore', 'selectedSurvey', selectedSurvey)

  const { user } = useUserStore();
  const {
    attendee,
    setAttendee,
    reset,
    publicUserLogin,
    fetchAnswer,
    checkForMatchingUserNameAndPubliUserId,
    isUserAuthenticated,
    setIsUserAuthenticated,
  } = useParticipateSurveyStore();

  const { t } = useTranslation();

  console.log(surveyId);
  useEffect(() => {
    console.log(
      'eq?:',
      surveyId === selectedSurvey?._id?.toString(),
      '  surveyId:',
      surveyId,
      '  selectedSurvey:',
      selectedSurvey?._id?.toString(),
    );
    // console.log('useSurveyTablesPageStore', 'selectedSurvey', selectedSurvey?._id?.toString())
    if (surveyId !== selectedSurvey?._id?.toString()) {
      fetchSelectedSurvey(surveyId, isPublic);
    } else {
      console.log('survey:', selectedSurvey);
    }
  }, [surveyId]);

  const form = useForm<{ publicUserName: string; publicUserId?: string }>({
    mode: 'onSubmit',
    defaultValues: { publicUserName: '' },
    errors: { publicUserName: undefined, publicUserId: undefined },
  });

  /*
  useEffect(() => {
    console.log('Error on publicUserName', form.formState.errors.publicUserName);
  }, [form.formState.errors.publicUserName]);

  useEffect(() => {
    console.log('Error on publicUserId', form.formState.errors.publicUserId);
  }, [form.formState.errors.publicUserId]);
*/

  /*
  useEffect(() => {
    if (!user || !user.username) {
      void handleReset();
      return;
    }
    setAttendee({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      publicUserName: undefined,
      publicUserId: undefined,
      label: `${user.firstName} ${user.lastName}`,
      value: user.username,
    });
  }, [user]);
*/

  /*
  useEffect(() => {
    if (selectedSurvey?.id && attendee && (user || attendee.publicUserId)) {
      void fetchAnswer(selectedSurvey.id);
    }
  }, [attendee]);
*/

  const handleAccessSurvey = () => {
    const isPublicUserNameValid = form.formState.errors.publicUserName === undefined;
    const isPublicUserIdValid = form.formState.errors.publicUserName === undefined;

    if (!attendee || !selectedSurvey?.id || !isPublicUserNameValid || !isPublicUserIdValid) {
      setIsUserAuthenticated(false);
      return;
    }
    const { publicUserName, publicUserId } = attendee;
    if (!publicUserId) {
      setIsUserAuthenticated(true);
    }
    if (publicUserName && publicUserId) {
      setIsUserAuthenticated(true);
    }
  };

  const handleChangePublicUserName = (value: string) => {
    const { publicUserId } = form.getValues();
    if (!value) {
      form.setError('publicUserName', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
    } else if (value.length < 3) {
      form.setError('publicUserName', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
    } else if (value.length > 100) {
      form.setError('publicUserName', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
    } else if (!publicUserId) {
      setAttendee({
        username: value,
        firstName: undefined,
        lastName: undefined,
        publicUserName: value,
        publicUserId: undefined,
        label: value,
        value,
      });
    } else if (publicUserId && uuidv4.valid(publicUserId)) {
      const username = createValidPublicUserId(value, publicUserId);
      const publicAttendee = {
        username,
        firstName: undefined,
        lastName: undefined,
        publicUserName: value,
        publicUserId,
        label: value,
        value: username,
      };
      if (selectedSurvey?.id) {
        const publicParticipation = void checkForMatchingUserNameAndPubliUserId(selectedSurvey.id, publicAttendee);
        if (publicParticipation) {
          setAttendee(publicAttendee);
          form.clearErrors('publicUserName');
        } else {
          form.setError('publicUserName', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
          form.setError('publicUserId', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
        }
      }
    } else {
      form.clearErrors('publicUserName');
    }
    form.setValue('publicUserName', value);
  };
  const handleChangePublicUserId = (value: string) => {
    const { publicUserName } = form.getValues();
    if (!value) {
      form.clearErrors('publicUserId');
      if (publicUserName.length > 3 && publicUserName.length < 100) {
        setAttendee({
          username: publicUserName,
          firstName: undefined,
          lastName: undefined,
          publicUserName,
          publicUserId: undefined,
          label: publicUserName,
          value: publicUserName,
        });
      }
    } else if (uuidv4.valid(value)) {
      if (publicUserName.length > 3 && publicUserName.length < 100) {
        const username = createValidPublicUserId(publicUserName, value);
        const publicAttendee = {
          username,
          firstName: undefined,
          lastName: undefined,
          publicUserName,
          publicUserId: value,
          label: publicUserName,
          value: username,
        };
        if (selectedSurvey?.id) {
          const publicParticipation = void checkForMatchingUserNameAndPubliUserId(selectedSurvey.id, publicAttendee);
          if (publicParticipation) {
            setAttendee(publicAttendee);
          } else {
            form.setError('publicUserName', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
            form.setError('publicUserId', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
          }
        }
      }
      form.clearErrors('publicUserId');
    }
    form.setError('publicUserId', new Error(SurveyErrorMessages.MISSING_ID_ERROR));
    form.setValue('publicUserId', value);
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
            setPublicUserName={handleChangePublicUserName}
            publicUserId={form.watch('publicUserId')}
            setPublicUserId={handleChangePublicUserId}
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
