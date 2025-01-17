import LmnApiProjectQuota from '@libs/lmnApi/types/lmnApiProjectQuota';

/**
 * Input example: [
 *     "agy:500:---:",
 *     "brs:---:---:",
 *     "linuxmuster-global:300:---:"
 *   ]
 */
const parseSophomorixQuota = (quotaString?: string[]): string => {
  if (!quotaString?.length || (quotaString.length === 1 && quotaString[0] === '---')) return '[]';

  const result = quotaString
    .map((entry) => {
      const [share, quotaStr, comment] = entry.split(':');
      const quota = quotaStr !== '---' ? parseInt(quotaStr, 10) : undefined;

      if (quota !== undefined) {
        return comment ? { share, quota, comment } : { share, quota };
      }
      return null;
    })
    .filter(Boolean) as LmnApiProjectQuota[];

  return JSON.stringify(result);
};

export default parseSophomorixQuota;
