import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

const getUniqueValues = <T extends UserLmnInfo | LmnApiSchoolClass | LmnApiProject>(values: T[]): T[] => {
  const uniqueValuesSet = new Set<string>(values.map((obj) => JSON.stringify(obj)));
  return Array.from(uniqueValuesSet).map((str) => JSON.parse(str) as T);
};

export default getUniqueValues;
