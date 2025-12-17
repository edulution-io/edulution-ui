import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import McpConfigDto from '@libs/mcp/types/mcpConfigDto';

const mcpConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL'),
  allowedUsers: z.array(z.any()).optional(),
  allowedGroups: z.array(z.any()).optional(),
});

const defaultValues: McpConfigDto = {
  id: '',
  name: '',
  url: '',
  allowedUsers: [],
  allowedGroups: [],
};

const useMcpConfigForm = (isOpen: boolean, selectedConfig: McpConfigDto | null) => {
  const form = useForm<McpConfigDto>({
    resolver: zodResolver(mcpConfigSchema),
    defaultValues,
    mode: 'onChange',
  });

  const lastConfigIdRef = useRef<string | null>(null);

  const resetForm = () => {
    form.reset(defaultValues);
    lastConfigIdRef.current = null;
  };

  const configId = selectedConfig?.id || '';

  useEffect(() => {
    if (!isOpen) {
      lastConfigIdRef.current = null;
      return;
    }

    if (lastConfigIdRef.current === configId) {
      return;
    }

    lastConfigIdRef.current = configId;

    if (selectedConfig && configId) {
      form.reset(
        {
          id: configId,
          name: selectedConfig.name || '',
          url: selectedConfig.url || '',
          allowedUsers: selectedConfig.allowedUsers || [],
          allowedGroups: selectedConfig.allowedGroups || [],
        },
        { keepDefaultValues: false },
      );
    } else {
      form.reset(defaultValues, { keepDefaultValues: false });
    }
  }, [isOpen, configId, selectedConfig?.name, selectedConfig?.url]);

  return { form, resetForm };
};

export default useMcpConfigForm;
