type QrCodeSlice = {
  qrCode: string;
  getQrCode: (username: string, setIsLoading?: boolean) => Promise<void>;
  qrCodeIsLoading: boolean;
  qrCodeError: Error | null;
  resetQrCodeSlice: () => void;
};

export default QrCodeSlice;
