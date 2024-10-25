function sortString(a?: string, b?: string): number {
  if (!b) return !a ? 0 : 1;
  if (!a) return -1;
  return a.localeCompare(b);
}

export default sortString;
