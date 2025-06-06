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

import React from 'react';
import useUserStore from '@/store/UserStore/UserStore';
import FormField from '@/components/shared/FormField';
import { Form } from '@/components/ui/Form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { publicUserRegex, publicUserLoginRegex, publicUserSeperator } from '@libs/survey/utils/publicUserLoginRegex';
import { zodResolver } from '@hookform/resolvers/zod';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import { Card } from '@/components/shared/Card';
import PublicAccessFormHeader from '@/components/shared/PublicAccessFormHeader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const PublicSurveyAccessForm = (): React.ReactNode => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { selectedSurvey } = useSurveyTablesPageStore();
  const { setAttendee, checkForMatchingUserNameAndPubliUserId } = useParticipateSurveyStore();

  const getPublicLoginFormSchema = () =>
    z.object({
      publicUserName: z
        .string({ required_error: t('common.required') })
        .min(5, { message: t('login.username_too_short') })
        .max(100, { message: t('login.username_too_long') })
        .regex(publicUserRegex, { message: t('login.username_not_regex') }),
    });

  const form = useForm<{ publicUserName: string }>({
    mode: 'onSubmit',
    defaultValues: { publicUserName: '' },
    resolver: zodResolver(getPublicLoginFormSchema()),
  });

  const handleAccessSurvey = async () => {
    const { publicUserName } = form.getValues();
    const isPublicUserNameValid = !form.formState.errors.publicUserName;
    if (!isPublicUserNameValid) {
      return;
    }

    if (!publicUserLoginRegex.test(publicUserName)) {
      setAttendee({
        username: undefined,
        firstName: publicUserName,
        lastName: undefined,
        label: publicUserName,
        value: undefined,
      });
      return;
    }

    const publicUserNameParts = publicUserName.split(publicUserSeperator);
    const publicUserId = publicUserNameParts.pop();
    const publicUsername = publicUserNameParts.slice(1).join(publicUserSeperator);
    const publicUser = {
      username: publicUserName,
      firstName: publicUsername,
      lastName: publicUserId,
      label: publicUsername,
      value: publicUserName,
    };

    if (selectedSurvey?.id) {
      const checkExistenceOfPublicUsername = await checkForMatchingUserNameAndPubliUserId(
        selectedSurvey?.id,
        publicUser,
      );

      if (!checkExistenceOfPublicUsername) {
        form.setError('publicUserName', new Error(t('login.publicUsername_notExisting')));
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[450px] max-w-[450px] border-none bg-white bg-opacity-5 p-5 md:w-[60%]">
        <PublicAccessFormHeader />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAccessSurvey)}>
            {!user?.username && (
              <div className="mb-2">
                <div className="mb-2">{t('survey.participate.pleaseEnterYourFullName')} </div>
                <FormField
                  form={form}
                  type="text"
                  name="publicUserName"
                  variant="dialog"
                />
              </div>
            )}
            <DialogFooterButtons
              submitButtonText="common.join"
              submitButtonType="submit"
              handleSubmit={form.handleSubmit(handleAccessSurvey)}
            />
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default PublicSurveyAccessForm;
