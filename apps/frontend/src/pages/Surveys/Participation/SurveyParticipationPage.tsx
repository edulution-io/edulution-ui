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

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SurveyParticipation from '@/pages/Surveys/Participation/SurveyParticipation';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import PageLayout from '@/components/structure/layout/PageLayout';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import '../theme/custom.participation.css';

interface SurveyParticipationPageProps {
  isPublic: boolean;
}

const SurveyParticipationPage = (props: SurveyParticipationPageProps): React.ReactNode => {
  const { isPublic = false } = props;
  const { surveyId } = useParams();
  const { reset, selectedSurvey, fetchSelectedSurvey, isFetching } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (surveyId) {
      void fetchSelectedSurvey(surveyId, isPublic);
    } else {
      reset();
    }
  }, [surveyId]);

  const getBody = () => {
    if (!surveyId) {
      return (
        <div className="relative top-1/3 flex justify-center">
          <h4>{t('survey.notFound')}</h4>
        </div>
      );
    }
    if (isFetching) return <CircleLoader className="mx-auto" />;
    if (!selectedSurvey) {
      return (
        <div className="relative top-1/3 flex justify-center">
          <h4>{t('survey.notFound')}</h4>
        </div>
      );
    }
    return <SurveyParticipation isPublic={isPublic} />;
  };

  return <PageLayout>{getBody()}</PageLayout>;
};

export default SurveyParticipationPage;
