import StoreTypes from '@/store/utilis/storeTypes';
import useLmnUserStore from '@/store/lmnApiStore';
import useFileManagerStore from '@/store/fileManagerStore';

const cleanStoreData = (store: StoreTypes) => {
  if (store === StoreTypes.LMN_USER_STORE) {
    useLmnUserStore.getState().reset();
  }
  if (store === StoreTypes.FILEMANAGER_STORE) {
    useFileManagerStore.getState().reset();
  }
};

export default cleanStoreData;
