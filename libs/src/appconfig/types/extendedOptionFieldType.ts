import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';

export type ExtendedOptionFieldType = (typeof ExtendedOptionField)[keyof typeof ExtendedOptionField];
