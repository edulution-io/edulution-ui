import React from 'react';
import { Card, CardContent } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';
import BadgeField from '@/components/shared/BadgeField';

const Groups = () => {
  const { user } = useLmnApiStore();

  const { t } = useTranslation();
  return (
    <Card
      variant="organisation"
      className="h-full"
    >
      <CardContent>
        <div className="flex flex-col gap-1">
          <h4 className="text-md font-bold">{t('groups.classes')}</h4>
          <BadgeField
            value={user?.schoolclasses || []}
            onChange={() => {}}
            readOnly
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Groups;
