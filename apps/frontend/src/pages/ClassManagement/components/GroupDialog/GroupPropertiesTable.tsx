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

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import GroupForm from '@libs/groups/types/groupForm';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/shared/Input';
import { FormMessage } from '@/components/ui/Form';
import useLdapGroups from '@/hooks/useLdapGroups';
import useClassManagementStore from '../../useClassManagementStore';

dayjs.extend(customParseFormat);

type GroupProperty = {
  labelTranslationId: string;
  name: keyof Omit<GroupForm, 'admins' | 'admingroups' | 'members' | 'membergroups'>;
  disabled?: boolean;
  component: 'checkbox' | 'text' | 'date' | 'number';
};

interface GroupPropertiesTableProps {
  isCreateMode: boolean;
  disabled?: boolean;
  form: UseFormReturn<GroupForm>;
}

const GroupPropertiesTable = ({ isCreateMode, disabled, form }: GroupPropertiesTableProps) => {
  const { watch, setValue, register, formState } = form;
  const { t } = useTranslation();
  const { selectedSchool } = useClassManagementStore();
  const { isSuperAdmin } = useLdapGroups();

  useEffect(() => {
    if (isSuperAdmin) {
      form.setValue('school', selectedSchool);
    }
  }, [selectedSchool]);

  const groupProperties: GroupProperty[] = [
    {
      labelTranslationId: 'common.description',
      name: 'description',
      disabled,
      component: 'text',
    },
    {
      labelTranslationId: 'common.school',
      name: 'school',
      disabled: true,
      component: 'text',
    },
    {
      labelTranslationId: 'common.creationDate',
      name: 'creationDate',
      disabled: true,
      component: 'date',
    },
    {
      labelTranslationId: 'classmanagement.hide',
      name: 'hide',
      disabled,
      component: 'checkbox',
    },
    {
      labelTranslationId: 'classmanagement.isJoinable',
      name: 'join',
      disabled,
      component: 'checkbox',
    },
    {
      labelTranslationId: 'common.mailList',
      name: 'maillist',
      disabled,
      component: 'checkbox',
    },
    {
      labelTranslationId: 'classmanagement.sharedMailBox',
      name: 'mailalias',
      disabled,
      component: 'checkbox',
    },
    {
      labelTranslationId: 'classmanagement.mailQuota',
      name: 'mailquota',
      disabled,
      component: 'number',
    },
    {
      labelTranslationId: 'classmanagement.proxyAddresses',
      name: 'proxyAddresses',
      disabled,
      component: 'text',
    },
    {
      labelTranslationId: 'classmanagement.quota',
      name: 'quota',
      disabled,
      component: 'text',
    },
  ];

  const getComponent = (groupProperty: GroupProperty) => {
    switch (groupProperty.component) {
      case 'checkbox':
        return (
          <Checkbox
            className="ml-1"
            checked={!!watch(groupProperty.name)}
            disabled={groupProperty.disabled}
            onCheckedChange={(checked) => setValue(groupProperty.name, !!checked)}
            aria-label={t(groupProperty.labelTranslationId)}
          />
        );
      case 'date':
        return (
          <div className="ml-2">
            {watch(groupProperty.name)
              ? dayjs(watch(groupProperty.name) as string, 'YYYYMMDDHHmmss.S[Z]')
                  .toDate()
                  .toLocaleString()
              : '-'}
          </div>
        );
      case 'number':
        if (groupProperty.disabled) {
          return <div className="ml-2">{watch(groupProperty.name)}</div>;
        }
        return (
          <Input
            {...register(groupProperty.name)}
            min="0"
            step="1"
            type="number"
            variant={disabled ? 'default' : 'dialog'}
          />
        );
      case 'text':
      default:
        if (groupProperty.disabled) {
          return <div className="ml-2">{watch(groupProperty.name)}</div>;
        }
        return (
          <Input
            {...register(groupProperty.name)}
            placeholder={t(`classmanagement.${groupProperty.name}Placeholder`)}
            variant={disabled ? 'default' : 'dialog'}
          />
        );
    }
  };

  return (
    <div className="flex flex-col text-base text-background">
      <table className="w-full table-fixed">
        <tbody>
          <tr>
            <td className="w-1/2 border p-2 text-left ">{t('classmanagement.systemName')}</td>
            <td className="w-1/2 border p-2">{watch('name')}</td>
          </tr>
          {groupProperties
            .filter((groupProperty) => isCreateMode || watch(groupProperty.name) !== undefined)
            .map((groupProperty) => (
              <tr key={groupProperty.name}>
                <td className="w-1/2 border p-2 text-left ">{t(groupProperty.labelTranslationId)}</td>
                <td className="w-1/2 border p-2">
                  {getComponent(groupProperty)}
                  {formState.errors[groupProperty.name] && (
                    <FormMessage className="text-[0.8rem] font-medium text-background">
                      {formState.errors[groupProperty.name]?.message?.toString()}
                    </FormMessage>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupPropertiesTable;
