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
import createValidPublicUserId from '@libs/survey/utils/createValidPublicUserId';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import PublicSurveyAccess from '@/pages/Surveys/Participation/PublicSurveyAccess';

const PublicSurveyAccessForm = (): React.ReactNode => {
  const { t } = useTranslation();
  const { selectedSurvey } = useSurveyTablesPageStore();
  const { setAttendee, checkForMatchingUserNameAndPubliUserId } = useParticipateSurveyStore();

  const getPublicLoginFormSchema = () =>
    z.object({
      publicUserName: z
        .string({ required_error: t('common.required') })
        .min(5, { message: t('login.username_too_short') })
        .max(32, { message: t('login.username_too_long') }),
      publicUserId: z.nullable(
        z
          .string()
          .uuid({ message: t('login.publicUserId_noUUID') })
          .optional(),
      ),
    });

  const form = useForm<{ publicUserName: string; publicUserId: string | null }>({
    mode: 'onSubmit',
    defaultValues: { publicUserName: '', publicUserId: null },
    resolver: zodResolver(getPublicLoginFormSchema()),
  });

  const handleAccessSurvey = async () => {
    const { publicUserName, publicUserId } = form.getValues();
    const isPublicUserNameValid = !form.formState.errors.publicUserName;
    const isPublicUserIdValid = !form.formState.errors.publicUserId;

    if (!isPublicUserNameValid) {
      return;
    }

    if (!publicUserId) {
      form.clearErrors('publicUserId');
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

    if (publicUserId && publicUserId !== '') {
      if (!isPublicUserIdValid) {
        return;
      }
      const publicUsername = createValidPublicUserId(publicUserName, publicUserId);
      const publicUser = {
        username: publicUsername,
        firstName: undefined,
        lastName: undefined,
        publicUserName,
        publicUserId,
        label: publicUserName,
        value: publicUsername,
      };
      // eslint-disable-next-line no-underscore-dangle
      if (selectedSurvey?._id) {
        const checkExistenceOfPublicUsername = await checkForMatchingUserNameAndPubliUserId(
          // eslint-disable-next-line no-underscore-dangle
          selectedSurvey?._id,
          publicUser,
        );

        if (checkExistenceOfPublicUsername) {
          setAttendee(publicUser);
        } else {
          form.setError('publicUserName', new Error(t('login.publicUsername_notExisting')));
          form.setError('publicUserId', new Error(t('login.publicUsername_notExisting')));
        }
      }
    }
  };

  return (
    <div className="relative top-1/3">
      <PublicSurveyAccess
        form={form}
        publicUserName={form.watch('publicUserName')}
        setPublicUserName={(value) => form.setValue('publicUserName', value, { shouldValidate: true })}
        publicUserId={form.watch('publicUserId')}
        setPublicUserId={(value) => form.setValue('publicUserId', value, { shouldValidate: true })}
        accessSurvey={handleAccessSurvey}
      />
    </div>
  );
};

export default PublicSurveyAccessForm;
