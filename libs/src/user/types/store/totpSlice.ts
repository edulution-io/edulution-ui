type TotpSlice = {
  setupTotp: (totp: string, totpSecret: string) => Promise<void>;
  totpIsLoading: boolean;
  totpError: Error | null;
  resetTotpSlice: () => void;
};

export default TotpSlice;
