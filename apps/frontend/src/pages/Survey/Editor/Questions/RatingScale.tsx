import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseQuestion, BaseQuestionProps } from '@/pages/Survey/Editor/Questions/BaseQuestion';
import { CLASS_NAME_SURVEY_SECTION } from '@/pages/Survey/Editor/Questions/Question';

const RatingScale = (props: BaseQuestionProps) => {
  const {
    ...baseQuestionProps
  } = props;

  const { t } = useTranslation();

  const [selectedRadio, setSelectedRadio] = React.useState<number | undefined>(undefined);

  const getScale = () => {
    const scale = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < 11; i++) {
      scale.push(
        <div
          className="ml-2 mr-2"
        >
          <input
            key={ `rating_${ baseQuestionProps.title }_${ i }` }
            type="radio"
            value={ i }
            checked={ i === selectedRadio }
            onChange={ () => setSelectedRadio(i) }
          />
          <label
            className="text-gray-900 ml-1"
          >
            { i }
          </label>
        </div>
      );
    }

    return scale;
  }

  return (
    <div>
      <BaseQuestion {...baseQuestionProps} >
        <div
          className={CLASS_NAME_SURVEY_SECTION}
        >
          <div
            className="flex"
          >
            <label
              className="block text-gray-900 text-sm"
            >
              {`${t('survey.question.mostUnlikely')}: `}
            </label>

            { getScale() }

            <label
              className="block text-gray-900 text-sm text-right"
            >
              {`${t('survey.question.mostLikely')}: `}
            </label>
          </div>
        </div>
      </BaseQuestion>
    </div>
  )
};

export default RatingScale;
