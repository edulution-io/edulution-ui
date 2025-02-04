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
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/useSurveyEditorFormStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import QRCodeWithCopyButton from '@/components/ui/QRCodeWithCopyButton';

const SharePublicSurveyDialog = () => {
  const { isOpenSharePublicSurveyDialog, closeSharePublicSurveyDialog, publicSurveyId } = useSurveyEditorFormStore();

  const { t } = useTranslation();

  const url = publicSurveyId ? `${window.location.origin}/${PUBLIC_SURVEYS_ENDPOINT}/?surveyId=${publicSurveyId}` : '';

  const getDialogBody = () => (
    <QRCodeWithCopyButton
      url={url}
      titleTranslationId="surveys.sharePublicSurveyDialog.description"
      toasterTranslationIds={{
        success: 'surveys.sharePublicSurveyDialog.savedToClipboard',
        error: 'surveys.sharePublicSurveyDialog.savedToClipboardError',
      }}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenSharePublicSurveyDialog && !!url}
      handleOpenChange={() => closeSharePublicSurveyDialog()}
      title={t('surveys.sharePublicSurveyDialog.title')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[60%] max-h-[75%] min-h-fit-content"
    />
  );
};

export default SharePublicSurveyDialog;
