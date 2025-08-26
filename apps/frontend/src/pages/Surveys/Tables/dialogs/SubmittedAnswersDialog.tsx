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
      return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
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
