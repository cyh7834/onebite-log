import GlobalLoader from "@/components/global-loader";
import supabase from "@/lib/supabase";
import { useSetSession, useIsSessionLoaded } from "@/store/session";
import { useEffect } from "react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    const setSession = useSetSession();
    const isSessionLoaded = useIsSessionLoaded();

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
        });
    }, []);

    if (!isSessionLoaded) {
        return <GlobalLoader></GlobalLoader>;
    }

    return children;
}