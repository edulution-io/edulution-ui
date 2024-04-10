import i18n from '@/i18n';

export const translateKey = (key: string, variables = {}) => i18n.t(key, variables);

export const getFromPathName = (pathname: string, index: number) => `${pathname.split('/')[index]}`;
