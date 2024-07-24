import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/shared/Input';

type GroupProperty = {
  labelTranslationId: string;
  name: string;
  disabled?: boolean;
  component: 'checkbox' | 'text';
};

interface GroupPropertiesTableProps {
  isCreateMode: boolean;
}

const GroupPropertiesTable = ({ isCreateMode }: GroupPropertiesTableProps) => {
  const { watch, setValue } = useFormContext();
  const { t } = useTranslation();

  const groupProperties: GroupProperty[] = [
    {
      labelTranslationId: 'common.description',
      name: 'description',
      component: 'text',
    },
    {
      labelTranslationId: 'common.type',
      name: 'type',
      disabled: true,
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
      component: 'text',
    },
    {
      labelTranslationId: 'classmanagement.hide',
      name: 'hide',
      component: 'checkbox',
    },
    {
      labelTranslationId: 'classmanagement.isJoinable',
      name: 'join',
      component: 'checkbox',
    },
    {
      labelTranslationId: 'common.mailList',
      name: 'mailList',
      component: 'checkbox',
    },
  ];

  const getComponent = (groupProperty: GroupProperty) => {
    switch (groupProperty.component) {
      default:
      case 'text':
        if (groupProperty.disabled) {
          return <div>{watch(groupProperty.name)}</div>;
        } else {
          return <Input name={groupProperty.name} />;
        }
      case 'checkbox':
        return (
          <Checkbox
            checked={watch(groupProperty.name)}
            onCheckedChange={(checked) => setValue(groupProperty.name, !!checked)}
            aria-label={t(groupProperty.labelTranslationId)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col text-base text-foreground">
      <table className="w-full table-fixed">
        <tbody>
          {groupProperties
            .filter((groupProperty) => isCreateMode || watch(groupProperty.name))
            .map((groupProperty) => (
              <tr key={groupProperty.name}>
                <td className="w-3/4 border p-2 text-left ">{t(groupProperty.labelTranslationId)}</td>
                <td className="w-1/4 border p-2">{getComponent(groupProperty)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupPropertiesTable;
