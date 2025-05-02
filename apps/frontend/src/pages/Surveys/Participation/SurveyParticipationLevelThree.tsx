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

import { z } from 'zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import createValidPublicUserId from '@libs/survey/utils/createValidPublicUserId';
import PublicSurveyAccessForm from '@/pages/Surveys/Participation/PublicSurveyAccessForm';

interface SurveyParticipationPublicLoginProps {
  survey: SurveyDto;
}

const SurveyParticipationPublicLogin = (props: SurveyParticipationPublicLoginProps): React.ReactNode => {
  const { survey } = props;
  
  const { t } = useTranslation();

  const getPublicLoginFormSchema = () => 
    z.record(
      z.object({
        publicUserName: z
          .string({ required_error: t('common.required') })
          .min(5, { message: t('login.username_too_short') })
          .max(32, { message: t('login.username_too_long') }),
        publicUserId: z
          .string()
          .uuid()
          .optional(),
        totpValue: z.string().optional(),
      }),
    );
  
  const form = useForm<{ publicUserName: string; publicUserId?: string }>({
    mode: 'onSubmit',
    resolver: zodResolver(getPublicLoginFormSchema())
  });

  /*
  useEffect(() => {
      console.log('Error on publicUserName', form.formState.errors.publicUserName);
  }, [form.formState.errors.publicUserName]);

  useEffect(() => {
      console.log('Error on publicUserId', form.formState.errors.publicUserId);
  }, [form.formState.errors.publicUserId]);  
  */
  
  const handleAccessSurvey = () => {
    
    const isPublicUserNameValid = form.formState.errors.publicUserName === undefined;
    const isPublicUserIdValid = form.formState.errors.publicUserName === undefined;
    
    /*
    if (!isPublicUserNameValid || !isPublicUserIdValid) {
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
    */
  };

  /*
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
        value: value,
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
  }
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
  }
  */

  if (!isUserAuthenticated) {
    return (
      <div className="relative top-1/3">
        <PublicSurveyAccessForm
          form={form}
          publicUserName={form.watch('publicUserName')}
          setPublicUserName={(value) => form.setValue('publicUserName', value, { shouldValidate: true })}
          publicUserId={form.watch('publicUserId')}
          setPublicUserId={(value) => form.setValue('publicUserId', value, { shouldValidate: true })}
          accessSurvey={handleAccessSurvey}
        />
      </div>
    );
  }
};

export default SurveyParticipationPublicLogin;