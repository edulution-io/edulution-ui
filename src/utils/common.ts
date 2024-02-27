// utility.js
import i18n from '@/i18n'; // Path to your i18n configuration file

const translateKey = (key: string) => i18n.t(key); // Use i18next's `t` function directly

export default translateKey;
