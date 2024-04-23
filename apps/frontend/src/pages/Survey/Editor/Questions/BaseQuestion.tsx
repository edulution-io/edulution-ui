import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CLASS_NAME_SURVEY_INPUT,
  CLASS_NAME_SURVEY_LABEL,
  CLASS_NAME_SURVEY_SECTION
} from "@/pages/Survey/Editor/Questions/Question.tsx";

export interface BaseQuestionProps {
  // name: string;
  title: string;
  text: string;
  description?: string;
  // isVisible?: boolean;
  // isReadOnly?: boolean;
  // isRequired?: boolean;
  // hasCommentBoxAttached?: boolean;

  children?: React.ReactNode | React.ReactNode[];
}

export const BaseQuestion = (props: BaseQuestionProps) => {
  const {
    // name,
    title,
    text = '',
    description,
    // isVisible = true,
    // isReadOnly = false,
    // isRequired = false,
    // hasCommentBoxAttached = false,

    children,
  } = props;

  const { t } = useTranslation();

  const [currentTitle, setCurrentTitle] = React.useState<string>(title);
  const [currentText, setCurrentText] = React.useState<string>(text);
  const [currentDescription, setCurrentDescription] = React.useState<string>(description);

  const getQuestionHeader = () => (
    <>
      <div
        className={CLASS_NAME_SURVEY_SECTION}
      >
        <div
          className={CLASS_NAME_SURVEY_LABEL}
        >
          <label>
            {t('survey.question.title')}
          </label>
        </div>
        <input
          className={CLASS_NAME_SURVEY_INPUT}
          type="text"
          value={currentTitle}
          onChange={(e) => setCurrentTitle(e.target.value)}
        />
      </div>
      <div
        className={CLASS_NAME_SURVEY_SECTION}
      >
        <div
          className={CLASS_NAME_SURVEY_LABEL}
        >
          <label>
            {t('survey.question.text')}
          </label>
        </div>
        <input
          className={CLASS_NAME_SURVEY_INPUT}
          type="text"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
        />
      </div>
    </>
  )

  const getQuestionFooter = () => (
    <div
      className={CLASS_NAME_SURVEY_SECTION}
    >
      <div
        className={CLASS_NAME_SURVEY_LABEL}
      >
        <label>
          {t('survey.question.description')}
        </label>
      </div>
      <input
        className={CLASS_NAME_SURVEY_INPUT}
        type="text"
        value={currentDescription}
        onChange={(e) => setCurrentDescription(e.target.value)}
      />
    </div>
  )

  return (
    <div>
      {getQuestionHeader()}
      {children}
      {getQuestionFooter()}
    </div>
  )
};

export default BaseQuestion;
