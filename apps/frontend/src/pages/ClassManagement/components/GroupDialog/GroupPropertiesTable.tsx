import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Checkbox from '@/components/ui/Checkbox';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import GroupForm from '@libs/groups/types/groupForm';
import Input from '@/components/shared/Input';

dayjs.extend(customParseFormat);

type GroupProperty = {
  labelTranslationId: string;
  name: keyof Omit<GroupForm, 'admins' | 'admingroups' | 'members' | 'membergroups'>;
  disabled?: boolean;
  component: 'checkbox' | 'text' | 'date';
};

interface GroupPropertiesTableProps {
  isCreateMode: boolean;
  disabled?: boolean;
  form: UseFormReturn<GroupForm>;
}

const GroupPropertiesTable = ({ isCreateMode, disabled, form }: GroupPropertiesTableProps) => {
  const { watch, setValue, register } = form;
  const { t } = useTranslation();

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
  ];

  const getComponent = (groupProperty: GroupProperty) => {
    switch (groupProperty.component) {
      case 'checkbox':
        return (
          <Checkbox
            checked={!!watch(groupProperty.name)}
            disabled={groupProperty.disabled}
            onCheckedChange={(checked) => setValue(groupProperty.name, !!checked)}
            aria-label={t(groupProperty.labelTranslationId)}
          />
        );
      case 'date':
        return watch(groupProperty.name)
          ? dayjs(watch(groupProperty.name) as string, 'YYYYMMDDHHmmss.S[Z]').format()
          : '-';
      case 'text':
      default:
        if (groupProperty.disabled) {
          return watch(groupProperty.name);
        }
        return (
          <Input
            {...register(groupProperty.name)}
            variant="light"
          />
        );
    }
  };

  return (
    <div className="flex flex-col text-base text-foreground">
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
                <td className="w-1/2 border p-2">{getComponent(groupProperty)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupPropertiesTable;
