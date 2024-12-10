import React from 'react';
import { useTranslation } from 'react-i18next';
import { GROUPS_ID } from '@libs/dashboard/constants/pageElementIds';
import { Card, CardContent } from '@/components/shared/Card';
import useLmnApiStore from '@/store/useLmnApiStore';
import BadgeField from '@/components/shared/BadgeField';
import useElementHeight from '@/hooks/useElementHeight';

const Groups = () => {
  const { user } = useLmnApiStore();

  const { t } = useTranslation();

  const contentHeight = useElementHeight([GROUPS_ID]) - 110;

  return (
    <Card
      variant="organisation"
      style={{ minHeight: '280px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <div className="flex flex-col gap-2 p-0">
          <h4 className="mb-4 font-bold">{t('groups.classes')}</h4>
          <div style={{ height: `${contentHeight}px`, overflowY: 'auto' }}>
            <BadgeField
              value={user?.schoolclasses || []}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Groups;
