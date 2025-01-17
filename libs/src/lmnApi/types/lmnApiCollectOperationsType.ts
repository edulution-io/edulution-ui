import LMN_API_COLLECT_OPERATIONS from '@libs/lmnApi/constants/lmnApiCollectOperations';

export type LmnApiCollectOperationsType = (typeof LMN_API_COLLECT_OPERATIONS)[keyof typeof LMN_API_COLLECT_OPERATIONS];
