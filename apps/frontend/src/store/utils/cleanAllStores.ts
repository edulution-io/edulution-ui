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
import useSseStore from '../useSseStore';

const cleanAllStores = async () => {
  UserStore.getState().resetQrCodeSlice();
  UserStore.getState().resetTotpSlice();
  UserStore.getState().resetUserSlice();
  UserStore.getState().resetUserAccountsSlice();
  useAppConfigsStore.getState().reset();
  useBulletinCategoryTableStore.getState().reset();
  useBulletinBoardEditorialStore.getState().reset();
  useBulletinBoardStore.getState().reset();
  useClassManagementStore.getState().reset();
  useCommunityLicenseStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();
  useConferenceStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useDesktopDeploymentStore.getState().reset();
  useEduApiStore.getState().reset();
  useFileEditorStore.getState().reset();
  useFileSharingDialogStore.getState().reset();
  useFileSharingStore.getState().reset();
  useFileSharingDownloadStore.getState().reset();
  useFrameStore.getState().reset();
  useLauncherStore.getState().reset();
  useLessonStore.getState().reset();
  useLmnApiPasswordStore.getState().reset();
  useLmnApiStore.getState().reset();
  useMailsStore.getState().reset();
  usePrintPasswordsStore.getState().reset();
  usePublicConferenceStore.getState().reset();
  useResultDialogStore.getState().reset();
  useSidebarStore.getState().reset();
  useSurveyTablesPageStore.getState().reset();
  useSurveyEditorPageStore.getState().reset();
  useTemplateMenuStore.getState().reset();
  useResultDialogStore.getState().reset();
  useSubmittedAnswersDialogStore.getState().reset();
  useDeleteSurveyStore.getState().reset();
  useParticipateSurveyStore.getState().reset();
  useQuestionsContextMenuStore.getState().reset();
  useSseStore.getState().reset();
  usePublicSharePageStore.getState().reset();
  usePublicShareStore.getState().reset();
  useTLDRawHistoryStore.getState().reset();
  localStorage.removeItem('i18nextLng');
  await clearTLDrawPersistence(TLDRAW_PERSISTENCE_KEY);
};

export default cleanAllStores;
