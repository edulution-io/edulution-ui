import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';
import { Button } from '@/components/shared/Button';
import getCompressedImage from '@/utils/getCompressedImage';
import Avatar from '@/components/shared/Avatar';
import { toast } from 'sonner';

const UserImageConfig: React.FC = () => {
  const { t } = useTranslation();
  const { user, patchUserDetails } = useLmnApiStore();
  const [base64Image, setBase64Image] = useState<string>(
    user?.thumbnailPhoto && user?.thumbnailPhoto !== 'undefined' ? user?.thumbnailPhoto : '',
  );

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      let compressedBase64: string;
      try {
        compressedBase64 = await getCompressedImage(file, 100);
      } catch (error) {
        toast.error(t(error instanceof Error ? error.message : ''));
        compressedBase64 = '';
      }
      setBase64Image(compressedBase64);
    }
  };

  const handleSubmitImage = () => {
    void patchUserDetails({ thumbnailPhoto: base64Image });
  };

  const handleImageDelete = async () => {
    setBase64Image('');

    await patchUserDetails({ thumbnailPhoto: 'undefined' });
  };

  return (
    <>
      <h3>{t('usersettings.details.userimageconfig')}</h3>
      <div className="space-y-4 py-4 text-ciGrey">
        <Avatar
          user={{ username: user?.name || '', firstName: user?.givenName, lastName: user?.sn }}
          imageSrc={base64Image}
          className="h-20 w-20"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-4"
        />

        <div className="mt-4 flex justify-end gap-4">
          {base64Image ? (
            <Button
              variant="btn-attention"
              size="lg"
              onClick={handleImageDelete}
            >
              {t('common.delete')}
            </Button>
          ) : null}
          <Button
            variant="btn-security"
            size="lg"
            onClick={handleSubmitImage}
            disabled={!base64Image}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>
    </>
  );
};

export default UserImageConfig;
