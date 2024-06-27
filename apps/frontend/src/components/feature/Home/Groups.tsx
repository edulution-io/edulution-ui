import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';
import waitForToken from '@/api/common';
import useLmnApiStore from '@/store/lmnApiStore';

const Groups = () => {
  const { user, getUserData } = useLmnApiStore();

  useEffect(() => {
    if (!user) {
      const getUserGroupDataQuery = async () => {
        await waitForToken();
        getUserData().catch(console.error);
      };

      getUserGroupDataQuery().catch(console.error);
    }
  }, [user]);
  const { t } = useTranslation();
  return (
    <Card
      variant="organisation"
      className="h-full"
    >
      <CardContent>
        <div className="flex flex-col gap-1">
          <h4 className="text-md font-bold">{t('groupsPage.classes')}</h4>
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
