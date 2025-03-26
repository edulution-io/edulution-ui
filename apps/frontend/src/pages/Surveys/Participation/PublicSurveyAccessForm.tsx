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
import { useLocation, useNavigate } from 'react-router-dom';
import publicUsernameRegex from '@libs/survey/utils/publicUsernameRegex';
import useUserStore from '@/store/UserStore/UserStore';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import publicUserIdRegex from '@libs/survey/utils/publicUserIdRegex';

interface PublicSurveyParticipationUserInputProps {
  form: UseFormReturn<{ username: string }>;
  publicUserFullName: string;
  setPublicUserFullName: (value: string) => void;
  // fetchPreviousAnswer: () => Promise<SurveyAnswerDto>;
  // isFetching: boolean;
  accessSurvey: () => void;
}

const PublicSurveyParticipationUserInput = ({
  form,
  publicUserFullName,
  setPublicUserFullName,
  accessSurvey,
}: PublicSurveyParticipationUserInputProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserStore();

  return (
    <div className="mx-auto my-10 w-[90%] rounded-xl bg-white bg-opacity-5 p-5 md:w-[400px]">
      {!publicUserFullName && !user?.username && (
        <div>
          <Button
            className="mx-auto mt-5 w-[200px] justify-center text-background shadow-xl"
            type="submit"
            variant="btn-security"
            size="lg"
            data-testid="test-id-login-page-submit-button"
            onClick={() =>
              navigate('/login', {
                state: { from: location.pathname },
              })
            }
          >
            {t('common.toLogin')}
          </Button>
          <div className="mb-9 mt-12 flex items-center">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4">{t('survey.participate.orContinueWithoutAccount')}</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
        </div>
      )}
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
          <div className="mb-2 mt-4 flex justify-end">
            <Button
              variant="btn-collaboration"
              size="lg"
              type="submit"
            >
              {t('common.join')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PublicSurveyParticipationUserInput;
