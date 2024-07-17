// import LicenseInfoDto from '@libs/license/types/license-info.dto';
// import { LICENSES_PATH } from '@libs/license/types/license-endpoints';
// import eduApi from '@/api/eduApi';
// import handleApiError from '@/utils/handleApiError';
//
// export interface UsersLicenseStore {
//   checkForActiveUserLicenses: () => Promise<void>;
//   wasViewedAlready: boolean;
//   isOpen: boolean;
//   close: () => void;
//
//   isLoading: boolean;
//   error: Error | null;
//   reset: () => void;
// }
//
// export const initialValues = {
//   isOpen: false,
//   wasViewedAlready: false,
//
//   isLoading: false,
//   error: null,
// };
//
// export const close = (set:
//                         (partial:
//                            (UsersLicenseStore | Partial<UsersLicenseStore>
//                              | ((state: UsersLicenseStore) => (UsersLicenseStore | Partial<UsersLicenseStore>))),
//                          replace?: (boolean | undefined)) => void
//                       ) => set({ isOpen: false, wasViewedAlready: true })
//
//
// export const checkForActiveUserLicenses = async (
//   set:
//      (partial:
//         (UsersLicenseStore | Partial<UsersLicenseStore>
//           | ((state: UsersLicenseStore) => (UsersLicenseStore | Partial<UsersLicenseStore>))),
//       replace?: (boolean | undefined)) => void,
//   get: () => UsersLicenseStore
// ) => {
//   const { wasViewedAlready } = get();
//   if (wasViewedAlready) {
//     set({ isOpen: false });
//     return;
//   }
//
//   set({ isLoading: true, error: null });
//   try {
//     const response = await eduApi.get<LicenseInfoDto[]>(LICENSES_PATH);
//     const licenses = response.data;
//
//     if (!licenses || licenses.length === 0) {
//       set({ isOpen: true });
//       return;
//     }
//
//     const isActive = !!licenses.find((license) => license.isLicenseActive);
//     if (!isActive) {
//       set({ isOpen: true });
//       return;
//     }
//
//     // has an active license and the dialog must not be viewed
//     close(set);
//
//   } catch (error) {
//     handleApiError(error, set);
//   } finally {
//     set({ isLoading: false });
//   }
// };
//
// export const reset = (set:
//                         (partial:
//                            (UsersLicenseStore | Partial<UsersLicenseStore>
//                              | ((state: UsersLicenseStore) => (UsersLicenseStore | Partial<UsersLicenseStore>))),
//                          replace?: (boolean | undefined)) => void
//                       ) => set(initialValues);
