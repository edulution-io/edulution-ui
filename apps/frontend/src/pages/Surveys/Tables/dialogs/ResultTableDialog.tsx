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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import ResultTableDialogBody from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';

const ResultTableDialog = () => {
  const { isOpenPublicResultsTableDialog, setIsOpenPublicResultsTableDialog, isLoading } = useResultDialogStore();

  const { t } = useTranslation();

  const handleClose = () => setIsOpenPublicResultsTableDialog(!isOpenPublicResultsTableDialog);
  const getBody = () => (
    <div className="h-full w-full overflow-x-auto overflow-y-auto scrollbar-thin">
      <ResultTableDialogBody />
    </div>
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      cancelButtonText="common.close"
    />
  );

  return isOpenPublicResultsTableDialog ? (
    <>
      {isLoading ? <LoadingIndicatorDialog isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsTableDialog}
        handleOpenChange={handleClose}
        title={t('surveys.resultTableDialog.title')}
        body={getBody()}
        footer={getFooter()}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
      />
    </>
  ) : null;
};

export default ResultTableDialog;
