import React from 'react';
import { useTranslation } from 'react-i18next';
import { GROUPS_ID } from '@libs/dashboard/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import useLmnApiStore from '@/store/useLmnApiStore';
import { Card, CardContent } from '@/components/shared/Card';
import BadgeField from '@/components/shared/BadgeField';

const Groups = () => {
  const { user } = useLmnApiStore();

  const { t } = useTranslation();

  const cardContentHeight = Math.max(useElementHeight([GROUPS_ID]) - 110, 0);
  return (
    <Card variant="organisation">
      <CardContent>
        <h4 className="mb-6 font-bold">{t('groups.classes')}</h4>
        <div
          className="overflow-y-auto scrollbar-thin"
          style={{ flexShrink: 0, flexGrow: 0, height: `${cardContentHeight}px` }}
        >
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
