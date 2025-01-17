import { toast } from 'sonner';
import ToasterTranslationIds from '@libs/ui/types/toasterTranslationIds';
import i18n from '@/i18n';

const copyToClipboard = (url: string, toasterTranslationIds?: ToasterTranslationIds) => {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      toast.info(i18n.t(toasterTranslationIds?.success || 'common.copy.success'));
    })
    .catch(() => {
      toast.error(i18n.t(toasterTranslationIds?.error || 'common.copy.error'));
    });
};

export default copyToClipboard;
