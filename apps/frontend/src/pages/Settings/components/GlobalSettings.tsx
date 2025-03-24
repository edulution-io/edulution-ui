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
import { useForm, SubmitHandler } from 'react-hook-form';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useGroupStore from '@/store/GroupStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import GlobalSettingsFloatingButtons from './GlobalSettingsFloatingButtons';

interface FormData {
  'security-groups': MultipleSelectorGroup[];
}

const GlobalSettings: React.FC = () => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();

  const form = useForm<FormData>({
    defaultValues: {
      'security-groups': [],
    },
  });

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[]) => {
    const currentGroups = form.getValues('security-groups') || [];

    const filteredCurrentGroups = currentGroups.filter((currentGroup) =>
      newGroups.some((newGroup) => newGroup.value === currentGroup.value),
    );
    const combinedGroups = [
      ...filteredCurrentGroups,
      ...newGroups.filter(
        (newGroup) => !filteredCurrentGroups.some((currentGroup) => currentGroup.value === newGroup.value),
      ),
    ];
    form.setValue('security-groups', combinedGroups, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.warn(data);
  };

  return (
    <AccordionSH
      type="multiple"
      defaultValue={['security']}
    >
      <AccordionItem value="security">
        <AccordionTrigger className="flex text-h4">
          <h4>{t('settings.globalSettings.security')}</h4>
        </AccordionTrigger>
        <AccordionContent
          style={{ overflow: 'visible' }}
          className="space-y-2 px-1"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormFieldSH
                control={form.control}
                name="security-groups"
                render={() => (
                  <FormItem>
                    <p className="font-bold">{t(`permission.groups`)}</p>
                    <FormControl>
                      <AsyncMultiSelect<MultipleSelectorGroup>
                        value={form.getValues('security-groups')}
                        onSearch={searchGroups}
                        onChange={(groups) => handleGroupsChange(groups)}
                        placeholder={t('search.type-to-search')}
                      />
                    </FormControl>
                    <p className="text-background">{t(`permission.selectGroupsDescription`)}</p>
                    <FormMessage className="text-p" />
                  </FormItem>
                )}
              />
              <GlobalSettingsFloatingButtons handleSave={form.handleSubmit(onSubmit)} />
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default GlobalSettings;
