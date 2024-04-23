import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import {
  BaseQuestion,
  BaseQuestionProps,
} from '@/pages/Survey/Editor/Questions/BaseQuestion';
import {
  CLASS_NAME_SURVEY_LABEL,
  CLASS_NAME_SURVEY_SECTION,
} from '@/pages/Survey/Editor/Questions/Question';
import Choice from "@/pages/Survey/Editor/Questions/Choice.tsx";

interface MultipleChoiceProps extends BaseQuestionProps {
  // choices?: Choice[];
  // order?: string;
  isMultiple?: boolean;
  isOtherEnabled?: boolean;
  isNoneEnabled?: boolean;
  showClearButton?: boolean;
}

const MultipleChoice = (props: MultipleChoiceProps) => {
  const {
    // choices,
    // order,
    isMultiple,
    isOtherEnabled,
    isNoneEnabled,
    showClearButton,
    ...baseQuestionProps
  } = props;

  const { t } = useTranslation();

  const [currentChoices, setCurrentChoices] = React.useState<JSX.Element[]>([]);

  // const removeChoice = (index: number) => {
  //   const newChoices = currentChoices.splice(index, 1);
  //   setCurrentChoices(newChoices)
  // }

  const addChoice = (index: number) => {

    const removeChoice = () => {
      const newChoices = currentChoices.splice(index, 1);
      setCurrentChoices(newChoices)
    }

    const newChoice = (
      <Choice
        key={ `choice_${ index }` }
        choiceIndex={ index }
        name={ `choice_${ index }` }
        removeChoice={ removeChoice }
      />
    )
    setCurrentChoices([...currentChoices, newChoice])
  }

  return (
    <div>
      <BaseQuestion {...baseQuestionProps} >

        <div>
          <div
            className={CLASS_NAME_SURVEY_SECTION}
          >
            <div
              className={CLASS_NAME_SURVEY_LABEL}
            >
              <label>
                { t('survey.question.choices') }
              </label>
            </div>
            { currentChoices }
            <Button
              variant="btn-collaboration"
              onClick={() => addChoice(currentChoices.length || 0) }
            >
              {`${t('survey.question.addChoice')}`}
            </Button>
          </div>
        </div>

      </BaseQuestion>
    </div>
  )
};

export default MultipleChoice;
