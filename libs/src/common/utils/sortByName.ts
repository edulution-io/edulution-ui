import sortString from '@libs/common/utils/sortString';

interface Nameable {
  name: string;
}

const sortByName = <T extends Nameable>(a: T, b: T) => sortString(a.name, b.name);

export default sortByName;
