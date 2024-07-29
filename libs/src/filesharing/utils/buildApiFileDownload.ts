import ValidTime from '@libs/filesharing/types/validTime';

const buildApiFileDownload = (base: string, path: string, newPath: string, validTimeSlot: ValidTime): string =>
  `${base}?path=${path}&newPath=${newPath}&validTimeSlot=${validTimeSlot}`;

export default buildApiFileDownload;
