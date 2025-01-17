/**
 * Input example: [
 *     "500::"
 *   ]
 */
function parseSophomorixMailQuota(mailQuotaString?: string[]): string {
  if (!Array.isArray(mailQuotaString) || mailQuotaString.length === 0) {
    return '0';
  }

  const parts = mailQuotaString[0].split('::');
  const quota = parts[0];

  if (!Number.isNaN(Number(quota))) {
    return quota;
  }

  return '0';
}

export default parseSophomorixMailQuota;
