import useLmnApiStore from '@/store/lmnApiStore';
import useFileManagerStore from '@/store/fileManagerStoreOLD';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import UserStore from '@/store/UserStore/UserStore';
import useFrameStore from '@/components/framing/FrameStore';

const cleanAllStores = () => {
  UserStore.getState().resetTotpSlice();
  UserStore.getState().resetUserSlice();
  UserStore.getState().resetQrCodeSlice();
  useFrameStore.getState().reset();
  useLmnApiStore.getState().reset();
  useConferenceStore.getState().reset();
  useFileManagerStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();
};

export default cleanAllStores;
