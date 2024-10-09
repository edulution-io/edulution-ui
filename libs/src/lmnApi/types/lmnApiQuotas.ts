export type QuotaInfo = {
  used: number;
  soft_limit: number;
  hard_limit: number;
};

type ErrorInfo = {
  output: string;
  error: string;
  code: number;
};

type QuotaResponse = {
  [key: string]: QuotaInfo | { ERROR: ErrorInfo };
};

export default QuotaResponse;
