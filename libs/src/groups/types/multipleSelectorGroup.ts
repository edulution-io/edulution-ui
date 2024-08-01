interface MultipleSelectorGroup {
  id: string;
  name: string;
  path: string;
  label: string;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default MultipleSelectorGroup;
