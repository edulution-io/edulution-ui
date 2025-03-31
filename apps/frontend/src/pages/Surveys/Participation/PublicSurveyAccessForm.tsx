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
import publicUsernameRegex from '@libs/survey/utils/publicUsernameRegex';
import useUserStore from '@/store/UserStore/UserStore';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import publicUserIdRegex from '@libs/survey/utils/publicUserIdRegex';
import PublicLoginButton from '@/pages/ConferencePage/PublicConference/PublicLoginButton';
import PublicJoinButton from '@/pages/ConferencePage/PublicConference/PublicJoinButton';

interface PublicSurveyAccessFormProps {
  form: UseFormReturn<{ username: string }>;
  publicUserFullName: string;
  setPublicUserFullName: (value: string) => void;
  accessSurvey: () => void;
}

const PublicSurveyAccessForm = ({
  form,
  publicUserFullName,
  setPublicUserFullName,
  accessSurvey,
}: PublicSurveyAccessFormProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();

  return (
    <div className="mx-auto my-10 w-[90%] rounded-xl bg-white bg-opacity-5 p-5 md:w-[400px]">
      <PublicLoginButton />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(accessSurvey)}>
          {!user?.username && (
            <div className="mb-4">
              <div className="mb-2">{t('survey.participate.pleaseEnterYourFullName')}</div>
              <FormField
                name="name"
                form={form}
                value={publicUserFullName}
                onChange={(e) => setPublicUserFullName(e.target.value)}
                placeholder={t('survey.participate.yourFullName')}
                rules={{
                  required: t('common.min_chars', { count: 3 }),
                  minLength: {
                    value: 3,
                    message: t('common.min_chars', { count: 3 }),
                  },
                  maxLength: {
                    value: 100,
                    message: t('common.max_chars', { count: 100 }),
                  },
                  validate: (value) =>
                    publicUsernameRegex.test(value) ||
                    publicUserIdRegex.test(value) ||
                    t('survey.participate.invalidUsername'),
                }}
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
