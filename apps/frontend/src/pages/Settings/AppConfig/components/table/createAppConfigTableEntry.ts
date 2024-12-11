import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import AppConfigTableEntry from '@/pages/Settings/AppConfig/components/table/appConfigTableEntry';

const createAppConfigTableEntry = <DataType, StoreType extends AppConfigTable<DataType>>(
  entry: AppConfigTableEntry<DataType, StoreType>,
): AppConfigTableEntry<DataType, StoreType> => entry;

export default createAppConfigTableEntry;
