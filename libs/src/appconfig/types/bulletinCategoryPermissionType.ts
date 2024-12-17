import BulletinCategoryPermission from '@libs/appconfig/constants/bulletinCategoryPermission';

export type BulletinCategoryPermissionType =
  (typeof BulletinCategoryPermission)[keyof typeof BulletinCategoryPermission];
