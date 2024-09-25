type QrCodeSlice = {
  qrCode: string;
  getQrCode: (username: string) => Promise<void>;
  qrCodeIsLoading: boolean;
  qrCodeError: Error | null;
  resetQrCodeSlice: () => void;
};

export default QrCodeSlice;
