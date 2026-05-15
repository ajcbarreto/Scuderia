import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Apenas servidor (Server Actions, Route Handlers, RSC server-only).
 * `import "server-only"` faz o build estoirar imediatamente se este módulo
 * for puxado para um Client Component — protege a service-role key.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no ambiente.",
    );
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
