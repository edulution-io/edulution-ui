type QrCodeSlice = {
  qrCode: string;
  getQrCode: () => Promise<void>;
  qrCodeIsLoading: boolean;
  qrCodeError: Error | null;
  resetQrCodeSlice: () => void;
};

export default QrCodeSlice;
