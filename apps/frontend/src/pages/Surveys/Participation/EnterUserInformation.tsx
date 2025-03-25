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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import UserInfo from '@libs/user/types/jwt/userinfo';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/shared/FormField';
import { Form } from '@/components/ui/Form';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

interface EnterUserInformationProps {
  setUserInfo: (userInfo: UserInfo) => void;
}

const EnterUserInformation = (props: EnterUserInformationProps) => {
  const { setUserInfo } = props;

  const { t } = useTranslation();

  const formSchema: z.Schema = z.object({
    firstName: z
      .string()
      .min(3, { message: t('login.username_too_short') })
      .max(32, { message: t('login.username_too_long') }),
    lastName: z
      .string()
      .min(3, { message: t('login.username_too_short') })
      .max(32, { message: t('login.username_too_long') }),
    email: z.string().optional(),
  });

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  return (
    <Card
      variant="modal"
      className="border-2 bg-overlay"
    >
      <h4 className="mb-8 flex justify-center text-background">{t('survey.participate.enterUserInfo')}</h4>
      <Form
        {...form}
        data-testid="test-id-login-page-form"
      >
        <form
          onSubmit={form.handleSubmit(() => setUserInfo(form.getValues()))}
          className="space-y-2"
          data-testid="test-id-login-page-form"
        >
          <FormField
            form={form}
            name="preferred_username"
            value={form.watch('preferred_username')}
            onChange={(e) => form.setValue('preferred_username', e.target.value)}
            labelTranslationId="survey.participate.preferred_username"
          />
          <FormField
            form={form}
            name="given_name"
            value={form.watch('given_name')}
            onChange={(e) => form.setValue('given_name', e.target.value)}
            labelTranslationId="survey.participate.given_name"
          />
          <FormField
            form={form}
            name="family_name"
            value={form.watch('family_name')}
            onChange={(e) => form.setValue('family_name', e.target.value)}
            labelTranslationId="survey.participate.family_name"
          />
          <FormField
            form={form}
            name="email"
            value={form.watch('email')}
            onChange={(e) => form.setValue('email', e.target.value)}
            labelTranslationId="survey.participate.email"
          />
          <div className="mt-12 flex justify-end">
            <Button
              type="submit"
              variant="btn-collaboration"
              size="lg"
            >
              {t('survey.participate.saveUserInfo')}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default EnterUserInformation;
