export default interface UserSettingsPageStore {
  isLoading: boolean;
  error: Error | null;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}
