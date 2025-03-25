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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useGroupStore from '@/store/GroupStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import {
  GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS,
  GLOBAL_SETTINGS_PROJECTION_PARAM_AUTH,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import GlobalSettingsFloatingButtons from './GlobalSettingsFloatingButtons';
import useGlobalSettingsApiStore from './useGlobalSettingsApiStore';

interface FormData {
  mfaEnforcedGroups: MultipleSelectorGroup[];
}

const GlobalSettings: React.FC = () => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { mfaEnforcedGroups, getGlobalSettings, setGlobalSettings } = useGlobalSettingsApiStore();

  const form = useForm<FormData>({
    defaultValues: {
      mfaEnforcedGroups: [],
    },
  });

  useEffect(() => {
    void getGlobalSettings(GLOBAL_SETTINGS_PROJECTION_PARAM_AUTH);
  }, []);

  useEffect(() => {
    if (mfaEnforcedGroups) {
      form.setValue(GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS, mfaEnforcedGroups);
    }
  }, [mfaEnforcedGroups]);

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[]) => {
    const currentGroups = form.getValues(GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS) || [];

    const filteredCurrentGroups = currentGroups.filter((currentGroup) =>
      newGroups.some((newGroup) => newGroup.value === currentGroup.value),
    );
    const combinedGroups = [
      ...filteredCurrentGroups,
      ...newGroups.filter(
        (newGroup) => !filteredCurrentGroups.some((currentGroup) => currentGroup.value === newGroup.value),
      ),
    ];
    form.setValue(GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS, combinedGroups, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const newGlobalSettingsDto: GlobalSettingsDto = { auth: { mfaEnforcedGroups: data.mfaEnforcedGroups } };

    void setGlobalSettings(newGlobalSettingsDto);
  };

  return (
    <>
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
                  name={GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS}
                  render={() => (
                    <FormItem>
                      <p className="font-bold">{t(`permission.groups`)}</p>
                      <FormControl>
                        <AsyncMultiSelect<MultipleSelectorGroup>
                          value={form.getValues(GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS)}
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
              </form>
            </Form>
          </AccordionContent>
        </AccordionItem>
      </AccordionSH>
      <GlobalSettingsFloatingButtons handleSave={form.handleSubmit(onSubmit)} />
    </>
  );
};

export default GlobalSettings;
