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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useDesktopDeploymentStore from '../DesktopDeploymentStore';

type ConnectionErrorProps = {
  handleReload: () => void;
};
const ConnectionErrorDialog: React.FC<ConnectionErrorProps> = ({ handleReload }) => {
  const { t } = useTranslation();
  const { error, setError, setIsVdiConnectionOpen } = useDesktopDeploymentStore();

  const getDialogBody = () => <p className="text-background">{t('desktopdeployment.error.description')}</p>;

  const handleClose = () => {
    setError(null);
    setIsVdiConnectionOpen(false);
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-between gap-5">
      <Button
        variant="btn-collaboration"
        size="lg"
        type="button"
        onClick={() => handleReload()}
      >
        {t('common.reload')}
      </Button>
      <Button
        variant="btn-collaboration"
        size="lg"
        type="button"
        onClick={handleClose}
      >
        {t('common.close')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={!!error}
      handleOpenChange={handleClose}
      title={t('desktopdeployment.error.title')}
      body={getDialogBody()}
      desktopContentClassName="w-1/3"
      footer={getFooter()}
    />
  );
};

export default ConnectionErrorDialog;
