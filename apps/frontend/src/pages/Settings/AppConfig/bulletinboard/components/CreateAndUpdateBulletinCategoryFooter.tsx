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
import { MdDelete } from 'react-icons/md';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BUTTONS_ICON_WIDTH } from '@libs/ui/constants';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface CreateAndUpdateBulletinCategoryFooterProps {
  handleFormSubmit: (e: React.FormEvent) => void;
  isCurrentNameEqualToSelected: () => boolean;
  isSaveButtonDisabled: () => boolean;
  handleDeleteCategory: () => void;
  handleClose: () => void;
}

const CreateAndUpdateBulletinCategoryFooter = ({
  handleFormSubmit,
  isCurrentNameEqualToSelected,
  isSaveButtonDisabled,
  handleDeleteCategory,
  handleClose,
}: CreateAndUpdateBulletinCategoryFooterProps) => {
  const { t } = useTranslation();
  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex gap-4">
        {isCurrentNameEqualToSelected() && (
          <Button
            className="mt-4"
            variant="btn-attention"
            size="lg"
            type="button"
            onClick={() => handleDeleteCategory()}
          >
            <MdDelete size={BUTTONS_ICON_WIDTH} />
            {t('common.delete')}
          </Button>
        )}

        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={() => {}}
          submitButtonText="common.save"
          disableSubmit={isSaveButtonDisabled()}
          submitButtonType="submit"
        />
      </div>
    </form>
  );
};

export default CreateAndUpdateBulletinCategoryFooter;
