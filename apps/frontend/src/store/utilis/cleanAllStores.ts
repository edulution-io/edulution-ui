import useLmnUserStore from '@/store/lmnApiStore';
import useFileManagerStore from '@/store/fileManagerStore';
import useUserStore from '@/store/userStore';

const cleanAllStores = () => {
  useUserStore.getState().reset();
  useLmnUserStore.getState().reset();
  useFileManagerStore.getState().reset();
};

export default cleanAllStores;
