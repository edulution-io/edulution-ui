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
