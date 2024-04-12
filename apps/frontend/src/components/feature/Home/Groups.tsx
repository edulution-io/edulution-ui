import React, { useEffect } from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';
import useLmnUserStore from '@/store/lmnUserStore';
import { waitForToken } from '@/api/common';

const Groups = () => {
  const { user, getUser } = useLmnUserStore((state) => ({
    getUser: state.getUser,
    user: state.user,
  }));

  useEffect(() => {
    if (!user) {
      const getUserGroupInfo = async () => {
        await waitForToken();
        getUser().catch(console.error);
      };

      getUserGroupInfo().catch(console.error);
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
