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

import useLmnApiStore from '@/store/useLmnApiStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/useCreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore';
import UserStore from '@/store/UserStore/useUserStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useSidebarStore from '@/components/ui/Sidebar/useSidebarStore';
import useDesktopDeploymentStore from '@/pages/DesktopDeployment/useDesktopDeploymentStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import usePrintPasswordsStore from '@/pages/ClassManagement/PasswordsPage/usePrintPasswordsStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import useCommunityLicenseStore from '@/pages/UserSettings/Info/useCommunityLicenseStore';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useDeleteSurveyStore from '@/pages/Surveys/Tables/dialogs/useDeleteSurveyStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useSubmittedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useSubmittedAnswersDialogStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import usePublicConferenceStore from '@/pages/ConferencePage/PublicConference/usePublicConferenceStore';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';
import TLDRAW_PERSISTENCE_KEY from '@libs/whiteboard/constants/tldrawPersistenceKey';
import clearTLDrawPersistence from '@/pages/Whiteboard/TLDrawOffline/clearTLDrawPersistence';
import usePublicSharePageStore from '@/pages/FileSharing/publicShare/publicPage/usePublicSharePageStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useLauncherStore from '@/components/ui/Launcher/useLauncherStore';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useVeyonApiStore from '@/pages/ClassManagement/useVeyonApiStore';
import useVeyonConfigTableStore from '@/pages/Settings/AppConfig/classmanagement/useVeyonConfigTableStore';
import useWebdavShareConfigTableStore from '@/pages/Settings/AppConfig/filesharing/useWebdavShareConfigTableStore';
import useFileTableStore from '@/pages/Settings/AppConfig/components/useFileTableStore';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import useOpenFileDialogStore from '@/pages/FileSharing/useOpenFileDialogStore';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import useMenuBarStore from '@/components/shared/useMenuBarStore';
import useAppConfigUpdateCheckerStore from '@/pages/Settings/AppConfig/components/updateChecker/useAppConfigUpdateCheckerStore';
import useSelectCreateDockerContainerDialogStore from '@/pages/Settings/AppConfig/DockerIntegration/SelectCreateDockerContainerDialog/useSelectCreateDockerContainerDialogStore';
import useSseStore from '../useSseStore';

const cleanAllStores = async () => {
  UserStore.getState().resetQrCodeSlice();
  UserStore.getState().resetTotpSlice();
  UserStore.getState().resetUserAccountsSlice();
  UserStore.getState().resetUserSlice();
  useAppConfigTableDialogStore.getState().reset();
  useAppConfigUpdateCheckerStore.getState().reset();
  useAppConfigsStore.getState().reset();
  useBulletinBoardEditorialStore.getState().reset();
  useBulletinBoardStore.getState().reset();
  useBulletinCategoryTableStore.getState().reset();
  useClassManagementStore.getState().reset();
  useCommunityLicenseStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();
  useConferenceStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useDeleteSurveyStore.getState().reset();
  useDesktopDeploymentStore.getState().reset();
  useEduApiStore.getState().reset();
  useFileEditorStore.getState().reset();
  useFileSharingDialogStore.getState().reset();
  useFileSharingDownloadStore.getState().reset();
  useFileSharingStore.getState().reset();
  useFileTableStore.getState().reset();
  useFrameStore.getState().reset();
  useGlobalSettingsApiStore.getState().reset();
  useLauncherStore.getState().reset();
  useLessonStore.getState().reset();
  useLmnApiPasswordStore.getState().reset();
  useLmnApiStore.getState().reset();
  useMailsStore.getState().reset();
  useMenuBarStore.getState().reset();
  useParticipateSurveyStore.getState().reset();
  usePrintPasswordsStore.getState().reset();
  usePublicConferenceStore.getState().reset();
  usePublicSharePageStore.getState().reset();
  usePublicShareStore.getState().reset();
  useQuestionsContextMenuStore.getState().reset();
  useResultDialogStore.getState().reset();
  useResultDialogStore.getState().reset();
  useSelectCreateDockerContainerDialogStore.getState().reset();
  useSidebarStore.getState().reset();
  useSseStore.getState().reset();
  useSubmittedAnswersDialogStore.getState().reset();
  useSurveyEditorPageStore.getState().reset();
  useSurveyTablesPageStore.getState().reset();
  useTLDRawHistoryStore.getState().reset();
  useTemplateMenuStore.getState().reset();
  useVeyonApiStore.getState().reset();
  useVeyonConfigTableStore.getState().reset();
  useWebdavShareConfigTableStore.getState().reset();
  useOpenFileDialogStore.getState().reset();
  useFilesystemStore.getState().reset();
  localStorage.removeItem('i18nextLng');
  await clearTLDrawPersistence(TLDRAW_PERSISTENCE_KEY);
};

export default cleanAllStores;
