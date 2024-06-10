import useLmnApiStore from '@/store/lmnApiStore';
import useFileManagerStore from '@/store/fileManagerStoreOLD';
import useUserStore from '@/store/userStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import useQrCodeStore from '@/store/qrCodeStore';
import useTotpStore from '@/store/totpStore';

const cleanAllStores = () => {
  useTotpStore.getState().reset();
  useUserStore.getState().reset();
  useQrCodeStore.getState().reset();
  useLmnApiStore.getState().reset();
  useConferenceStore.getState().reset();
  useFileManagerStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();
};

export default cleanAllStores;
