import type AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import { RowSelectionState } from '@tanstack/react-table';

interface AiConfigTableStore extends AppConfigTable<AiConfigDto> {
  selectedConfig: AiConfigDto | null;
  setSelectedConfig: (config: AiConfigDto | null) => void;
  addOrUpdateConfig: (config: AiConfigDto) => Promise<AiConfigDto>;
  isLoading: boolean;
  error: string | null;
  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;
  deleteTableEntry: (applicationName: string, id: string) => Promise<void>;
}

export default AiConfigTableStore;
