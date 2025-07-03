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
import { Button, type ButtonProps } from '../shared/Button';

interface DialogFooterProps {
  disableSubmit?: boolean;
  disableCancel?: boolean;
  cancelButtonText?: string;
  submitButtonText?: string;
  submitButtonType?: 'submit' | 'button';
  cancelButtonVariant?: ButtonProps['variant'];
  submitButtonVariant?: ButtonProps['variant'];
  handleSubmit?: () => void;
  handleClose?: () => void;
}

const DialogFooterButtons: React.FC<DialogFooterProps> = ({
  disableSubmit,
  disableCancel,
  cancelButtonText,
  submitButtonText,
  submitButtonType = 'button',
  cancelButtonVariant = 'btn-outline',
  submitButtonVariant = 'btn-collaboration',
  handleSubmit,
  handleClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4 flex justify-end gap-4">
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
