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
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SaveSurveyDialogBody from '@/pages/Surveys/Editor/dialog/SaveSurveyDialogBody';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { Button } from '@/components/shared/Button';

interface SaveSurveyDialogProps {
  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;

  invitedAttendees: AttendeeDto[];
  setInvitedAttendees: (attendees: AttendeeDto[]) => void;
  invitedGroups: MultipleSelectorGroup[];
  setInvitedGroups: (groups: MultipleSelectorGroup[]) => void;

  expires?: string | Date;
  setExpires: (date: string | Date | undefined) => void;
  isAnonymous?: boolean;
  setIsAnonymous: (state: boolean | undefined) => void;
  isPublic?: boolean;
  setIsPublic: (state: boolean | undefined) => void;
  canSubmitMultipleAnswers?: boolean;
  setCanSubmitMultipleAnswers: (state: boolean | undefined) => void;
  canUpdateFormerAnswer?: boolean;
  setCanUpdateFormerAnswer: (state: boolean | undefined) => void;
}

const SaveSurveyDialog = (props: SaveSurveyDialogProps) => {
  const {
    isOpenSaveSurveyDialog,
    setIsOpenSaveSurveyDialog,

    invitedAttendees,
    setInvitedAttendees,
    invitedGroups,
    setInvitedGroups,

    expires,
    setExpires,
    isAnonymous,
    setIsAnonymous,
    isPublic,
    setIsPublic,
    canSubmitMultipleAnswers,
    setCanSubmitMultipleAnswers,
    canUpdateFormerAnswer,
    setCanUpdateFormerAnswer,
  } = props;

  const { t } = useTranslation();

  const getDialogBody = () => (
    <SaveSurveyDialogBody
      invitedAttendees={invitedAttendees}
      setInvitedAttendees={setInvitedAttendees}
      invitedGroups={invitedGroups}
      setInvitedGroups={setInvitedGroups}
      expires={expires}
      setExpires={setExpires}
      isAnonymous={isAnonymous}
      setIsAnonymous={setIsAnonymous}
      isPublic={isPublic}
      setIsPublic={setIsPublic}
      canSubmitMultipleAnswers={canSubmitMultipleAnswers}
      setCanSubmitMultipleAnswers={setCanSubmitMultipleAnswers}
      canUpdateFormerAnswer={canUpdateFormerAnswer}
      setCanUpdateFormerAnswer={setCanUpdateFormerAnswer}
    />
  );

  const Footer = (
    <Button
      type="button"
      variant="btn-collaboration"
      size="lg"
      onClick={() => setIsOpenSaveSurveyDialog(false)}
    >
      {t('common.close')}
    </Button>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveSurveyDialog}
      handleOpenChange={() => setIsOpenSaveSurveyDialog(!isOpenSaveSurveyDialog)}
      title={t('surveys.saveDialog.title')}
      body={getDialogBody()}
      footer={Footer}
      desktopContentClassName="max-w-[50%] min-h-[500px] max-h-[90%] overflow-auto"
    />
  );
};

export default SaveSurveyDialog;
