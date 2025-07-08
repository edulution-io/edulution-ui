/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
        <h4 className="mb-6 font-bold">{t('groups.classes')}</h4>
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
