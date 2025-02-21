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

import { Button } from '@/components/shared/Button';
import { MdDelete, MdUpdate } from 'react-icons/md';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BUTTONS_ICON_WIDTH } from '@libs/ui/constants';

interface CreateAndUpdateBulletinCategoryFooterProps {
  handleFormSubmit: (e: React.FormEvent) => void;
  isCurrentNameEqualToSelected: () => boolean;
  isSaveButtonDisabled: () => boolean;
  handleDeleteCategory: () => void;
}

const CreateAndUpdateBulletinCategoryFooter = ({
  handleFormSubmit,
  isCurrentNameEqualToSelected,
  isSaveButtonDisabled,
  handleDeleteCategory,
}: CreateAndUpdateBulletinCategoryFooterProps) => {
  const { t } = useTranslation();
  return (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-4"
    >
      <div className="mt-4 flex justify-end space-x-2">
        {isCurrentNameEqualToSelected() && (
          <Button
            variant="btn-attention"
            size="lg"
            type="button"
            onClick={() => handleDeleteCategory()}
          >
            <MdDelete size={BUTTONS_ICON_WIDTH} />
            {t('common.delete')}
          </Button>
        )}

        <Button
          variant="btn-collaboration"
          size="lg"
          disabled={isSaveButtonDisabled()}
          type="submit"
        >
          <MdUpdate size={BUTTONS_ICON_WIDTH} />
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default CreateAndUpdateBulletinCategoryFooter;
