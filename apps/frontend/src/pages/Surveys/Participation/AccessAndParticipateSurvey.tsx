/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect } from 'react';
import useUserStore from '@/store/UserStore/useUserStore';
import PublicSurveyAccessForm from '@/pages/Surveys/Participation/PublicSurveyAccessForm';
import SurveyParticipationModel from '@/pages/Surveys/Participation/SurveyParticipationModel';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateSurveyStore from './useParticipateSurveyStore';
import PublicSurveyParticipationIdDisplay from './PublicSurveyParticipationIdDisplay';

interface AccessAndParticipateSurveyProps {
  isPublic: boolean;
}

const AccessAndParticipateSurvey = (props: AccessAndParticipateSurveyProps): React.ReactNode => {
  const { isPublic = false } = props;

  const { selectedSurvey } = useSurveysTablesPageStore();
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
