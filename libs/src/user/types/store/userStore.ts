import QrCodeSlice from '@libs/user/types/store/qrCodeSlice';
import TotpSlice from '@libs/user/types/store/totpSlice';
import UserSlice from '@libs/user/types/store/userSlice';

type UserStore = QrCodeSlice & TotpSlice & UserSlice;

export default UserStore;
