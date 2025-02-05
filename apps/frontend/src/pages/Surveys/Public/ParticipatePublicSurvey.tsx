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

import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/ParticipateDialogBody';
import useParticipatePublicSurveyStore from '@/pages/Surveys/Public/useParticipatePublicSurveyStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { ScrollArea } from '@/components/ui/ScrollArea';

const ParticipatePublicSurvey = (): React.ReactNode => {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get('surveyId');

  const { getPublicSurvey, publicSurvey, answer, setAnswer, pageNo, setPageNo, answerPublicSurvey, isFetching } =
    useParticipatePublicSurveyStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (surveyId) {
      void getPublicSurvey(surveyId);
    }
  }, [surveyId]);

  const content = useMemo(() => {
    if (!surveyId || !publicSurvey) {
      return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
    }
    return (
      <ScrollArea>
        <ParticipateDialogBody
          surveyId={publicSurvey.id}
          saveNo={publicSurvey.saveNo}
          formula={publicSurvey.formula}
          answer={answer}
          setAnswer={setAnswer}
          pageNo={pageNo}
          setPageNo={setPageNo}
          submitAnswer={answerPublicSurvey}
          updateOpenSurveys={() => {}}
          updateAnsweredSurveys={() => {}}
          setIsOpenParticipateSurveyDialog={() => {}}
          className="survey-participation"
        />
      </ScrollArea>
    );
  }, [surveyId, publicSurvey, answer, pageNo]);

  return (
    <>
      {isFetching ? <LoadingIndicator isOpen={isFetching} /> : null}
      {content}
    </>
  );
};

export default ParticipatePublicSurvey;
