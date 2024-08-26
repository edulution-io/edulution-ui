import React from 'react';
import { Card, CardContent } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';

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
          {user?.schoolclasses.map((group) => (
            <div
              key={group}
              className="flex flex-col"
            >
              <p className="text-nowrap">{group}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Groups;
