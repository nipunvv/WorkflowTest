import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

// On explicit sign-in (Supabase's 'SIGNED_IN' event), send the user to the
// onboarding flow. 'SIGNED_IN' does not fire on session restore ('INITIAL_SESSION')
// or token refresh ('TOKEN_REFRESHED'), so returning users with an existing session
// land on their default authed route instead of being bounced to onboarding.
//
// NOTE: This does not yet skip users who have already completed onboarding —
// that requires a profile-completion flag, tracked as a separate issue.
export function useRedirectOnSignIn() {
  const { replace } = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        replace('/onboarding/step-1' as never);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [replace]);
}
