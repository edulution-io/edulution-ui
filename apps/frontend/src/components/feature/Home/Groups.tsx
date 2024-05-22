import React from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';
import userStore from '@/store/userStore';

const Groups = () => {
  const { userInfo } = userStore();
  const { t } = useTranslation();
  return (
    <Card
      variant="organisation"
      className="h-full"
    >
      <CardContent>
        <div className="flex flex-col gap-1">
          <h4 className="text-md font-bold">{t('groupsPage.classes')}</h4>
          {userInfo?.ldapGroups.classes.map((group) => (
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
