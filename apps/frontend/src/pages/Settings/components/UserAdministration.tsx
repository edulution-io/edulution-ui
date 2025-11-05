/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { useTranslation } from 'react-i18next';
import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { GLOBAL_SETTINGS_ADMIN_GROUPS } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import useGroupStore from '@/store/GroupStore';
import { type GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import ResetMfaForm from './ResetMfaForm';

type UserAdministrationProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<GlobalSettingsDto>;
};

const UserAdministration = ({ form, onSubmit }: UserAdministrationProps<GlobalSettingsFormValues>) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();

  const { setValue, control, handleSubmit, getValues } = form;

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[]) => {
    const uniqueGroups = newGroups.reduce<MultipleSelectorGroup[]>((acc, g) => {
      if (!acc.some((x) => x.value === g.value)) acc.push(g);
      return acc;
    }, []);
    setValue(`auth.${GLOBAL_SETTINGS_ADMIN_GROUPS}`, uniqueGroups, { shouldValidate: true });
  };

  return (
    <AccordionSH
      type="multiple"
      defaultValue={['reset-mfa', 'setAdminGroup']}
      className="mt-5 space-y-10 [&>*]:rounded-lg [&>*]:bg-ciDarkGreyDisabled [&>*]:px-2"
    >
      <AccordionItem value="reset-mfa">
        <AccordionTrigger className="flex">
          <h4>{t('settings.userAdministration.resetMfaForm')}</h4>
        </AccordionTrigger>
        <AccordionContent>
          <ResetMfaForm />
        </AccordionContent>
      </AccordionItem>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AccordionItem value="setAdminGroup">
            <AccordionTrigger className="flex">
              <h4>{t('settings.userAdministration.setAdminGroupTitle')}</h4>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 px-1">
              <p className="text-background">{t('settings.userAdministration.setAdminGroupDescription')}</p>
              <FormFieldSH
                control={control}
                name={`auth.${GLOBAL_SETTINGS_ADMIN_GROUPS}`}
                render={() => (
                  <FormItem>
                    <p className="font-bold">{t('permission.groups')}</p>
                    <FormControl>
                      <AsyncMultiSelect<MultipleSelectorGroup>
                        value={getValues(`auth.${GLOBAL_SETTINGS_ADMIN_GROUPS}`) ?? []}
                        onSearch={searchGroups}
                        onChange={handleGroupsChange}
                        placeholder={t('search.type-to-search')}
                      />
                    </FormControl>
                    <p className="text-background">{t('settings.userAdministration.setAdminGroupSelectDescription')}</p>
                    <FormMessage className="text-p" />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </form>
      </Form>
    </AccordionSH>
  );
};

export default UserAdministration;
