import StoreTyps from '@/store/utilis/storeTyps';
import useApiStore from '@/store/lmnStore';

const cleanStoreData = (store: StoreTyps) => {
  if (store === StoreTyps.LMN_STORE) {
    useApiStore.getState().reset();
  }
  if (store === StoreTyps.FILEMANAGER_STORE) {
    // NOT IMPLEMENTED YET
  }
};

export default cleanStoreData;
