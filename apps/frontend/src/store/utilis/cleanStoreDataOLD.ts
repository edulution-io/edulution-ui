import StoreTypes from '@/store/utilis/storeTypes';
import useLmnUserStoreOLD from '@/store/lmnApiStoreOLD';
import useFileManagerStoreOLD from '@/store/fileManagerStoreOLD';

const cleanStoreDataOLD = (store: StoreTypes) => {
  if (store === StoreTypes.LMN_USER_STORE) {
    useLmnUserStoreOLD.getState().reset();
  }
  if (store === StoreTypes.FILEMANAGER_STORE) {
    useFileManagerStoreOLD.getState().reset();
  }
};

export default cleanStoreDataOLD;
