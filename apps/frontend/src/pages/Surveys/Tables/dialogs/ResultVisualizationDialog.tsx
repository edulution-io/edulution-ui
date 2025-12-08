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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import ResultVisualizationDialogBody from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialogBody';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const ResultVisualizationDialog = () => {
  const { isOpenPublicResultsVisualisationDialog, setIsOpenPublicResultsVisualisationDialog, isLoading } =
    useResultDialogStore();

  const { t } = useTranslation();

  const handleClose = () => setIsOpenPublicResultsVisualisationDialog(!isOpenPublicResultsVisualisationDialog);

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      cancelButtonText="common.close"
    />
  );

  return isOpenPublicResultsVisualisationDialog ? (
    <>
      {isLoading ? <LoadingIndicatorDialog isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsVisualisationDialog}
        handleOpenChange={() => setIsOpenPublicResultsVisualisationDialog(!isOpenPublicResultsVisualisationDialog)}
        title={t('surveys.resultChartDialog.title')}
        body={<ResultVisualizationDialogBody />}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
        footer={getFooter()}
      />
    </>
  ) : null;
};

export default ResultVisualizationDialog;
