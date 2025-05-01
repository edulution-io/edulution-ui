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
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import useUserStore from '@/store/UserStore/UserStore';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import PublicLoginButton from '@/pages/ConferencePage/PublicConference/PublicLoginButton';
import PublicJoinButton from '@/pages/ConferencePage/PublicConference/PublicJoinButton';

interface PublicSurveyAccessFormProps {
  form: UseFormReturn<{ publicUserName: string; publicUserId?: string }>;
  accessSurvey: () => void;
}

const PublicSurveyAccessForm = ({ form, accessSurvey }: PublicSurveyAccessFormProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();

  return (
    <div className="mx-auto my-10 w-[90%] rounded-xl bg-white bg-opacity-5 p-5 md:w-[400px]">
      <PublicLoginButton />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(accessSurvey)}
          noValidate
        >
          {!user?.username && (
            <div className="mb-4">
              <div className="mb-2">{t('survey.participate.pleaseEnterYourFullName')}</div>
              <FormField
                name="publicUserName"
                form={form}
                defaultValue=""
                placeholder={t('survey.participate.yourFullName')}
                variant="dialog"
              />
              <div className="mb-2">{t('survey.participate.pleaseEnterYourParticipationId')}</div>
              <FormField
                name="publicUserId"
                form={form}
                defaultValue=""
                placeholder={t('survey.participate.publicUserId')}
                variant="dialog"
              />
            </div>
          )}
          <PublicJoinButton />
        </form>
      </Form>
    </div>
  );
};

export default PublicSurveyAccessForm;
