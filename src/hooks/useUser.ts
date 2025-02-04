import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle token refresh
      if (event === 'TOKEN_REFRESHED') {
        // Update the session in localStorage
        if (session) {
          localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        }
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabase.auth.token');
      }
    });

    // Attempt to refresh token on mount
    supabase.auth.refreshSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
} 