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

import NameInputWithAvailability from '@/pages/BulletinBoard/components/NameInputWithAvailability';
import DialogSwitch from '@/components/shared/DialogSwitch';
import { Form, FormControl, FormDescription, FormFieldSH, FormItem } from '@/components/ui/Form';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import { useTranslation } from 'react-i18next';
import { DropdownSelect } from '@/components';
import BulletinVisibilityStatesType from '@libs/bulletinBoard/types/bulletinVisibilityStatesType';
import BULLETIN_VISIBILITY_STATES from '@libs/bulletinBoard/constants/bulletinVisibilityStates';
import AccessGroupMultiSelect from '@/components/shared/AccessGroupMultiSelect';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

interface CreateAndUpdateBulletinCategoryBodyProps {
  handleFormSubmit: (e: React.FormEvent) => void;
  form: UseFormReturn<CreateBulletinCategoryDto>;
  isCurrentNameEqualToSelected: () => boolean;
  accessGroups: MultipleSelectorGroup[];
}

const CreateAndUpdateBulletinCategoryBody = ({
  handleFormSubmit,
  form,
  isCurrentNameEqualToSelected,
  accessGroups,
}: CreateAndUpdateBulletinCategoryBodyProps) => {
  const { t } = useTranslation();

  const { setValue, watch } = form;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('name', e.target.value, { shouldValidate: true });
  };

  const handleVisibilityStateChange = (visibilityState: string) => {
    form.setValue('bulletinVisibility', BULLETIN_VISIBILITY_STATES[visibilityState as BulletinVisibilityStatesType]);
  };

  const bulletinVisibilityOptions = Object.keys(BULLETIN_VISIBILITY_STATES).map((s) => ({
    name: t(`bulletinboard.categories.${s}`),
    id: BULLETIN_VISIBILITY_STATES[s as BulletinVisibilityStatesType],
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <NameInputWithAvailability
            form={form}
            placeholder={t('bulletinboard.categoryName')}
            onValueChange={handleNameChange}
            shouldAvailabilityStatusShow={form.formState.isValid && !isCurrentNameEqualToSelected()}
          />
        </div>

        <DialogSwitch
          translationId="bulletinboard.isActive"
          checked={watch('isActive')}
          onCheckedChange={(isChecked) => {
            form.setValue('isActive', isChecked);
          }}
        />

        <FormFieldSH
          control={form.control}
          name="bulletinVisibility"
          render={({ field }) => (
            <FormItem>
              <p className="font-bold">{t('bulletinboard.categories.visibilityState')}</p>
              <FormControl>
                <DropdownSelect
                  options={bulletinVisibilityOptions}
                  selectedVal={field.value || BULLETIN_VISIBILITY_STATES.FULLY_VISIBLE}
                  handleChange={handleVisibilityStateChange}
                  variant="dialog"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormFieldSH
          control={form.control}
          name="visibleForGroups"
          render={() => (
            <FormItem>
              <p className="font-bold">{t('bulletinboard.categories.visibleByUsersAndGroupsTitle')}</p>
              <FormDescription>{t('bulletinboard.categories.visibleByUsersAndGroups')}</FormDescription>
              <FormControl>
                <AccessGroupMultiSelect
                  value={watch('visibleForGroups')}
                  options={accessGroups}
                  onChange={(groups: MultipleSelectorGroup[]) =>
                    setValue('visibleForGroups', groups, { shouldValidate: true })
                  }
                  variant="dialog"
                />
              </FormControl>
              <FormDescription>{t('bulletinboard.categories.accessGroupsOnlyHint')}</FormDescription>
            </FormItem>
          )}
        />

        <FormFieldSH
          control={form.control}
          name="editableByGroups"
          render={() => (
            <FormItem>
              <p className="font-bold">{t('bulletinboard.categories.editableByUsersAndGroupsTitle')}</p>
              <FormDescription>{t('bulletinboard.categories.editableByUsersAndGroups')}</FormDescription>
              <FormControl>
                <AccessGroupMultiSelect
                  value={watch('editableByGroups')}
                  options={accessGroups}
                  onChange={(groups: MultipleSelectorGroup[]) =>
                    setValue('editableByGroups', groups, { shouldValidate: true })
                  }
                  variant="dialog"
                />
              </FormControl>
              <FormDescription>{t('bulletinboard.categories.accessGroupsOnlyHint')}</FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default CreateAndUpdateBulletinCategoryBody;
