import StoreTyps from '@/store/utilis/storeTyps';
import useLmnUserStore from '@/store/lmnUserStore';

const cleanStoreData = (store: StoreTyps) => {
  if (store === StoreTyps.LMN_USER_STORE) {
    useLmnUserStore.getState().reset();
  }
  if (store === StoreTyps.FILEMANAGER_STORE) {
    // NOT IMPLEMENTED YET
  }
};

export default cleanStoreData;
