import JsonRpcError from '@libs/common/types/jsonRpcError';

interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: JsonRpcError;
}

export default JsonRpcResponse;
