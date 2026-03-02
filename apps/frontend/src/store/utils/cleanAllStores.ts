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

import useMenuBarStore from '@/components/shared/useMenuBarStore';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useLauncherStore from '@/components/ui/Launcher/useLauncherStore';
import useSidebarStore from '@/components/ui/Sidebar/useSidebarStore';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import useLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import usePrintPasswordsStore from '@/pages/ClassManagement/PasswordsPage/usePrintPasswordsStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useVeyonApiStore from '@/pages/ClassManagement/useVeyonApiStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/useCreateConferenceDialogStore';
import usePublicConferenceStore from '@/pages/ConferencePage/PublicConference/usePublicConferenceStore';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useSharePublicConferenceStore from '@/pages/ConferencePage/useSharePublicConferenceStore';
import useDesktopDeploymentStore from '@/pages/DesktopDeployment/useDesktopDeploymentStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useReplaceFilesDialogStore from '@/pages/FileSharing/Dialog/useReplaceFilesDialogStore';
import useHandleUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandleUploadFileStore';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import useFileContentPreviewStore from '@/pages/FileSharing/FilePreview/useFileContentPreviewStore';
import useFileEditorContentStore from '@/pages/FileSharing/FilePreview/useFileEditorContentStore';
import useDownloadAcknowledgedStore from '@/pages/FileSharing/hooks/useDownloadAcknowledgedStore';
import usePublicSharePageStore from '@/pages/FileSharing/publicShare/publicPage/usePublicSharePageStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useOpenFileDialogStore from '@/pages/FileSharing/useOpenFileDialogStore';
import useDeviceManagementStore from '@/pages/LinuxmusterPage/DeviceManagement/useDeviceManagementStore';
import useParentAssignmentStore from '@/pages/LinuxmusterPage/ParentAssignment/useParentAssignmentStore';
import useUserManagementStore from '@/pages/LinuxmusterPage/UserManagement/useUserManagementStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import useVeyonConfigTableStore from '@/pages/Settings/AppConfig/classmanagement/useVeyonConfigTableStore';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import useAppConfigUpdateCheckerStore from '@/pages/Settings/AppConfig/components/updateChecker/useAppConfigUpdateCheckerStore';
import useFileTableStore from '@/pages/Settings/AppConfig/components/useFileTableStore';
import useDockerApplicationStore from '@/pages/Settings/AppConfig/DockerIntegration/useDockerApplicationStore';
import useSelectCreateDockerContainerDialogStore from '@/pages/Settings/AppConfig/DockerIntegration/SelectCreateDockerContainerDialog/useSelectCreateDockerContainerDialogStore';
import useWebdavServerConfigTableStore from '@/pages/Settings/AppConfig/filesharing/useWebdavServerConfigTableStore';
import useWebdavShareConfigTableStore from '@/pages/Settings/AppConfig/filesharing/useWebdavShareConfigTableStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useWireguardConfigTableStore from '@/pages/Settings/AppConfig/wireguard/useWireguardConfigTableStore';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useWebhookClientsStore from '@/pages/Settings/Webhooks/useWebhookClientsStore';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useExportSurveyToPdfStore from '@/pages/Surveys/Participation/exportToPdf/useExportSurveyToPdfStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useDeleteSurveyStore from '@/pages/Surveys/Tables/dialogs/useDeleteSurveyStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useCommunityLicenseStore from '@/pages/UserSettings/Info/useCommunityLicenseStore';
import useParentChildPairingStore from '@/pages/UserSettings/ParentChildPairing/useParentChildPairingStore';
import useUserSettingsPageStore from '@/pages/UserSettings/Security/useUserSettingsPageStore';
import useUserWireguardStore from '@/pages/UserSettings/WireguardAccess/useUserWireguardStore';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import useNotificationStore from '@/store/useNotificationStore';
import useSentryStore from '@/store/useSentryStore';
import useSessionFlagsStore from '@/store/useSessionFlagsStore';
import useSseStore from '@/store/useSseStore';
import useSubMenuStore from '@/store/useSubMenuStore';
import useTableViewSettingsStore from '@/store/useTableViewSettingsStore';
import useThemeStore from '@/store/useThemeStore';
import useUserPreferencesStore from '@/store/useUserPreferencesStore';
import UserStore from '@/store/UserStore/useUserStore';
import clearTLDrawPersistence from '@/pages/Whiteboard/TLDrawOffline/clearTLDrawPersistence';
import TLDRAW_PERSISTENCE_KEY from '@libs/whiteboard/constants/tldrawPersistenceKey';

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
  useDeviceManagementStore.getState().reset();
  useDockerApplicationStore.getState().reset();
  useDownloadAcknowledgedStore.getState().reset();
  useEduApiStore.getState().reset();
  useExportSurveyToPdfStore.getState().reset();
  useFileContentPreviewStore.getState().reset();
  useFileEditorContentStore.getState().reset();
  useFileEditorStore.getState().reset();
  useFileSharingDialogStore.getState().reset();
  useFileSharingDownloadStore.getState().reset();
  useFileSharingMoveDialogStore.getState().reset();
  useFileSharingStore.getState().reset();
  useFileTableStore.getState().reset();
  useFilesystemStore.getState().reset();
  useFrameStore.getState().reset();
  useGlobalSettingsApiStore.getState().reset();
  useHandleUploadFileStore.getState().reset();
  useLauncherStore.getState().reset();
  useLessonStore.getState().reset();
  useLmnApiPasswordStore.getState().reset();
  useLmnApiStore.getState().reset();
  useMailsStore.getState().reset();
  useMenuBarStore.getState().reset();
  useNotificationStore.getState().reset();
  useOpenFileDialogStore.getState().reset();
  useParentAssignmentStore.getState().reset();
  useParentChildPairingStore.getState().reset();
  useParticipateSurveyStore.getState().reset();
  usePlatformStore.getState().reset();
  usePrintPasswordsStore.getState().reset();
  usePublicConferenceStore.getState().reset();
  usePublicSharePageStore.getState().reset();
  usePublicShareStore.getState().reset();
  useQuestionsContextMenuStore.getState().reset();
  useReplaceFilesDialogStore.getState().reset();
  useResultDialogStore.getState().reset();
  useSelectCreateDockerContainerDialogStore.getState().reset();
  useSentryStore.getState().reset();
  useSessionFlagsStore.getState().reset();
  useSharePublicConferenceStore.getState().reset();
  useSidebarStore.getState().reset();
  useSseStore.getState().reset();
  useSubMenuStore.getState().reset();
  useSurveyEditorPageStore.getState().reset();
  useSurveyTablesPageStore.getState().reset();
  useTableViewSettingsStore.getState().reset();
  useTLDRawHistoryStore.getState().reset();
  useTemplateMenuStore.getState().reset();
  useThemeStore.getState().reset();
  useUserManagementStore.getState().reset();
  useUserPreferencesStore.getState().reset();
  useUserSettingsPageStore.getState().reset();
  useUserWireguardStore.getState().reset();
  useVeyonApiStore.getState().reset();
  useVeyonConfigTableStore.getState().reset();
  useWebdavServerConfigTableStore.getState().reset();
  useWebdavShareConfigTableStore.getState().reset();
  useWebhookClientsStore.getState().reset();
  useWhiteboardEditorStore.getState().reset();
  useWireguardConfigTableStore.getState().reset();
  localStorage.removeItem('i18nextLng');
  await clearTLDrawPersistence(TLDRAW_PERSISTENCE_KEY);
};

export default cleanAllStores;
