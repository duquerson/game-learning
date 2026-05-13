import type { z } from 'zod';

type ActionConfig<TInput> = {
  input?: z.ZodType<TInput>;
  handler: (input: TInput, context: unknown) => Promise<unknown> | unknown;
};

export function defineAction<TInput>(config: ActionConfig<TInput>) {
  return async (input: unknown, context: unknown) => {
    const parsed = config.input?.safeParse(input);
    if (parsed && !parsed.success) {
      return { success: false, error: 'BAD_REQUEST', message: 'Bad request' };
    }

    return config.handler((parsed ? parsed.data : input) as TInput, context);
  };
}
