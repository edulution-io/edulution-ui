interface Nameable {
  name: string;
}

function sortByName<T extends Nameable>(a: T, b: T): number {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export default sortByName;
