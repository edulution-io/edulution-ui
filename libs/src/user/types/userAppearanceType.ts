import UserAppearance from '@libs/user/constants/userAppearance';

type UserAppearanceType = (typeof UserAppearance)[keyof typeof UserAppearance];

export default UserAppearanceType;
