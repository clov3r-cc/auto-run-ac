import { createRequestHandler } from 'react-router';

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

const fetch: ExportedHandlerFetchHandler<Env> = async (request, env, ctx) =>
  requestHandler(request, {
    cloudflare: { env, ctx },
  });

const scheduled: ExportedHandlerScheduledHandler<Env> = async (
  _controller,
  _env,
  _ctx,
) => {
  // TODO: Handle scheduled events if needed
};

export default {
  fetch,
  scheduled,
} satisfies ExportedHandler<Env>;
