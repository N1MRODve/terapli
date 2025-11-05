import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { s as setCookie, u as useRuntimeConfig, a as getHeader } from '../nitro/nitro.mjs';

async function fetchWithRetry(req, init) {
  const retries = 3;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(req, init);
    } catch (error) {
      if (init?.signal?.aborted) {
        throw error;
      }
      if (attempt === retries) {
        console.error(`Error fetching request ${req}`, error, init);
        throw error;
      }
      console.warn(`Retrying fetch attempt ${attempt + 1} for request: ${req}`);
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
    }
  }
  throw new Error("Unreachable code");
}

function setCookies(event, cookies) {
  const response = event.node.res;
  const headersWritable = () => !response.headersSent && !response.writableEnded;
  if (!headersWritable()) {
    return;
  }
  for (const { name, value, options } of cookies) {
    if (!headersWritable()) {
      break;
    }
    setCookie(event, name, value, options);
  }
}

const serverSupabaseClient = async (event) => {
  if (!event.context._supabaseClient) {
    const { url, key, cookiePrefix, cookieOptions, clientOptions: { auth = {}, global = {} } } = useRuntimeConfig(event).public.supabase;
    event.context._supabaseClient = createServerClient(url, key, {
      auth,
      cookies: {
        getAll: () => parseCookieHeader(getHeader(event, "Cookie") ?? ""),
        setAll: (cookies) => setCookies(event, cookies)
      },
      cookieOptions: {
        ...cookieOptions,
        name: cookiePrefix
      },
      global: {
        fetch: fetchWithRetry,
        ...global
      }
    });
  }
  return event.context._supabaseClient;
};

export { fetchWithRetry as f, serverSupabaseClient as s };
//# sourceMappingURL=serverSupabaseClient.mjs.map
