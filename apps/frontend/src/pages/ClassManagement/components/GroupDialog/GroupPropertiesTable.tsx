import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/shared/Input';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

type GroupProperty = {
  labelTranslationId: string;
  name: string;
  disabled?: boolean;
  component: 'checkbox' | 'text' | 'date';
};

interface GroupPropertiesTableProps {
  isCreateMode: boolean;
  disabled?: boolean;
}

const GroupPropertiesTable = ({ isCreateMode, disabled }: GroupPropertiesTableProps) => {
  const { watch, setValue } = useFormContext();
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
          ? dayjs(watch(groupProperty.name) as string, 'yyyyMMddHHmmss.SZ').format()
          : '-';
      case 'text':
      default:
        if (groupProperty.disabled) {
          return <div>{watch(groupProperty.name)}</div>;
        }
        return <Input name={groupProperty.name} />;
    }
  };

  return (
    <div className="flex flex-col text-base text-foreground">
      <table className="w-full table-fixed">
        <tbody>
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
