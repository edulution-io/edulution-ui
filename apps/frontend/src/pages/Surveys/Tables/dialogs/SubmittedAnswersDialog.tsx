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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import SubmittedAnswersDialogBody from '@/pages/Surveys/Tables/dialogs/SubmittedAnswersDialogBody';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSubmittedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useSubmittedAnswersDialogStore';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const SubmittedAnswersDialog = () => {
  const { selectedSurvey: survey } = useSurveysTablesPageStore();

  const {
    isOpenSubmittedAnswersDialog,
    setIsOpenSubmittedAnswersDialog,
    getSubmittedSurveyAnswers,
    answer,
    isLoading,
  } = useSubmittedAnswersDialogStore();

  const surveyId = survey?.id;
  const surveyJSON = survey?.formula;

  const { t } = useTranslation();

  useEffect((): void => {
    if (isOpenSubmittedAnswersDialog && surveyId) {
      void getSubmittedSurveyAnswers(surveyId);
    }
  }, [isOpenSubmittedAnswersDialog, surveyId]);

  const getDialogBody = () => {
    // TODO: NIEDUUI-222: Add a user selection to show answers of a selected user when current user is admin
    if (!surveyJSON) {
      return <h3 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h3>;
    }
    return (
      <ScrollArea>
        <SubmittedAnswersDialogBody
          formula={surveyJSON}
          answer={answer}
        />
      </ScrollArea>
    );
  };

  const handleClose = () => setIsOpenSubmittedAnswersDialog(!isOpenSubmittedAnswersDialog);

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      cancelButtonText="common.close"
    />
  );

  return (
    <>
      {isLoading ? <LoadingIndicatorDialog isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenSubmittedAnswersDialog}
        handleOpenChange={handleClose}
        title={t('surveys.submittedAnswersDialog.title')}
        body={getDialogBody()}
        desktopContentClassName="max-w-[75%]"
        footer={getFooter()}
      />
    </>
  );
};

export default SubmittedAnswersDialog;
