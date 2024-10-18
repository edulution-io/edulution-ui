import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';

const buildApiDeletePathUrl = (base: string, path: string, target: DeleteTargetType): string =>
  `${base}?target=${target}&path=${path}`;

export default buildApiDeletePathUrl;
