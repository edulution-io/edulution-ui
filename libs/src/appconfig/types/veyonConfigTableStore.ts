import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';

export interface VeyonConfigTableStore extends AppConfigTable<VeyonProxyItem> {
  selectedConfig: VeyonProxyItem | null;
  setSelectedConfig: (config: VeyonProxyItem | null) => void;
  reset: () => void;
}
