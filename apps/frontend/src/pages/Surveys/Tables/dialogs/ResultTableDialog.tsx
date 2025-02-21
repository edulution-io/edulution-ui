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
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import ResultTableDialogBodyWrapper from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';
import './resultTableDialog.css';

const ResultTableDialog = () => {
  const { isOpenPublicResultsTableDialog, setIsOpenPublicResultsTableDialog, isLoading } = useResultDialogStore();

  const { t } = useTranslation();

  return isOpenPublicResultsTableDialog ? (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsTableDialog}
        handleOpenChange={() => setIsOpenPublicResultsTableDialog(!isOpenPublicResultsTableDialog)}
        title={t('surveys.resultTableDialog.title')}
        body={<ResultTableDialogBodyWrapper />}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
      />
    </>
  ) : null;
};

export default ResultTableDialog;
