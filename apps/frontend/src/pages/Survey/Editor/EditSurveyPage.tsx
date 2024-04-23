import React, {useEffect} from 'react';
import { Model } from 'survey-core';
import { useTranslation } from "react-i18next";
import { Button } from '@/components/shared/Button';
import Question, {
  CLASS_NAME_SURVEY_INPUT,
  CLASS_NAME_SURVEY_LABEL,
  CLASS_NAME_SURVEY_SECTION
} from '@/pages/Survey/Editor/Questions/Question';

interface EditSurveyPageProps {
  pageIndex: string;
  pageName: string;
  // survey: Model;
}

const EditSurveyPage = (props: EditSurveyPageProps) => {
  const {
    pageIndex,
    pageName,
    // survey
  } = props;

  const { t } = useTranslation();

  const [questions, setQuestions] = React.useState<JSX.Element[]>([]);

  const [title, setTitle] = React.useState<string>(pageName);
  const [description, setDescription] = React.useState<string>('');

  useEffect(() => {
    // survey.addNewPage(pageName);
  }, [title]);

  const deleteQuestion = (index: number) => {
    if (questions.length === 1) {
      setQuestions([])
      return;
    }
    const newQuestions = questions.splice(index, 1);
    setQuestions(newQuestions);
  }

  const addQuestion = () => {
    const newQuestion = (
      <Question
        // survey={ survey }
      />
    );
    if (questions.length === 0) {
      setQuestions([newQuestion]);
      return;
    }
    setQuestions([ ...questions, newQuestion]);
  }

  return (
    <div>
      <h2
        className={ CLASS_NAME_SURVEY_LABEL }
      >{ `${ t('survey.page.page') }: ` } { pageIndex }</h2>

      <div
        className={ CLASS_NAME_SURVEY_SECTION }
      >
        <div
          className={ CLASS_NAME_SURVEY_LABEL }
        >
          <label>
            { t('survey.page.title') }
          </label>
        </div>
        <input
          className={ CLASS_NAME_SURVEY_INPUT }
          type="text"
          value={title}
          onChange={ (e) => setTitle(e.target.value) }
        />
      </div>

      <div
        className={ CLASS_NAME_SURVEY_SECTION }
      >
        <div
          className={ CLASS_NAME_SURVEY_LABEL }
        >
          <label>
            {t('survey.page.description')}
          </label>
        </div>
        <input
          className={ CLASS_NAME_SURVEY_INPUT }
          type="text"
          value={ description }
          onChange={ (e) => setDescription(e.target.value) }
        />
      </div>

      { questions.map(
        (question, index) =>
          <div
            className="bg-gray-100 shadow border p-2 rounded mb-10"
            // eslint-disable-next-line react/no-array-index-key
            key={`survey_page_${ pageIndex }_-_question_${ index }`}
          >
            <h4
              className={ CLASS_NAME_SURVEY_LABEL }
            >{ `${ t('survey.question.question') }: ` } { index }</h4>

            {question}
            <div className="flex justify-end">
              <Button
                variant="btn-collaboration"
                onClick={() => deleteQuestion(index)}
              >
                {t('survey.question.remove')}
              </Button>
            </div>
          </div>
      )}
      <Button
        variant="btn-collaboration"
        onClick={ () => addQuestion() }
      >
        { `${ t('survey.question.add') }` }
      </Button>
    </div>
  )
};

export default EditSurveyPage;
