const getBase64SizeInBytes = (base64String: string): number => {
  let padding = 0;
  if (base64String.endsWith('==')) {
    padding = 2;
  } else if (base64String.endsWith('=')) {
    padding = 1;
  }
  return (base64String.length * 3) / 4 - padding;
};

const getCompressedImage = (file: File, maxSizeKB: number): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('usersettings.errors.notSupportedFileFormat'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('usersettings.errors.notSupportedFileFormat'));
          return;
        }

        let { width } = img;
        let { height } = img;
        const maxWidth = 500;
        const maxHeight = 500;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let base64 = canvas.toDataURL('image/webp', quality);

        while (getBase64SizeInBytes(base64) > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/webp', quality);
        }

        if (getBase64SizeInBytes(base64) > maxSizeKB * 1024) {
          reject(new Error('usersettings.errors.notAbleToCompress'));
        } else {
          resolve(base64);
        }
      };
      img.src = reader.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

export default getCompressedImage;
