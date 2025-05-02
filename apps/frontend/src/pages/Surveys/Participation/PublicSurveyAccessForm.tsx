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
// import FormField from '@/components/shared/FormField';
import { Form, FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import cn from '@libs/common/utils/className';

interface PublicSurveyAccessFormProps {
  form: UseFormReturn<{ publicUserName: string; publicUserId?: string }>;
  publicUserName: string;
  setPublicUserName: (value: string) => void;
  publicUserId?: string;
  setPublicUserId: (value: string) => void;
  accessSurvey: () => void;
}

const PublicSurveyAccessForm = ({
  form,
  publicUserName,
  setPublicUserName,
  publicUserId,
  setPublicUserId,
  accessSurvey,
}: PublicSurveyAccessFormProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();

  return (
    <div className="mx-auto my-10 w-[90%] rounded-xl bg-white bg-opacity-5 p-5 md:w-[400px]">
      <PublicLoginButton />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(accessSurvey)}
        >
          {!user?.username && (
            <div className="mb-2">
            <div className="mb-4">
              { /* <div className="mb-2">{t('survey.participate.pleaseEnterYourFullName')}
                <FormField
                  form={form}
                  name="publicUserName"
                  defaultValue=""
                  value={publicUserName}
                  onChange={(e) => setPublicUserName(e.target.value)}
                  placeholder={t('survey.participate.yourFullName')}
                  variant="dialog"
                  className="my-1"
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
                  }}
                />
                {form.formState.errors.publicUserName && (
                  <FormMessage className="text-[0.8rem] font-medium text-foreground">
                    {form.formState.errors.publicUserName.message?.toString()}
                  </FormMessage>
                )}
              */}
                
              <FormFieldSH
                control={form.control}
                // disabled={disabled}
                name="publicUserName"
                rules={{
                  required: t('common.required'),
                  minLength: {
                    value: 3,
                    message: t('common.min_chars', { count: 3 }),
                  },
                  maxLength: {
                    value: 100,
                    message: t('common.max_chars', { count: 100 }),
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <p className="mb-2">{t('survey.participate.pleaseEnterYourFullName')}</p>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="publicUserName"
                        type="text"
                        // disabled={disabled || isLoading}
                        placeholder={t('survey.participate.yourFullName')}
                        // readOnly={readonly}
                        value={publicUserName}
                        defaultValue=""
                        onChange={
                          /* (e) => {
                          field.onChange(e);
                            if (onChange) onChange(e);
                          } */
                          (e: ChangeEvent<HTMLInputElement>) => setPublicUserName(e.target?.value)
                        }
                        className="my-1 text-foreground"
                        // variant="dialog"
                      />
                    </FormControl>
                    {form.formState.errors.publicUserName
                      ? (<FormMessage className={cn('text-p text-destructive')}>
                          {form.formState.errors.publicUserName?.message?.toString()}
                      </FormMessage>)
                      : null
                    }
                  </FormItem>
                )}
              />
            </div>
              
            { /* <div className="mb-2">{t('survey.participate.pleaseEnterYourParticipationId')}
              <FormField
                form={form}
                name="publicUserId"
                value={publicUserId}
                onChange={(e) => setPublicUserId(e.target.value)}
                defaultValue=""
                placeholder={t('survey.participate.publicUserId')}
                variant="dialog"
                className="my-1"
              />
              {form.formState.errors.publicUserId && (
                <FormMessage className="text-[0.8rem] font-medium text-foreground">
                  {form.formState.errors.publicUserId.message?.toString()}
                </FormMessage>
              )}
            </div> */}
            <FormFieldSH
              control={form.control}
              // disabled={disabled}
              name="publicUserId"
              render={({ field }) => (
                <FormItem>
                  <p className="mb-2">{t('survey.participate.pleaseEnterYourParticipationId')}</p>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      // disabled={disabled || isLoading}
                      placeholder={t('survey.participate.publicUserId')}
                      // readOnly={readonly}
                      value={publicUserId}
                      defaultValue=""
                      onChange={
                        /* (e) => {
                        field.onChange(e);
                          if (onChange) onChange(e);
                        } */
                        (e: ChangeEvent<HTMLInputElement>) => setPublicUserId(e.target?.value)
                      }
                      className="my-1 text-foreground"
                      // variant="dialog"
                    />
                  </FormControl>
                  {form.formState.errors.publicUserId
                    ? (<FormMessage className={cn('text-p text-destructive')}>
                        {form.formState.errors.publicUserId?.message?.toString()}
                    </FormMessage>)
                    : null
                  }
                </FormItem>
              )}
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
