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

import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import VdiErrorMessages from '@libs/desktopdeployment/types/vdiErrorMessages';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import GroupsErrorMessage from '@libs/groups/types/groupsErrorMessage';
import LmnApiErrorMessage from '@libs/lmnApi/types/lmnApiErrorMessage';
import MailsErrorMessages from '@libs/mail/constants/mails-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import BulletinBoardErrorMessage from '@libs/bulletinBoard/types/bulletinBoardErrorMessage';
import DockerErrorMessages from '@libs/docker/constants/dockerErrorMessages';
import VeyonErrorMessages from '@libs/veyon/types/veyonErrorMessages';
import LicenseErrorMessagesType from '@libs/license/types/licenseErrorMessagesType';
import TGlobalSettingsErrorMessages from '@libs/global-settings/types/globalSettingsErrorMessagesTypes';
import TLDrawSyncErrorMessagesType from '@libs/tldraw-sync/types/tLDrawSyncErrorMessagesType';

type ErrorMessage =
  | CommonErrorMessages
  | UserErrorMessages
  | ConferencesErrorMessage
  | GroupsErrorMessage
  | AuthErrorMessages
  | VdiErrorMessages
  | LmnApiErrorMessage
  | AppConfigErrorMessages
  | FileSharingErrorMessage
  | MailsErrorMessages
  | SurveyErrorMessages
  | BulletinBoardErrorMessage
  | SurveyAnswerErrorMessages
  | DockerErrorMessages
  | VeyonErrorMessages
  | LicenseErrorMessagesType
  | TLDrawSyncErrorMessagesType
  | TGlobalSettingsErrorMessages;

export default ErrorMessage;
