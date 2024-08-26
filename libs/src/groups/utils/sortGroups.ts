import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

function sortGroups<T>(data: (LmnApiSchoolClass | LmnApiProject)[]): T[] {
  return data.sort((a, b) => {
    const nameA = a.displayName || a.cn;
    const nameB = b.displayName || b.cn;

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    if (nameA === nameB) {
      if (a.cn < b.cn) {
        return -1;
      }
      if (a.cn > b.cn) {
        return 1;
      }
    }

    return 0;
  }) as T[];
}

export default sortGroups;
