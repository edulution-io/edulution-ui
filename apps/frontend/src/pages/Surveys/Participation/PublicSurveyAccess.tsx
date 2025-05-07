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

import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import PublicLoginButton from '@/pages/ConferencePage/PublicConference/PublicLoginButton';
import PublicJoinButton from '@/pages/ConferencePage/PublicConference/PublicJoinButton';
import useUserStore from '@/store/UserStore/UserStore';
import FormField from '@/components/shared/FormField';
import { Form } from '@/components/ui/Form';

interface PublicSurveyAccessProps {
  form: UseFormReturn<{ publicUserName: string; publicUserId: string | null }>;
  publicUserName: string;
  setPublicUserName: (value: string) => void;
  publicUserId: string | null;
  setPublicUserId: (value: string | null) => void;
  accessSurvey: () => void;
}

const PublicSurveyAccess = ({
  form,
  publicUserName,
  setPublicUserName,
  publicUserId,
  setPublicUserId,
  accessSurvey,
}: PublicSurveyAccessProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();

  return (
    <div className="mx-auto my-10 w-[90%] rounded-xl bg-white bg-opacity-5 p-5 md:w-[400px]">
      <PublicLoginButton />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(accessSurvey)}>
          {!user?.username && (
            <div className="mb-2">
              <div className="mb-4">
                <div className="mb-2">{t('survey.participate.pleaseEnterYourFullName')}</div>
                <FormField
                  form={form}
                  type="text"
                  name="publicUserName"
                  value={publicUserName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPublicUserName(e.target.value)}
                  variant="dialog"
                />
              </div>
              <div className="mb-2">{t('survey.participate.pleaseEnterYourParticipationId')}</div>
              <FormField
                form={form}
                type="text"
                name="publicUserId"
                value={publicUserId || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPublicUserId(e.target.value === '' ? null : e.target.value)
                }
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

export default PublicSurveyAccess;
