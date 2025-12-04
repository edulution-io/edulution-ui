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
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreatorModel } from 'survey-creator-core';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import isQuestionTypeChoiceType from '@libs/survey/utils/isQuestionTypeChoiceType';
import isQuestionTypeImageType from '@libs/survey/utils/isQuestionTypeImageType';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import ChoicesByUrl from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesByUrl';
import DefaultQuestionOptions from '@/pages/Surveys/Editor/dialog/DefaultQuestionOptions';
import ImageQuestionOptions from '@/pages/Surveys/Editor/dialog/ImageQuestionOptions';
import RowAndColumnOptions from '@/pages/Surveys/Editor/dialog/matrix-options/RowAndColumnOptions';
import isQuestionTypeMatrixType from '@libs/survey/utils/isQuestionTypeMatrixType';

interface QuestionsContextMenuBodyProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreatorModel;
}

const QuestionsContextMenuBody = (props: QuestionsContextMenuBodyProps) => {
  const { form, creator } = props;

  const { selectedQuestion } = useQuestionsContextMenuStore();

  if (!selectedQuestion) return null;

  const options: React.JSX.Element[] = [];
  const questionType = selectedQuestion.getType();

  options.push(<DefaultQuestionOptions key="all-questions" />);
  if (isQuestionTypeImageType(questionType)) {
    options.push(<ImageQuestionOptions key="image-questions" />);
  }
  if (isQuestionTypeMatrixType(questionType)) {
    options.push(<RowAndColumnOptions key="matrix-options" />);
  }
  if (isQuestionTypeChoiceType(questionType)) {
    options.push(
      <ChoicesByUrl
        key="choices-by-url"
        form={form}
        creator={creator}
      />,
    );
  }

  return <div className="flex flex-col gap-2">{options}</div>;
};

export default QuestionsContextMenuBody;
