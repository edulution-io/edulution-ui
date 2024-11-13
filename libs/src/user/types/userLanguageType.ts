import UserLanguage from '@libs/user/constants/userLanguage';

type UserLanguageType = (typeof UserLanguage)[keyof typeof UserLanguage];

export default UserLanguageType;
