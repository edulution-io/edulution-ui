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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import useUserStore from '@/store/UserStore/UserStore';
import SurveyParticipationPublicLogin from '@/pages/Surveys/Participation/SurveyParticipationLevelThree';
import SurveyParticipationModel from '@/pages/Surveys/Participation/SurveyParticipationModel';

interface SurveyParticipationProps {
  isPublic: boolean;
  surveyId: string;
  survey: SurveyDto
}

const SurveyParticipation = (props: SurveyParticipationProps): React.ReactNode => {
  const { isPublic = false, survey } = props;
  const { user } = useUserStore();
 
  if (user) {
    const loggedInUser =  ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      publicUserName: undefined,
      publicUserId: undefined,
      label: `${user.firstName} ${user.lastName}`,
      value: user.username,
    });
    return (
      <SurveyParticipationModel
        attendee={loggedInUser}
        isPublic={isPublic}
      />
    );
  }
  
  return (
    <SurveyParticipationPublicLogin survey={survey} />
  );
};

export default SurveyParticipation;
