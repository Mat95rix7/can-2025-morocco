  // lib/supabase/server.ts
  import { cookies } from 'next/headers';
  import { createServerClient } from '@supabase/ssr';

  export async function supabaseServer() {
    const cookieStore = await cookies();

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          }
        }
      }
    );
  }

  // lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export const supabaseServer2 = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
