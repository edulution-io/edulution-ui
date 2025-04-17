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
import ResultTableDialogBodyWrapper from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';
import './resultTableDialog.css';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const ResultTableDialog = () => {
  const { isOpenPublicResultsTableDialog, setIsOpenPublicResultsTableDialog, isLoading } = useResultDialogStore();

  const { t } = useTranslation();

  const handleClose = () => setIsOpenPublicResultsTableDialog(!isOpenPublicResultsTableDialog);

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
        body={<ResultTableDialogBodyWrapper />}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
        footer={getFooter()}
      />
    </>
  ) : null;
};

export default ResultTableDialog;
