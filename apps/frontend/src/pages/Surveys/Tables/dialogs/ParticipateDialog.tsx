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

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/ParticipateDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';

const ParticipateDialog = () => {
  const { selectedSurvey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const {
    isOpenParticipateSurveyDialog,
    setIsOpenParticipateSurveyDialog,
    answer,
    setAnswer,
    pageNo,
    setPageNo,
    answerSurvey,
    isLoading,
  } = useParticipateDialogStore();

  const { t } = useTranslation();

  const content = useMemo(() => {
    if (!selectedSurvey) {
      return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
    }
    return (
      <ScrollArea>
        <ParticipateDialogBody
          surveyId={selectedSurvey.id}
          saveNo={selectedSurvey.saveNo}
          formula={selectedSurvey.formula}
          answer={answer}
          setAnswer={setAnswer}
          pageNo={pageNo}
          setPageNo={setPageNo}
          submitAnswer={answerSurvey}
          updateOpenSurveys={updateOpenSurveys}
          updateAnsweredSurveys={updateAnsweredSurveys}
          setIsOpenParticipateSurveyDialog={setIsOpenParticipateSurveyDialog}
          className="max-h-[75vh] overflow-y-auto rounded bg-gray-600 p-4"
        />
      </ScrollArea>
    );
  }, [selectedSurvey, answer, pageNo]);

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      {isOpenParticipateSurveyDialog ? (
        <AdaptiveDialog
          isOpen={isOpenParticipateSurveyDialog}
          handleOpenChange={() => setIsOpenParticipateSurveyDialog(!isOpenParticipateSurveyDialog)}
          title={t('surveys.participateDialog.title')}
          body={content}
          desktopContentClassName="max-w-[75%]"
        />
      ) : null}
    </>
  );
};

export default ParticipateDialog;
