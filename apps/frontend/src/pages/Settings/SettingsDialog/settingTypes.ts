import { ConfigType } from '@/datatypes/types';

export interface SettingsDialogProps {
  isDialogOpen?: boolean;
  isSheetOpen?: boolean;
  option: string;
  setOption: (option: string) => void;
  filteredAppOptions: () => { id: string; name: string }[];
  setSearchParams: (params: URLSearchParams | ((prevParams: URLSearchParams) => URLSearchParams)) => void;
  setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
}
