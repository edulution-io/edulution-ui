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
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreatorModel } from 'survey-creator-core';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import isQuestionTypeChoiceType from '@libs/survey/utils/isQuestionTypeChoiceType';
import isQuestionTypeImageType from '@libs/survey/utils/isQuestionTypeImageType';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import ChoicesByUrl from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesByUrl';
import DefaultQuestionOptions from '@/pages/Surveys/Editor/dialog/DefaultQuestionOptions';
import ImageQuestionOptions from '@/pages/Surveys/Editor/dialog/ImageQuestionOptions';

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
