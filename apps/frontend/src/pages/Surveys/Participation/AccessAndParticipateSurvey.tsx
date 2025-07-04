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
import useUserStore from '@/store/UserStore/useUserStore';
import PublicSurveyAccessForm from '@/pages/Surveys/Participation/PublicSurveyAccessForm';
import SurveyParticipationModel from '@/pages/Surveys/Participation/SurveyParticipationModel';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateSurveyStore from './useParticipateSurveyStore';
import PublicSurveyParticipationIdDisplay from './PublicSurveyParticipationIdDisplay';

interface AccessAndParticipateSurveyProps {
  isPublic: boolean;
}

const AccessAndParticipateSurvey = (props: AccessAndParticipateSurveyProps): React.ReactNode => {
  const { isPublic = false } = props;

  const { selectedSurvey } = useSurveyTablesPageStore();
  const { user } = useUserStore();
  const { attendee, setAttendee, publicUserId } = useParticipateSurveyStore();

  useEffect(() => {
    if (user) {
      const loggedInUser = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        label: `${user.firstName} ${user.lastName}`,
        value: user.username,
      };
      setAttendee(loggedInUser);
    } else {
      setAttendee(undefined);
    }
  }, [user]);

  if (!attendee) {
    return <PublicSurveyAccessForm />;
  }

  const { canUpdateFormerAnswer = false, canSubmitMultipleAnswers = false } = selectedSurvey || {};
  if (isPublic && publicUserId && (canUpdateFormerAnswer || canSubmitMultipleAnswers)) {
    return <PublicSurveyParticipationIdDisplay publicUserId={publicUserId} />;
  }

  return <SurveyParticipationModel isPublic={isPublic} />;
};

export default AccessAndParticipateSurvey;
