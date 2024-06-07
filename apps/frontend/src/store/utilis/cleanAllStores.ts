import useLmnUserStore from '@/store/lmnApiStoreOLD';
import useFileManagerStore from '@/store/fileManagerStoreOLD';
import useUserStore from '@/store/userStoreOLD';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import useIframeStore from '@/routes/IframeStore';

const cleanAllStores = () => {
  useUserStore.getState().reset();
  useIframeStore.getState().reset();
  useLmnUserStore.getState().reset();
  useConferenceStore.getState().reset();
  useFileManagerStore.getState().reset();
  useCreateConferenceDialogStore.getState().reset();
  useConferenceDetailsDialogStore.getState().reset();
};

export default cleanAllStores;
