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

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreatorModel } from 'survey-creator-core';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import i18n from '@/i18n';
import useUserStore from '@/store/UserStore/useUserStore';
import useGroupStore from '@/store/GroupStore';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import DateTimePickerField from '@/components/ui/DateTimePicker/DateTimePickerField';
import SurveysLogoSettings from '@/pages/Surveys/Editor/dialog/SurveysLogoSettings';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';

interface SurveyContextMenuBodyProps {
  form: UseFormReturn<SurveyDto>;
  surveyCreator: SurveyCreatorModel;
}

const SurveyContextMenuBody = ({ form, surveyCreator }: SurveyContextMenuBodyProps) => {
  const { setValue, watch } = form;
  const { user } = useUserStore();
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();

  const handleAttendeesChange = (attendees: AttendeeDto[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    return user ? result.filter((r) => r.username !== user.username) : result;
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue('invitedGroups', groups, { shouldValidate: true });
  };

  return (
    <AccordionSH
      type="multiple"
      defaultValue={['logoSettings']}
      className="mt-5 space-y-2 [&>*]:rounded-xl [&>*]:px-2"
    >
      <AccordionItem value="logoSettings">
        <AccordionTrigger>
          <h3>{i18n.t('survey.editor.surveySettings.surveyLogo.title')}</h3>
        </AccordionTrigger>
        <AccordionContent className="space-y-2 px-1">
          <SurveysLogoSettings surveyCreator={surveyCreator} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="expirationDate">
        <AccordionTrigger>
          <h3>{i18n.t('survey.expirationDate')}</h3>
        </AccordionTrigger>
        <AccordionContent className="space-y-2 px-1">
          <DateTimePickerField
            form={form}
            path="expires"
            variant="dialog"
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="invitees">
        <AccordionTrigger>
          <h3>{i18n.t('survey.editor.surveySettings.invitees')}</h3>
        </AccordionTrigger>
        <AccordionContent className="space-y-2 px-1">
          <SearchUsersOrGroups
            users={watch('invitedAttendees')}
            onSearch={onAttendeesSearch}
            onUserChange={handleAttendeesChange}
            groups={watch('invitedGroups')}
            onGroupSearch={searchGroups}
            onGroupsChange={handleGroupsChange}
            variant="dialog"
          />
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default SurveyContextMenuBody;
