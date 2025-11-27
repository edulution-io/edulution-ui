/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import GROUPS_ID from '@libs/dashboard/constants/pageElementIds';
import useElementsTotalHeight from '@/hooks/useElementsTotalHeight';
import useLmnApiStore from '@/store/useLmnApiStore';
import { Card, CardContent } from '@/components/shared/Card';
import BadgeField from '@/components/shared/BadgeField';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';

const Groups = () => {
  const { user } = useLmnApiStore();

  const { t } = useTranslation();

  const cardContentHeight = Math.max(useElementsTotalHeight([GROUPS_ID]) - 110, 0);

  const schoolClasses = user?.schoolclasses?.map((item) => removeSchoolPrefix(item, user.school)) || [];

  return (
    <Card
      variant="organisation"
      className="h-full min-h-[200px] md:min-h-[100px]"
    >
      <CardContent>
        <h3 className="mb-6 font-bold">{t('groups.classes')}</h3>
        <div
          className="overflow-y-auto scrollbar-thin"
          style={{ flexShrink: 0, flexGrow: 0, height: `${cardContentHeight}px` }}
        >
          <BadgeField
            value={schoolClasses}
            readOnly
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Groups;
