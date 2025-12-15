import { isToolOrDynamicToolUIPart, UIMessage } from 'ai';
import ToolInvocationData from '@libs/chat/types/toolInvocationData';

const extractToolInvocations = (msg: UIMessage): ToolInvocationData[] => {
  const toolParts = msg.parts?.filter(isToolOrDynamicToolUIPart) || [];
  return toolParts.map((part) => {
    if (part.type === 'dynamic-tool') {
      return {
        type: 'tool-invocation' as const,
        toolInvocation: {
          state: part.state,
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args: part.input,
          result: 'output' in part ? part.output : undefined,
        },
      };
    }
    return {
      type: 'tool-invocation' as const,
      toolInvocation: {
        state: part.state,
        toolCallId: part.toolCallId,
        toolName: part.type.replace('tool-', ''),
        args: part.input,
        result: 'output' in part ? part.output : undefined,
      },
    };
  });
};

export default extractToolInvocations;
