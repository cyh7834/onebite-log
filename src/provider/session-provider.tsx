import GlobalLoader from "@/components/global-loader";
import { useProfileData } from "@/hooks/queries/use-profile-data";
import supabase from "@/lib/supabase";
import { useSetSession, useIsSessionLoaded, useSession } from "@/store/session";
import { useEffect } from "react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const setSession = useSetSession();
  const isSessionLoaded = useIsSessionLoaded();

  const { data: profile, isLoading: isProfileLoading } = useProfileData(
    session?.user.id,
  );
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
  }, []);

  if (!isSessionLoaded) {
    return <GlobalLoader></GlobalLoader>;
  }

  if (isProfileLoading) return <GlobalLoader></GlobalLoader>;

  return children;
}
