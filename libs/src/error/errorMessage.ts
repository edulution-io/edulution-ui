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
  | TGlobalSettingsErrorMessages;

export default ErrorMessage;
