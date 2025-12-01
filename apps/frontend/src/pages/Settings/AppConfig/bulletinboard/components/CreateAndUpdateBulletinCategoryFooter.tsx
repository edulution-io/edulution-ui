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

import { Button } from '@/components/shared/Button';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
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
            <DeleteIcon size={BUTTONS_ICON_WIDTH} />
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
