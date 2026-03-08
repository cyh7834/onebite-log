import { useSession } from "@/store/session";
import { Navigate, Outlet } from "react-router";

export default function GuestOnlyLayout() {
    const session = useSession();

    if (session) return <Navigate to={"/"} replace={true}></Navigate>;
    
    return <Outlet></Outlet>;
}