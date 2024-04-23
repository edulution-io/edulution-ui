import React from 'react';
import { useTranslation } from 'react-i18next';
import DropdownMenu, { DropdownOptions } from '@/components/ui/DropdownMenu/DropdownMenu';
import MultipleChoice from '@/pages/Survey/Editor/Questions/MultipleChoice';
import BaseQuestion from '@/pages/Survey/Editor/Questions/BaseQuestion';
import RatingScale from '@/pages/Survey/Editor/Questions/RatingScale';

export const CLASS_NAME_SURVEY_SECTION = "mb-4"
export const CLASS_NAME_SURVEY_LABEL = "text-gray-900"
export const CLASS_NAME_SURVEY_INPUT = "text-sm text-gray-500 p-2 h-10 w-full"

enum QuestionTypes {
  TEXT = 'Text',
  MULTIPLE_CHOICE = 'MultipleChoice',
  RATING_SCALE = 'RatingScale',
}

export const Question = () => {
  const { t } = useTranslation();

  const types = Object.values(QuestionTypes);
  const answerTypes: DropdownOptions[] = types.map(
    (type) => ({ id: type, name: `${ t(type) }` })
  );

  const [currentType, setCurrentType] = React.useState<string>(QuestionTypes.TEXT.toString());

  const emptyQuestion = {
    title: '',
    text: '',
    description: '',
  }

  const getQuestion = () => {
    switch (currentType) {
      case QuestionTypes.TEXT.toString():
        return <BaseQuestion {...emptyQuestion} />;
      case QuestionTypes.MULTIPLE_CHOICE.toString():
        return <MultipleChoice {...emptyQuestion} />
      case QuestionTypes.RATING_SCALE.toString():
        return <RatingScale {...emptyQuestion} />
      default:
        return null;
    }
  }

  return (
    <div>
      <div
        className={CLASS_NAME_SURVEY_SECTION}
      >
        <div
          className={CLASS_NAME_SURVEY_LABEL}
        >
          <label>
            {t('survey.question.type')}
          </label>
        </div>
        <DropdownMenu
          options={answerTypes}
          selectedVal={currentType}
          handleChange={setCurrentType}
        />
      </div>
      {getQuestion()}
    </div>
  )
};

export default Question;
