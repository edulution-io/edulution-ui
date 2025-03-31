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
import { Button } from '@/components/shared/Button';

const PublicJoinButton = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-2 mt-4 flex justify-end">
      <Button
        variant="btn-collaboration"
        size="lg"
        type="submit"
      >
        {t('common.join')}
      </Button>
    </div>
  );
};

export default PublicJoinButton;
