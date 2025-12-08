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
import { Button, type ButtonProps } from '../shared/Button';

interface DialogFooterProps {
  disableSubmit?: boolean;
  disableCancel?: boolean;
  disableDelete?: boolean;
  cancelButtonText?: string;
  submitButtonText?: string;
  deleteButtonText?: string;
  submitButtonType?: 'submit' | 'button';
  cancelButtonVariant?: ButtonProps['variant'];
  submitButtonVariant?: ButtonProps['variant'];
  handleSubmit?: () => void;
  handleClose?: () => void;
  handleDelete?: () => void;
}

const DialogFooterButtons: React.FC<DialogFooterProps> = ({
  disableSubmit,
  disableCancel,
  disableDelete,
  cancelButtonText,
  submitButtonText,
  deleteButtonText,
  submitButtonType = 'button',
  cancelButtonVariant = 'btn-outline',
  submitButtonVariant = 'btn-collaboration',
  handleSubmit,
  handleClose,
  handleDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-4">
      {handleDelete && (
        <Button
          variant="btn-attention"
          disabled={disableDelete}
          size="lg"
          type="button"
          onClick={handleDelete}
        >
          {t(deleteButtonText ?? 'delete')}
        </Button>
      )}
      {handleClose && (
        <Button
          variant={cancelButtonVariant}
          disabled={disableCancel}
          size="lg"
          type="button"
          onClick={handleClose}
        >
          {t(cancelButtonText ?? 'common.cancel')}
        </Button>
      )}
      {handleSubmit && (
        <Button
          variant={submitButtonVariant}
          disabled={disableSubmit}
          size="lg"
          type={submitButtonType}
          onClick={handleSubmit}
        >
          {t(submitButtonText ?? 'common.save')}
        </Button>
      )}
    </div>
  );
};

export default DialogFooterButtons;
