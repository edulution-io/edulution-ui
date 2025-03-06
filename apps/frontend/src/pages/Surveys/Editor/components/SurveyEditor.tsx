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

import React, { useMemo } from 'react';
import { FaGear } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import getSurveyFormulaFromJSON from '@libs/survey/utils/getSurveyFormulaFromJSON';
import useLanguage from '@/hooks/useLanguage';
import useElementHeight from '@/hooks/useElementHeight';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/custom.survey.css';
import '@/pages/Surveys/theme/custom.creator.css';
import updateOrCreateSurveyCreatorModel from '@/pages/Surveys/Editor/components/updateOrCreateSurveyCreatorModel';

interface SurveyEditorProps {
  initialFormula: SurveyFormula;
  initialSaveNo: number;
  saveSurvey: (formula: SurveyFormula, saveNo: number) => Promise<void>;

  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;

  invitedAttendees: AttendeeDto[];
  setInvitedAttendees: (attendees: AttendeeDto[]) => void;
  invitedGroups: MultipleSelectorGroup[];
  setInvitedGroups: (groups: MultipleSelectorGroup[]) => void;

  expires?: Date;
  setExpires: (date: Date | undefined) => void;
  isAnonymous?: boolean;
  setIsAnonymous: (state: boolean | undefined) => void;
  isPublic?: boolean;
  setIsPublic: (state: boolean | undefined) => void;
  canSubmitMultipleAnswers?: boolean;
  setCanSubmitMultipleAnswers: (state: boolean | undefined) => void;
  canUpdateFormerAnswer?: boolean;
  setCanUpdateFormerAnswer: (state: boolean | undefined) => void;
}

const SurveyEditor = (props: SurveyEditorProps) => {
  const {
    saveSurvey,
    initialFormula,
    initialSaveNo,

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

  const { language } = useLanguage();
  const { t } = useTranslation();

  const creator = useMemo(() => {
    const surveyCreatorModel: SurveyCreator = updateOrCreateSurveyCreatorModel(language);

    surveyCreatorModel.JSON = initialFormula;
    surveyCreatorModel.saveNo = initialSaveNo;
    surveyCreatorModel.locale = language;

    surveyCreatorModel.saveSurveyFunc = async (
      saveNo: number,
      _callback: (saveNo: number, isSuccess: boolean) => void,
    ) => {
      await saveSurvey(getSurveyFormulaFromJSON(surveyCreatorModel.getSurveyJSON() as JSON), saveNo);
    };

    return surveyCreatorModel;
  }, [initialFormula, initialSaveNo, language]);

  const config: FloatingButtonsBarConfig = {
    buttons: [
      SaveButton(() => creator.saveSurvey()),
      {
        icon: FaGear,
        text: t('common.settings'),
        onClick: () => setIsOpenSaveSurveyDialog(true),
      },
    ],
    keyPrefix: 'surveys-page-floating-button_',
  };

  const pageBarsHeight = useElementHeight([FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) + 10;

  return (
    <>
      <div
        className="survey-editor"
        style={{ height: `calc(100% - ${pageBarsHeight}px)` }}
      >
        <SurveyCreatorComponent
          creator={creator}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
        <SaveSurveyDialog
          isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
          setIsOpenSaveSurveyDialog={setIsOpenSaveSurveyDialog}
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
      </div>
      <FloatingButtonsBar config={config} />
    </>
  );
};

export default SurveyEditor;
