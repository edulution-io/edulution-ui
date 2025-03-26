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
import UserInfo from '@libs/common/types/userinfo';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/shared/FormField';
import { Form } from '@/components/ui/Form';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

interface PublicPagesUserInputProps {
  setUserInfo: (userInfo: UserInfo) => void;
}

const PublicPagesUserInput = (props: PublicPagesUserInputProps) => {
  const { setUserInfo } = props;

  const { t } = useTranslation();

  const formSchema: z.Schema = z.object({
    username: z
      .string()
      .min(3, { message: t('login.username_too_short') })
      .max(32, { message: t('login.username_too_long') })
      .optional(),
    firstName: z
      .string()
      .min(3, { message: t('login.username_too_short') })
      .max(32, { message: t('login.username_too_long') })
      .optional(),
    lastName: z
      .string()
      .min(3, { message: t('login.username_too_short') })
      .max(32, { message: t('login.username_too_long') })
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.username || ( !values.firstName && !values.lastName) ) {
      ctx.addIssue({
        message: 'Either you should enter the username you received when participating the first time.',
        code: z.ZodIssueCode.custom,
        path: ['username'],
      });
      ctx.addIssue({
        message: 'Or you have to submit an firstName and a lastName',
        code: z.ZodIssueCode.custom,
        path: ['firstName'],
      });
      ctx.addIssue({
        message: 'Or you have to submit an firstName and a lastName',
        code: z.ZodIssueCode.custom,
        path: ['firstName'],
      });
    }
  });

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
    },
  });

  return (
    <Card
      variant="modal"
      className="border bg-overlay"
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
            name="username"
            value={form.watch('username')}
            onChange={(e) => form.setValue('username', e.target.value)}
            labelTranslationId="survey.participate.username"
          />
          <FormField
            form={form}
            name="firstName"
            value={form.watch('firstName')}
            onChange={(e) => form.setValue('firstName', e.target.value)}
            labelTranslationId="survey.participate.firstName"
          />
          <FormField
            form={form}
            name="lastName"
            value={form.watch('lastName')}
            onChange={(e) => form.setValue('lastName', e.target.value)}
            labelTranslationId="survey.participate.lastName"
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

export default PublicPagesUserInput;
