import React, {useEffect, useState} from 'react';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import UsersSurveysTypes from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/users-surveys-types-enum.dto.ts';
import SurveyTable from '@/pages/PollsAndSurveysPage/Surveys/components/SurveyTable';
import getUsersSurveys from '@/pages/PollsAndSurveysPage/Surveys/components/dto/get-users-surveys.dto';
import { SurveyUpdateSelection } from '@/pages/PollsAndSurveysPage/Surveys/SurveyPageStore';

interface SurveyTableProps {
  surveyType: UsersSurveysTypes;
  title: string;
  updateSurveySelection: (selection: SurveyUpdateSelection) => void;
  shouldRefresh: boolean;
}

const SurveySection = (props: SurveyTableProps) => {
  const {
    surveyType,
    title,
    updateSurveySelection,
    shouldRefresh,
  } = props;

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);



  useEffect(() => {
    if (!shouldRefresh || isLoading) {
      return;
    }
    const fetchSurveys = async () => {
      setIsLoading(true);
      try {
        const response = await getUsersSurveys(surveyType);
        if (response) {
          setSurveys(response);
        }
      } catch (error) {
        console.error('Fetching surveys error: ', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSurveys();
  }, [shouldRefresh]);

  return (
    <SurveyTable
      surveyType={ surveyType }
      surveys={ surveys }
      title={ title }
      isLoading={ isLoading }
      updateSurveySelection={ updateSurveySelection }
    />
  );
};

export default SurveySection;
