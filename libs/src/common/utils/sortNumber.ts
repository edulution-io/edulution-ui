function sortNumber(a?: number, b?: number): number {
  if (!b) return !a ? 0 : 1;
  if (!a) return -1;
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export default sortNumber;
