import useLmnApiStore from '@/store/lmnApiStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import UserStore from '@/store/UserStore/UserStore';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useSidebarStore from '@/components/ui/Sidebar/sidebarStore';
import useDesktopDeploymentStore from '@/pages/DesktopDeployment/DesktopDeploymentStore';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';

const cleanAllStores = () => {
  UserStore.getState().resetTotpSlice();
  UserStore.getState().resetUserSlice();
  UserStore.getState().resetQrCodeSlice();
  useFrameStore.getState().reset();
  useLmnApiStore.getState().reset();
  useConferenceStore.getState().reset();
  useFileSharingDialogStore.getState().reset();
  useFileSharingStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();
  useAppConfigsStore.getState().reset();
  useSidebarStore.getState().reset();
  useDesktopDeploymentStore.getState().reset();
};

export default cleanAllStores;
