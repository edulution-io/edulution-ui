interface AppConfigTable<T> {
  tableContentData: T[];
  fetchTableContent: () => Promise<void> | void;
}

export default AppConfigTable;
