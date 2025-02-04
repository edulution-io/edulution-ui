import { create, StoreApi, UseBoundStore } from 'zustand';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import useAppConfigsStore from '../appConfigsStore';

const initialValues = {
  tableContentData: [],
  selectedConfig: null,
};

const useVeyonConfigTableStore: UseBoundStore<StoreApi<VeyonConfigTableStore>> = create<VeyonConfigTableStore>(
  (set) => ({
    ...initialValues,
    setSelectedConfig: (config) => set({ selectedConfig: config }),
    fetchTableContent: () => {
      const { appConfigs } = useAppConfigsStore.getState();
      const classMgmtConfig = appConfigs.find((config) => config.name === APPS.CLASS_MANAGEMENT);
      if (!classMgmtConfig || typeof classMgmtConfig.extendedOptions !== 'object') {
        set({ tableContentData: [] });
      } else {
        set({ tableContentData: classMgmtConfig.extendedOptions[ExtendedOptionKeys.VEYON_PROXYS] || [] });
      }
    },

    reset: () => set(initialValues),
  }),
);

export default useVeyonConfigTableStore;
