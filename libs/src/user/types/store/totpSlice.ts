type TotpSlice = {
  checkTotp: (otp: string) => Promise<void>;
  setupTotp: (otp: string) => Promise<void>;
  totpIsLoading: boolean;
  totpError: Error | null;
  resetTotpSlice: () => void;
};

export default TotpSlice;
