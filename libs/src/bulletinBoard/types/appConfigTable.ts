interface AppConfigTable<T> {
  tableContentData: T[];
  fetchTableContent: () => Promise<void>;
}

export default AppConfigTable;
