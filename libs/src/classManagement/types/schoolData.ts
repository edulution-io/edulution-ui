import { Group } from '@libs/groups/types/group';

interface SchoolData {
  id: string;
  name: string;
  classes: Group[];
  printers: Group[];
  projects: Group[];
}

export default SchoolData;
