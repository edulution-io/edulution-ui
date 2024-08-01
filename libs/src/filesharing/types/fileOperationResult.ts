type FileOperationResult = {
  success: boolean;
  message: string;
  status: number;
};

export interface WebdavStatusReplay {
  success: boolean;
  status: number;
  filename?: string;
  data?: string;
}

export default FileOperationResult;
